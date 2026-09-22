class ServiceRequest {
    constructor(
        id,
        title,
        description,
        category
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = "Submitted";
    }

    updateDetails(
        title,
        description,
        category
    ) {
        this.title = title;
        this.description = description;
        this.category = category;
    }
}

module.exports = ServiceRequest;