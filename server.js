const express = require("express");
require("dotenv").config({ quiet: true });

const RequestRepository = require("./repositories/RequestRepository");
const RequestService = require("./services/RequestService");
const RequestController = require("./controllers/RequestController");
const UserRepository = require("./repositories/UserRepository");
const AuthService = require("./services/AuthService");
const AuthController = require("./controllers/AuthController");
const { authenticateToken, authorizeRoles } = require("./middleware/auth");

const app = express();
app.use(express.json({ limit: "32kb" }));

const userRepository = new UserRepository();
userRepository.seedFromEnv();

const authController = new AuthController(
    new AuthService(userRepository)
);

const repository = new RequestRepository();
const controller = new RequestController(
    new RequestService(repository, userRepository)
);

const loggedIn = authenticateToken;
const anyRole = authorizeRoles("CITIZEN", "STAFF", "ADMIN");
const workerRole = authorizeRoles("STAFF", "ADMIN");

app.get("/", (req, res) =>
    res.status(200).json({
        message: "CivicConnect API is running"
    })
);

// Authentication
app.post(
    "/api/auth/login",
    authController.login.bind(authController)
);

app.get(
    "/api/auth/me",
    loggedIn,
    authController.me.bind(authController)
);

// Request listing and creation
app.get(
    "/api/requests",
    loggedIn,
    anyRole,
    controller.getRequests.bind(controller)
);

app.post(
    "/api/requests",
    loggedIn,
    anyRole,
    controller.createRequest.bind(controller)
);

// Search and report routes must be before /:id
app.get(
    "/api/requests/search",
    loggedIn,
    anyRole,
    controller.searchRequests.bind(controller)
);

app.get(
    "/api/requests/report",
    loggedIn,
    workerRole,
    controller.getReport.bind(controller)
);

// Request details and editing
app.get(
    "/api/requests/:id",
    loggedIn,
    anyRole,
    controller.getRequestById.bind(controller)
);

app.put(
    "/api/requests/:id",
    loggedIn,
    workerRole,
    controller.updateRequest.bind(controller)
);

// Assignment and status management
app.patch(
    "/api/requests/:id/assignment",
    loggedIn,
    workerRole,
    controller.assignRequest.bind(controller)
);

app.patch(
    "/api/requests/:id/status",
    loggedIn,
    workerRole,
    controller.updateStatus.bind(controller)
);

app.patch(
    "/api/requests/:id/resolve",
    loggedIn,
    workerRole,
    controller.resolveRequest.bind(controller)
);

// Comments
app.post(
    "/api/requests/:id/comments",
    loggedIn,
    anyRole,
    controller.addComment.bind(controller)
);

app.get(
    "/api/requests/:id/comments",
    loggedIn,
    anyRole,
    controller.getComments.bind(controller)
);

// Status history
app.get(
    "/api/requests/:id/history",
    loggedIn,
    anyRole,
    controller.getHistory.bind(controller)
);

// Handle invalid JSON
app.use((error, req, res, next) => {
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            success: false,
            message: "Malformed JSON request body"
        });
    }

    if (error.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Request body is too large"
        });
    }

    return next(error);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CivicConnect server running on port ${PORT}`);
    });
}

module.exports = app;
