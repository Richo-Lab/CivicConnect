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

        if (!request)
            throw new Error("Request not found");

        return request;
    }

    createRequest(title, description, category) {

        if (!title || !description || !category)
            throw new Error(
                "Title, description and category are required"
            );

        const id =
            this.repository.findAll().length + 1;

        const request =
            new ServiceRequest(
                id,
                title,
                description,
                category
            );

        return this.repository.save(request);
    }

    assignRequest(id, staff) {

        const request =
            this.getRequestById(id);

        request.assignedTo = staff;
        request.updatedAt = new Date();

        return this.repository.update(id, request);
    }

    updateStatus(id, status) {

        const request =
            this.getRequestById(id);

        request.status = status;
        request.updatedAt = new Date();

        return this.repository.update(id, request);
    }

    addComment(id, comment) {

        const request =
            this.getRequestById(id);

        request.comments.push({
            message: comment,
            createdAt: new Date()
        });

        request.updatedAt = new Date();

        return this.repository.update(id, request);
    }

    resolveRequest(id, resolution) {

        const request =
            this.getRequestById(id);

        request.status = "Resolved";
        request.resolution = resolution;
        request.updatedAt = new Date();

        return this.repository.update(id, request);
    }

    searchRequests(keyword) {
        return this.repository.search(keyword);
    }

    getReport() {

        const requests =
            this.repository.findAll();

        return {

            totalRequests:
                requests.length,

            submitted:
                requests.filter(
                    r => r.status === "Submitted"
                ).length,

            inProgress:
                requests.filter(
                    r => r.status === "In Progress"
                ).length,

            resolved:
                requests.filter(
                    r => r.status === "Resolved"
                ).length
        };
    }
}

module.exports = RequestService;
