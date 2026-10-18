process.env.JWT_SECRET = "test-secret-only-for-jest";
process.env.SEED_ADMIN_PASSWORD = "AdminPass#1";
process.env.SEED_STAFF_PASSWORD = "StaffPass#1";
process.env.SEED_CITIZEN_PASSWORD = "CitizenPass#1";

const request = require("supertest");
const app = require("../server");

const RequestRepository = require("../repositories/RequestRepository");
const RequestService = require("../services/RequestService");
const UserRepository = require("../repositories/UserRepository");

const data = {
    title: "Broken streetlight",
    description: "Pole near community centre",
    category: "Electricity"
};

let citizen;
let staff;
let admin;

const auth = token => ({
    Authorization: `Bearer ${token}`
});

const create = (token = citizen, body = data) =>
    request(app)
        .post("/api/requests")
        .set(auth(token))
        .send(body);

const patch = (url, body, token = staff) =>
    request(app)
        .patch(url)
        .set(auth(token))
        .send(body);

beforeAll(async () => {
    const logIn = async (email, password) =>
        (
            await request(app)
                .post("/api/auth/login")
                .send({ email, password })
        ).body.token;

    citizen = await logIn(
        "citizen@civicconnect.local",
        "CitizenPass#1"
    );

    staff = await logIn(
        "staff@civicconnect.local",
        "StaffPass#1"
    );

    admin = await logIn(
        "admin@civicconnect.local",
        "AdminPass#1"
    );
});

describe("Unit and component tests", () => {
    const service = new RequestService(
        new RequestRepository(),
        new UserRepository()
    );

    test("rejects non-string titles", () => {
        expect(() =>
            service.createRequest(123, "Valid", "Roads")
        ).toThrow(/Title is required/);
    });

    test("rejects whitespace descriptions", () => {
        expect(() =>
            service.createRequest("Title", "   ", "Roads")
        ).toThrow(/Description is required/);
    });

    test("accepts a 120-character title", () => {
        const item = service.createRequest(
            "T".repeat(120),
            "Description",
            "Roads"
        );

        expect(item.title).toHaveLength(120);
    });

    test("rejects a 121-character title", () => {
        expect(() =>
            service.createRequest(
                "T".repeat(121),
                "Description",
                "Roads"
            )
        ).toThrow(/120/);
    });

    test("rejects non-numeric request IDs", () => {
        expect(() =>
            service.getRequestById("abc")
        ).toThrow(/Invalid service request ID/);
    });

    test("status requires assignment", () => {
        const item = service.createRequest(
            "New",
            "Details",
            "Roads"
        );

        expect(() =>
            service.changeStatus(item.id, "In Progress", 2)
        ).toThrow(/Assign/);
    });
});

describe("Black-box and API tests", () => {
    test("GET requests requires login", async () => {
        const res = await request(app).get("/api/requests");
        expect(res.status).toBe(401);
    });

    test("citizen creates a Submitted request", async () => {
        const res = await create();

        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("Submitted");
        expect(res.body.data.id).toEqual(expect.any(Number));
    });

    test("missing title returns 400", async () => {
        const res = await create(citizen, {
            description: "x",
            category: "Roads"
        });

        expect(res.status).toBe(400);
    });

    test("numeric title returns 400", async () => {
        const res = await create(citizen, {
            ...data,
            title: 5
        });

        expect(res.status).toBe(400);
    });

    test("unknown request returns 404", async () => {
        const res = await request(app)
            .get("/api/requests/999999")
            .set(auth(citizen));

        expect(res.status).toBe(404);
    });

    test("invalid request ID returns 400", async () => {
        const res = await request(app)
            .get("/api/requests/wrong")
            .set(auth(citizen));

        expect(res.status).toBe(400);
    });

    test("malformed JSON returns 400", async () => {
        const res = await request(app)
            .post("/api/requests")
            .set(auth(citizen))
            .set("Content-Type", "application/json")
            .send('{"title":');

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Malformed JSON/);
    });

    test("citizen cannot assign requests", async () => {
        const id = (await create()).body.data.id;

        const res = await patch(
            `/api/requests/${id}/assignment`,
            { assignedTo: 2 },
            citizen
        );

        expect(res.status).toBe(403);
    });

    test("cannot assign a citizen as staff", async () => {
        const id = (await create()).body.data.id;

        const res = await patch(
            `/api/requests/${id}/assignment`,
            { assignedTo: 3 }
        );

        expect(res.status).toBe(400);
    });

    test("staff can assign another staff member", async () => {
        const id = (await create()).body.data.id;

        const res = await patch(
            `/api/requests/${id}/assignment`,
            { assignedTo: 2 }
        );

        expect(res.status).toBe(200);
        expect(res.body.data.assignedTo).toBe(2);
    });

    test("unassigned requests cannot start", async () => {
        const id = (await create()).body.data.id;

        const res = await patch(
            `/api/requests/${id}/status`,
            { status: "In Progress" }
        );

        expect(res.status).toBe(409);
    });

    test("comments require nonempty text", async () => {
        const id = (await create()).body.data.id;

        const res = await request(app)
            .post(`/api/requests/${id}/comments`)
            .set(auth(citizen))
            .send({ comment: " " });

        expect(res.status).toBe(400);
    });

    test("search is case-insensitive", async () => {
        await create(citizen, {
            ...data,
            title: "UNIQUEstreetlightTAG"
        });

        const res = await request(app)
            .get("/api/requests/search?term=uniquestreetlighttag")
            .set(auth(citizen));

        expect(res.status).toBe(200);

        expect(
            res.body.data.some(
                item => item.title === "UNIQUEstreetlightTAG"
            )
        ).toBe(true);
    });

    test("blank search returns 400", async () => {
        const res = await request(app)
            .get("/api/requests/search?term=%20")
            .set(auth(citizen));

        expect(res.status).toBe(400);
    });

    test("citizen cannot access report", async () => {
        const res = await request(app)
            .get("/api/requests/report")
            .set(auth(citizen));

        expect(res.status).toBe(403);
    });

    test("admin can access report", async () => {
        const res = await request(app)
            .get("/api/requests/report")
            .set(auth(admin));

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBeGreaterThanOrEqual(0);
        expect(res.body.data.byStatus).toHaveProperty("Submitted");
    });
});

describe("Integration and system journeys", () => {
    test("submit, assign, progress and resolve", async () => {
        const created = await create();
        const id = created.body.data.id;

        expect(created.status).toBe(201);

        expect(
            (await patch(
                `/api/requests/${id}/assignment`,
                { assignedTo: 2 }
            )).status
        ).toBe(200);

        expect(
            (await patch(
                `/api/requests/${id}/status`,
                { status: "In Progress" }
            )).status
        ).toBe(200);

        const resolved = await patch(
            `/api/requests/${id}/resolve`,
            {}
        );

        expect(resolved.status).toBe(200);
        expect(resolved.body.data.resolvedAt).toBeTruthy();

        const detail = await request(app)
            .get(`/api/requests/${id}`)
            .set(auth(citizen));

        expect(detail.body.data.status).toBe("Resolved");

        const history = await request(app)
            .get(`/api/requests/${id}/history`)
            .set(auth(citizen));

        expect(history.status).toBe(200);

        expect(
            history.body.data.map(h => h.to)
        ).toEqual([
            "Submitted",
            "In Progress",
            "Resolved"
        ]);
    });

    test("citizen comments and staff retrieves", async () => {
        const id = (await create()).body.data.id;

        const posted = await request(app)
            .post(`/api/requests/${id}/comments`)
            .set(auth(citizen))
            .send({ comment: "Please repair soon" });

        expect(posted.status).toBe(201);

        const fetched = await request(app)
            .get(`/api/requests/${id}/comments`)
            .set(auth(staff));

        expect(fetched.status).toBe(200);

        expect(fetched.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    text: "Please repair soon"
                })
            ])
        );
    });

    test("resolved requests cannot reopen or be edited", async () => {
        const id = (await create()).body.data.id;

        await patch(
            `/api/requests/${id}/assignment`,
            { assignedTo: 2 }
        );

        await patch(
            `/api/requests/${id}/status`,
            { status: "In Progress" }
        );

        await patch(
            `/api/requests/${id}/resolve`,
            {}
        );

        const reopened = await patch(
            `/api/requests/${id}/status`,
            { status: "Submitted" }
        );

        expect(reopened.status).toBe(409);

        const edited = await request(app)
            .put(`/api/requests/${id}`)
            .set(auth(staff))
            .send(data);

        expect(edited.status).toBe(409);
    });
});
