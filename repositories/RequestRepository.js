class RequestRepository {

    constructor() {
        this.requests = [];
    }

    findAll() {
        return this.requests;
    }

    findById(id) {
        return this.requests.find(r => r.id === Number(id));
    }

    save(request) {
        this.requests.push(request);
        return request;
    }

    update(id, request) {

        const index =
            this.requests.findIndex(r => r.id === Number(id));

        if (index === -1)
            return null;

        this.requests[index] = request;

        return request;
    }

    search(keyword) {

        if (!keyword)
            return this.requests;

        const query = keyword.toLowerCase();

        return this.requests.filter(r =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.category.toLowerCase().includes(query)
        );
    }
}

module.exports = RequestRepository;
