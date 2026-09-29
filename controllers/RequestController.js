class RequestController {

    constructor(service) {
        this.service = service;
    }

    getRequests(req, res) {

        const search = req.query.search;

        if (search)
            return res.json(
                this.service.searchRequests(search)
            );

        res.json(
            this.service.getAllRequests()
        );
    }

    getRequest(req, res) {

        try {

            res.json(
                this.service.getRequestById(req.params.id)
            );

        } catch (error) {

            res.status(404).json({
                message: error.message
            });

        }
    }

    createRequest(req, res) {

        try {

            const {
                title,
                description,
                category
            } = req.body;

            const request =
                this.service.createRequest(
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

    assignRequest(req, res) {

        try {

            res.json(
                this.service.assignRequest(
                    req.params.id,
                    req.body.staff
                )
            );

        } catch (error) {

            res.status(404).json({
                message: error.message
            });

        }
    }

    updateStatus(req, res) {

        try {

            res.json(
                this.service.updateStatus(
                    req.params.id,
                    req.body.status
                )
            );

        } catch (error) {

            res.status(404).json({
                message: error.message
            });

        }
    }

    addComment(req, res) {

        try {

            res.json(
                this.service.addComment(
                    req.params.id,
                    req.body.comment
                )
            );

        } catch (error) {

            res.status(404).json({
                message: error.message
            });

        }
    }

    resolveRequest(req, res) {

        try {

            res.json(
                this.service.resolveRequest(
                    req.params.id,
                    req.body.resolution
                )
            );

        } catch (error) {

            res.status(404).json({
                message: error.message
            });

        }
    }

    getReport(req, res) {

        res.json(
            this.service.getReport()
        );
    }
}

module.exports = RequestController;
