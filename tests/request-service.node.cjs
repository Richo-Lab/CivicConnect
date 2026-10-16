const test = require("node:test");
const assert = require("node:assert/strict");

const RequestRepository = require("../repositories/RequestRepository");
const RequestService = require("../services/RequestService");

function fixture() {
    const users = {
        findById: id =>
            id === 2
                ? { id: 2, role: "STAFF" }
                : undefined
    };

    return new RequestService(
        new RequestRepository(),
        users
    );
}

test("creates and retrieves a submitted request", () => {
    const service = fixture();

    const item = service.createRequest(
        "Pothole",
        "Road damage",
        "Roads",
        1
    );

    assert.equal(
        service.getRequestById(item.id).status,
        "Submitted"
    );
});

test("rejects non-string titles", () => {
    assert.throws(
        () => fixture().createRequest(7, "Details", "Roads"),
        /Title is required/
    );
});

test("checks the title length boundary", () => {
    const service = fixture();

    assert.equal(
        service.createRequest(
            "a".repeat(120),
            "Details",
            "Roads"
        ).title.length,
        120
    );

    assert.throws(
        () => service.createRequest(
            "a".repeat(121),
            "Details",
            "Roads"
        ),
        /120/
    );
});

test("requires assignment before progress", () => {
    const service = fixture();

    const item = service.createRequest(
        "Pothole",
        "Details",
        "Roads"
    );

    assert.throws(
        () => service.changeStatus(
            item.id,
            "In Progress",
            2
        ),
        /Assign/
    );
});

test("supports assignment and resolution", () => {
    const service = fixture();

    const item = service.createRequest(
        "Pothole",
        "Details",
        "Roads"
    );

    service.assignRequest(item.id, 2, 1);
    service.changeStatus(item.id, "In Progress", 2);
    service.resolveRequest(item.id, 2);

    assert.equal(item.status, "Resolved");
    assert.ok(item.resolvedAt);

    assert.deepEqual(
        service.getHistory(item.id).map(h => h.to),
        ["Submitted", "In Progress", "Resolved"]
    );
});

test("supports comments, searching and reporting", () => {
    const service = fixture();

    const item = service.createRequest(
        "Streetlight",
        "Pole damaged",
        "Electricity"
    );

    service.addComment(item.id, "Please fix", 1);

    assert.equal(
        service.getComments(item.id)[0].text,
        "Please fix"
    );

    assert.equal(
        service.search("STREETLIGHT")[0].id,
        item.id
    );

    assert.deepEqual(service.getReport(), {
        total: 1,
        byStatus: {
            Submitted: 1,
            "In Progress": 0,
            Resolved: 0
        }
    });
});

test("rejects invalid requests and assignees", () => {
    const service = fixture();

    const item = service.createRequest(
        "Pothole",
        "Details",
        "Roads"
    );

    assert.throws(
        () => service.getRequestById("xyz"),
        { status: 400 }
    );

    assert.throws(
        () => service.getRequestById(999),
        { status: 404 }
    );

    assert.throws(
        () => service.assignRequest(item.id, 3, 1),
        { status: 400 }
    );
});
