const express = require("express");
require("dotenv").config({ quiet: true });

const RequestRepository = require("./repositories/RequestRepository");
const RequestService = require("./services/RequestService");
const RequestController = require("./controllers/RequestController");
const UserRepository = require("./repositories/UserRepository");
const AuthService = require("./services/AuthService");
const AuthController = require("./controllers/AuthController");

const {
    authenticateToken,
    authorizeRoles
} = require("./middleware/auth");

// M4: Request ownership and confidentiality protection
const {
    requireRequestOwner
} = require("./middleware/requestAccess");

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

// M4: Citizens may access only their own requests.
// STAFF and ADMIN retain authorised management access.
const ownRequest = requireRequestOwner(repository);

// API health endpoint
app.get("/", (req, res) =>
    res.status(200).json({
        message: "CivicConnect API is running"
    })
);

// ============================================
// AUTHENTICATION
// ============================================

app.post(
    "/api/auth/login",
    authController.login.bind(authController)
);

app.get(
    "/api/auth/me",
    loggedIn,
    authController.me.bind(authController)
);

// ============================================
// REQUEST LISTING AND CREATION
// ============================================

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

// ============================================
// SEARCH AND REPORTING
// These must appear before /api/requests/:id
// ============================================

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

// ============================================
// REQUEST DETAILS AND EDITING
// ============================================

// M4: Ownership verification before showing details
app.get(
    "/api/requests/:id",
    loggedIn,
    anyRole,
    ownRequest,
    controller.getRequestById.bind(controller)
);

// Only STAFF and ADMIN can edit request details
app.put(
    "/api/requests/:id",
    loggedIn,
    workerRole,
    controller.updateRequest.bind(controller)
);

// ============================================
// ASSIGNMENT AND STATUS MANAGEMENT
// ============================================

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

// ============================================
// REQUEST COMMENTS
// ============================================

// M4: Prevent citizens from commenting on
// requests belonging to another citizen
app.post(
    "/api/requests/:id/comments",
    loggedIn,
    anyRole,
    ownRequest,
    controller.addComment.bind(controller)
);

// M4: Protect request comment confidentiality
app.get(
    "/api/requests/:id/comments",
    loggedIn,
    anyRole,
    ownRequest,
    controller.getComments.bind(controller)
);

// ============================================
// REQUEST STATUS HISTORY
// ============================================

// M4: Protect request history from
// unauthorised citizen access
app.get(
    "/api/requests/:id/history",
    loggedIn,
    anyRole,
    ownRequest,
    controller.getHistory.bind(controller)
);

// ============================================
// ERROR HANDLING
// ============================================

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

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `CivicConnect server running on port ${PORT}`
        );
    });
}

module.exports = app;
