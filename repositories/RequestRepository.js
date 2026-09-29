class RequestRepository {
    constructor() {
        this.requests = [];
        this.nextId = 1;
    }

    findAll() {
        return this.requests;
    }

    findById(id) {
        return this.requests.find(
            request => request.id === Number(id)
        );
    }

    save(request) {
        this.requests.push(request);
        this.nextId++;

        return request;
    }

    update(request) {
        const index =
            this.requests.findIndex(
                existingRequest =>
                    existingRequest.id === request.id
            );

        if (index === -1) {
            return null;
        }

        this.requests[index] = request;

        return request;
    }

    generateId() {
        return this.nextId;
    }
}

module.exports = RequestRepository;