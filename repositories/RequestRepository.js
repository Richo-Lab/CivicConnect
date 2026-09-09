class RequestRepository {
    constructor() {
        this.requests = [];
    }

    findAll() {
        return this.requests;
    }

    save(request) {
        this.requests.push(request);

        return request;
    }
}

module.exports = RequestRepository;