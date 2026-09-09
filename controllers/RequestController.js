class RequestController {
    constructor(service) {
        this.service = service;
    }

    getRequests(req, res) {
        const requests = this.service.getAllRequests();

        res.json(requests);
    }

    createRequest(req, res) {
        try {
            const { title, description, category } = req.body;

            const request = this.service.createRequest(
                title,
                description,
                category
            );

            res.status(201).json(request);
        } catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
    }
}

module.exports = RequestController;