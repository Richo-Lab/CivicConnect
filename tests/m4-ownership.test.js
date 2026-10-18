
process.env.JWT_SECRET = "test-secret-only-for-jest";
process.env.SEED_ADMIN_PASSWORD = "AdminPass#1";
process.env.SEED_STAFF_PASSWORD = "StaffPass#1";
process.env.SEED_CITIZEN_PASSWORD = "CitizenPass#1";

const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../server");

const token = (userId, role) => jwt.sign(
    {
        userId,
        role,
        email: `fixture-${userId}@civicconnect.local`
    },
    process.env.JWT_SECRET,
    {
        algorithm: "HS256",
        expiresIn: "1h"
    }
);

const first = token(3, "CITIZEN");
const other = token(99, "CITIZEN");
const staff = token(2, "STAFF");

const auth = t => ({
    Authorization: `Bearer ${t}`
});

let id;

beforeAll(async () => {
    const created = await request(app)
        .post("/api/requests")
        .set(auth(first))
        .send({
            title: "PRIVATE-M4-ROAD",
            description: "Road damaged near the school",
            category: "Roads"
        });

    expect(created.status).toBe(201);
    id = created.body.data.id;
});

test("M4-API-01 other citizen cannot view details or history", async () => {
    for (const suffix of [
        "",
        "/history",
        "/comments"
    ]) {
        const res = await request(app)
            .get(`/api/requests/${id}${suffix}`)
            .set(auth(other));

        expect(res.status).toBe(404);
    }
});

test("M4-API-02 other citizen cannot add comment", async () => {
    const res = await request(app)
        .post(`/api/requests/${id}/comments`)
        .set(auth(other))
        .send({
            comment: "Unauthorized"
        });

    expect(res.status).toBe(404);
});

test("M4-API-03 list and search do not reveal record", async () => {
    for (const url of [
        "/api/requests",
        "/api/requests/search?term=PRIVATE-M4-ROAD"
    ]) {
        const res = await request(app)
            .get(url)
            .set(auth(other));

        expect(res.status).toBe(200);

        expect(
            res.body.data.some(x => x.id === id)
        ).toBe(false);
    }
});

test("M4-API-04 owner and staff retain access", async () => {
    for (const t of [first, staff]) {
        const res = await request(app)
            .get(`/api/requests/${id}`)
            .set(auth(t));

        expect(res.status).toBe(200);
    }
});

test("M4-API-05 authentication and invalid IDs remain enforced", async () => {
    const noAuth = await request(app)
        .get(`/api/requests/${id}`);

    expect(noAuth.status).toBe(401);

    const badId = await request(app)
        .get("/api/requests/invalid")
        .set(auth(first));

    expect(badId.status).toBe(400);
});
