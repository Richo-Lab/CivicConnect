process.env.JWT_SECRET = "test-secret-only-for-jest";
process.env.SEED_ADMIN_PASSWORD = "AdminPass#1";
process.env.SEED_STAFF_PASSWORD = "StaffPass#1";
process.env.SEED_CITIZEN_PASSWORD = "CitizenPass#1";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = require("../server");
const UserRepository = require("../repositories/UserRepository");

const login = (email, password) =>
    request(app).post("/api/auth/login").send({ email, password });

const tokenFor = async (email, password) =>
    (await login(email, password)).body.token;

const validRequest = {
    title: "Pothole",
    description: "Large pothole on Main Rd",
    category: "Roads"
};

describe("Login", () => {
    test("valid credentials return 200 and a JWT with the role", async () => {
        const res = await login("admin@civicconnect.local", "AdminPass#1");
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(jwt.decode(res.body.token).role).toBe("ADMIN");
        expect(res.body.user.passwordHash).toBeUndefined();
    });

    test("wrong password returns 401", async () => {
        const res = await login("admin@civicconnect.local", "wrong");
        expect(res.status).toBe(401);
    });

    test("unknown email returns the SAME 401 message (no user enumeration)", async () => {
        const a = await login("nobody@x.com", "whatever");
        const b = await login("admin@civicconnect.local", "wrong");
        expect(a.status).toBe(401);
        expect(a.body.message).toBe(b.body.message);
    });

    test("missing fields return 400", async () => {
        const res = await request(app).post("/api/auth/login").send({});
        expect(res.status).toBe(400);
    });
});

describe("Password hashing", () => {
    test("stored value is a bcrypt hash, not the plain password", () => {
        const repo = new UserRepository();
        const u = repo.addUser({
            name: "T", surname: "U", email: "t@u.com",
            password: "Plain#123", role: "CITIZEN"
        });
        expect(u.passwordHash).not.toContain("Plain#123");
        expect(u.passwordHash.startsWith("$2")).toBe(true);
        expect(bcrypt.compareSync("Plain#123", u.passwordHash)).toBe(true);
    });
});

describe("Authentication (401)", () => {
    test("no token -> 401", async () => {
        expect((await request(app).get("/api/requests")).status).toBe(401);
    });

    test("garbage token -> 401", async () => {
        const res = await request(app).get("/api/requests")
            .set("Authorization", "Bearer not.a.token");
        expect(res.status).toBe(401);
    });

    test("expired token -> 401", async () => {
        const expired = jwt.sign(
            { userId: 1, role: "ADMIN" },
            process.env.JWT_SECRET,
            { expiresIn: -10 }
        );
        const res = await request(app).get("/api/requests")
            .set("Authorization", `Bearer ${expired}`);
        expect(res.status).toBe(401);
    });

    test("token signed with a different secret -> 401", async () => {
        const forged = jwt.sign({ userId: 1, role: "ADMIN" }, "attacker-secret");
        const res = await request(app).get("/api/requests")
            .set("Authorization", `Bearer ${forged}`);
        expect(res.status).toBe(401);
    });
});

describe("Role-based access control (403)", () => {
    test("citizen can create and view requests", async () => {
        const t = await tokenFor("citizen@civicconnect.local", "CitizenPass#1");
        const created = await request(app).post("/api/requests")
            .set("Authorization", `Bearer ${t}`).send(validRequest);
        expect(created.status).toBe(201);
        const list = await request(app).get("/api/requests")
            .set("Authorization", `Bearer ${t}`);
        expect(list.status).toBe(200);
    });

    test("citizen CANNOT update a request -> 403", async () => {
        const t = await tokenFor("citizen@civicconnect.local", "CitizenPass#1");
        const res = await request(app).put("/api/requests/1")
            .set("Authorization", `Bearer ${t}`).send(validRequest);
        expect(res.status).toBe(403);
    });

    test("staff CAN update a request -> 200", async () => {
        const t = await tokenFor("staff@civicconnect.local", "StaffPass#1");
        const res = await request(app).put("/api/requests/1")
            .set("Authorization", `Bearer ${t}`)
            .send({ ...validRequest, title: "Pothole (fixed)" });
        expect(res.status).toBe(200);
    });
});

describe("Input validation (protected endpoint)", () => {
    test("missing title -> 400", async () => {
        const t = await tokenFor("staff@civicconnect.local", "StaffPass#1");
        const res = await request(app).post("/api/requests")
            .set("Authorization", `Bearer ${t}`)
            .send({ description: "x", category: "y" });
        expect(res.status).toBe(400);
    });
});

describe("/api/auth/me", () => {
    test("returns identity for a valid token", async () => {
        const t = await tokenFor("staff@civicconnect.local", "StaffPass#1");
        const res = await request(app).get("/api/auth/me")
            .set("Authorization", `Bearer ${t}`);
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe("STAFF");
    });
});
