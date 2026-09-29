class ServiceRequest {

    constructor(id, title, description, category) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;

        this.status = "Submitted";
        this.assignedTo = null;
        this.comments = [];
        this.resolution = null;

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

module.exports = ServiceRequest;
