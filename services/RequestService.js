const ServiceRequest =
    require("../models/ServiceRequest");

class RequestService {
    constructor(repository) {
        this.repository = repository;
    }

    getAllRequests() {
        return this.repository.findAll();
    }

    getRequestById(id) {
        const request =
            this.repository.findById(id);

        if (!request) {
            throw new Error(
                "Service request not found"
            );
        }

        return request;
    }

    createRequest(
        title,
        description,
        category
    ) {
        this.validateRequestDetails(
            title,
            description,
            category
        );

        const id =
            this.repository.generateId();

        const request =
            new ServiceRequest(
                id,
                title.trim(),
                description.trim(),
                category.trim()
            );

        return this.repository.save(request);
    }

    updateRequest(
        id,
        title,
        description,
        category
    ) {
        this.validateRequestDetails(
            title,
            description,
            category
        );

        const request =
            this.getRequestById(id);

        request.updateDetails(
            title.trim(),
            description.trim(),
            category.trim()
        );

        return this.repository.update(
            request
        );
    }

    validateRequestDetails(
        title,
        description,
        category
    ) {
        if (
            !title ||
            !title.trim()
        ) {
            throw new Error(
                "Title is required"
            );
        }

        if (
            !description ||
            !description.trim()
        ) {
            throw new Error(
                "Description is required"
            );
        }

        if (
            !category ||
            !category.trim()
        ) {
            throw new Error(
                "Category is required"
            );
        }
    }
}

module.exports = RequestService;