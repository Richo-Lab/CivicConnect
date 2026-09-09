const ServiceRequest =
    require("../models/ServiceRequest");

class RequestService {
    constructor(repository) {
        this.repository = repository;
    }

    getAllRequests() {
        return this.repository.findAll();
    }

    createRequest(title, description, category) {
        if (!title || !description || !category) {
            throw new Error(
                "Title, description and category are required"
            );
        }

        const id =
            this.repository.findAll().length + 1;

        const request = new ServiceRequest(
            id,
            title,
            description,
            category
        );

        return this.repository.save(request);
    }
}

module.exports = RequestService;