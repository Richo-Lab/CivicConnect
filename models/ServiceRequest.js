class ServiceRequest {
    constructor(id, title, description, category, createdBy = null) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;

        this.status = "Submitted";
        this.createdBy = createdBy;
        this.assignedTo = null;

        this.comments = [];

        this.statusHistory = [{
            from: null,
            to: "Submitted",
            by: createdBy,
            at: new Date().toISOString()
        }];

        this.createdAt = new Date().toISOString();
        this.resolvedAt = null;
    }

    updateDetails(title, description, category) {
        this.title = title;
        this.description = description;
        this.category = category;
    }

    changeStatus(status, by) {
        const previous = this.status;

        this.status = status;

        this.statusHistory.push({
            from: previous,
            to: status,
            by,
            at: new Date().toISOString()
        });

        if (status === "Resolved") {
            this.resolvedAt = new Date().toISOString();
        }
    }
}

module.exports = ServiceRequest;
