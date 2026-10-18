const { visibleRequests } = require("../middleware/requestAccess");
class RequestController {
    constructor(service) {
        this.service = service;
    }

    fail(res, error) {
        const status = error.status || 500;

        if (status >= 500) {
            console.error("Request operation failed:", error);
        }

        return res.status(status).json({
            success: false,
            message: status >= 500
                ? "Internal server error"
                : error.message
        });
    }

    getRequests(req, res) {
        try {
            const data = visibleRequests(
    this.service.getAllRequests(),
    req.user
);

            return res.status(200).json({
                success: true,
                count: data.length,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    getRequestById(req, res) {
        try {
            const data = this.service.getRequestById(req.params.id);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    createRequest(req, res) {
        try {
            const { title, description, category } = req.body || {};

            const data = this.service.createRequest(
                title,
                description,
                category,
                req.user.userId
            );

            return res.status(201).json({
                success: true,
                message: "Service request created successfully",
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    updateRequest(req, res) {
        try {
            const { title, description, category } = req.body || {};

            const data = this.service.updateRequest(
                req.params.id,
                title,
                description,
                category
            );

            return res.status(200).json({
                success: true,
                message: "Service request updated successfully",
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    assignRequest(req, res) {
        try {
            const data = this.service.assignRequest(
                req.params.id,
                req.body?.assignedTo,
                req.user.userId
            );

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    updateStatus(req, res) {
        try {
            const data = this.service.changeStatus(
                req.params.id,
                req.body?.status,
                req.user.userId
            );

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    resolveRequest(req, res) {
        try {
            const data = this.service.resolveRequest(
                req.params.id,
                req.user.userId
            );

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    addComment(req, res) {
        try {
            const data = this.service.addComment(
                req.params.id,
                req.body?.comment,
                req.user.userId
            );

            return res.status(201).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    getComments(req, res) {
        try {
            const data = this.service.getComments(req.params.id);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    getHistory(req, res) {
        try {
            const data = this.service.getHistory(req.params.id);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    searchRequests(req, res) {
        try {
            const data = visibleRequests(
    this.service.search(req.query.term),
    req.user
);

            return res.status(200).json({
                success: true,
                count: data.length,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    getReport(req, res) {
        try {
            const data = this.service.getReport();

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return this.fail(res, error);
        }
    }
}

module.exports = RequestController;
