class RequestController {
    constructor(service) {
        this.service = service;
    }

    getRequests(req, res) {
        try {
            const requests =
                this.service.getAllRequests();

            res.status(200).json({
                success: true,
                count: requests.length,
                data: requests
            });
        } catch (error) {
            res.status(500).json({
                success: false,
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

            res.status(201).json({
                success: true,
                message:
                    "Service request created successfully",
                data: request
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    updateRequest(req, res) {
        try {
            const {
                title,
                description,
                category
            } = req.body;

            const request =
                this.service.updateRequest(
                    req.params.id,
                    title,
                    description,
                    category
                );

            res.status(200).json({
                success: true,
                message:
                    "Service request updated successfully",
                data: request
            });
        } catch (error) {
            if (
                error.message ===
                "Service request not found"
            ) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    getRequestById(req, res) {
        try {
            const request =
                this.service.getRequestById(
                    req.params.id
                );

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = RequestController;