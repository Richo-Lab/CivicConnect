const ServiceRequest = require("../models/ServiceRequest");

const ALLOWED_TRANSITIONS = {
    Submitted: ["In Progress"],
    "In Progress": ["Resolved"],
    Resolved: []
};

class RequestService {
    constructor(repository, userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    getAllRequests() {
        return this.repository.findAll();
    }

    getRequestById(id) {
        if (
            !Number.isSafeInteger(Number(id)) ||
            Number(id) < 1 ||
            !/^\d+$/.test(String(id))
        ) {
            const error = new Error("Invalid service request ID");
            error.status = 400;
            throw error;
        }

        const item = this.repository.findById(id);

        if (!item) {
            const error = new Error("Service request not found");
            error.status = 404;
            throw error;
        }

        return item;
    }

    createRequest(title, description, category, createdBy = null) {
        this.validateRequestDetails(
            title,
            description,
            category
        );

        const item = new ServiceRequest(
            this.repository.generateId(),
            title.trim(),
            description.trim(),
            category.trim(),
            createdBy
        );

        return this.repository.save(item);
    }

    updateRequest(id, title, description, category) {
        this.validateRequestDetails(
            title,
            description,
            category
        );

        const item = this.getRequestById(id);

        if (item.status === "Resolved") {
            const error = new Error(
                "Resolved requests cannot be edited"
            );
            error.status = 409;
            throw error;
        }

        item.updateDetails(
            title.trim(),
            description.trim(),
            category.trim()
        );

        return this.repository.update(item);
    }

    assignRequest(id, assignedTo, by) {
        const item = this.getRequestById(id);

        if (item.status === "Resolved") {
            const error = new Error(
                "Resolved requests cannot be reassigned"
            );
            error.status = 409;
            throw error;
        }

        if (
            !Number.isSafeInteger(assignedTo) ||
            assignedTo < 1
        ) {
            const error = new Error(
                "assignedTo must be a positive integer user ID"
            );
            error.status = 400;
            throw error;
        }

        const user = this.userRepository?.findById(assignedTo);

        if (
            !user ||
            !["STAFF", "ADMIN"].includes(user.role)
        ) {
            const error = new Error(
                "Assignee must be an existing STAFF or ADMIN user"
            );
            error.status = 400;
            throw error;
        }

        item.assignedTo = assignedTo;
        item.assignedBy = by;

        return this.repository.update(item);
    }

    changeStatus(id, status, by) {
        const item = this.getRequestById(id);

        if (
            typeof status !== "string" ||
            !ALLOWED_TRANSITIONS[item.status]?.includes(status)
        ) {
            const error = new Error(
                `Invalid status transition from ${item.status}`
            );
            error.status = 409;
            throw error;
        }

        if (
            status === "In Progress" &&
            item.assignedTo == null
        ) {
            const error = new Error(
                "Assign the request before starting work"
            );
            error.status = 409;
            throw error;
        }

        item.changeStatus(status, by);

        return this.repository.update(item);
    }

    resolveRequest(id, by) {
        return this.changeStatus(id, "Resolved", by);
    }

    addComment(id, comment, by) {
        const item = this.getRequestById(id);

        if (
            typeof comment !== "string" ||
            !comment.trim() ||
            comment.length > 1000
        ) {
            const error = new Error(
                "Comment is required and must be at most 1000 characters"
            );
            error.status = 400;
            throw error;
        }

        const entry = {
            id: item.comments.length + 1,
            text: comment.trim(),
            by,
            at: new Date().toISOString()
        };

        item.comments.push(entry);
        this.repository.update(item);

        return entry;
    }

    getComments(id) {
        return this.getRequestById(id).comments;
    }

    getHistory(id) {
        return this.getRequestById(id).statusHistory;
    }

    search(term) {
        if (
            typeof term !== "string" ||
            !term.trim()
        ) {
            const error = new Error(
                "Search term is required"
            );
            error.status = 400;
            throw error;
        }

        const needle = term.trim().toLowerCase();

        return this.getAllRequests().filter(item =>
            [
                item.title,
                item.description,
                item.category
            ].some(value =>
                value.toLowerCase().includes(needle)
            )
        );
    }

    getReport() {
        const items = this.getAllRequests();

        const byStatus = {
            Submitted: 0,
            "In Progress": 0,
            Resolved: 0
        };

        for (const item of items) {
            byStatus[item.status] =
                (byStatus[item.status] || 0) + 1;
        }

        return {
            total: items.length,
            byStatus
        };
    }

    validateRequestDetails(title, description, category) {
        for (const [label, value, max] of [
            ["Title", title, 120],
            ["Description", description, 2000],
            ["Category", category, 60]
        ]) {
            if (
                typeof value !== "string" ||
                !value.trim() ||
                value.length > max
            ) {
                const error = new Error(
                    `${label} is required and must be at most ${max} characters`
                );
                error.status = 400;
                throw error;
            }
        }
    }
}

module.exports = RequestService;
