
const test = require("node:test");
const assert = require("node:assert/strict");

const RequestRepository = require("../repositories/RequestRepository");
const RequestService = require("../services/RequestService");
const RequestController = require("../controllers/RequestController");

const {
    visibleRequests,
    requireRequestOwner
} = require("../middleware/requestAccess");

function fixture() {
    const repository = new RequestRepository();
    const service = new RequestService(repository);

    const a = service.createRequest(
        "Broken light",
        "Pole near school",
        "Electricity",
        3
    );

    const b = service.createRequest(
        "Blocked drain",
        "Drain is blocked",
        "Water",
        99
    );

    return {
        repository,
        service,
        controller: new RequestController(service),
        a,
        b
    };
}

function response() {
    return {
        code: null,
        body: null,

        status(code) {
            this.code = code;
            return this;
        },

        json(body) {
            this.body = body;
            return this;
        }
    };
}

function checkGuard(repository, user, id) {
    const res = response();
    let passed = false;

    requireRequestOwner(repository)(
        {
            user,
            params: { id: String(id) }
        },
        res,
        () => {
            passed = true;
        }
    );

    return { res, passed };
}

test("M4-REG-01 citizen list includes only their requests", () => {
    const f = fixture();
    const res = response();

    f.controller.getRequests({
        user: { role: "CITIZEN", userId: 3 }
    }, res);

    assert.equal(res.code, 200);

    assert.deepEqual(
        res.body.data.map(x => x.id),
        [f.a.id]
    );
});

test("M4-REG-02 staff list retains operational access", () => {
    const f = fixture();
    const res = response();

    f.controller.getRequests({
        user: { role: "STAFF", userId: 2 }
    }, res);

    assert.equal(res.body.count, 2);
});

test("M4-REG-03 citizen search cannot disclose other records", () => {
    const f = fixture();
    const res = response();

    f.controller.searchRequests({
        user: { role: "CITIZEN", userId: 3 },
        query: { term: "drain" }
    }, res);

    assert.equal(res.code, 200);
    assert.deepEqual(res.body.data, []);
});

test("M4-REG-04 another citizen gets 404", () => {
    const f = fixture();

    const result = checkGuard(
        f.repository,
        { role: "CITIZEN", userId: 3 },
        f.b.id
    );

    assert.equal(result.res.code, 404);
    assert.equal(result.passed, false);
});

test("M4-REG-05 owner, staff and admin retain access", () => {
    const f = fixture();

    for (const user of [
        { role: "CITIZEN", userId: 3 },
        { role: "STAFF", userId: 2 },
        { role: "ADMIN", userId: 1 }
    ]) {
        assert.equal(
            checkGuard(
                f.repository,
                user,
                f.a.id
            ).passed,
            true
        );
    }
});

test("M4-REG-06 invalid IDs follow existing validation", () => {
    const f = fixture();

    assert.equal(
        checkGuard(
            f.repository,
            { role: "CITIZEN", userId: 3 },
            "oops"
        ).passed,
        true
    );

    assert.throws(
        () => f.service.getRequestById("oops"),
        { status: 400 }
    );
});

test("M4-REG-07 missing identity fails closed", () => {
    const f = fixture();

    assert.deepEqual(
        visibleRequests(
            f.repository.findAll(),
            undefined
        ),
        []
    );

    const result = checkGuard(
        f.repository,
        { role: "CITIZEN" },
        f.a.id
    );

    assert.equal(result.res.code, 403);
});
