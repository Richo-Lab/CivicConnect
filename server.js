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
app.use(express.json());

const repository = new RequestRepository();
const service = new RequestService(repository);
const controller = new RequestController(service);

const userRepository = new UserRepository();
userRepository.seedFromEnv();
const authController = new AuthController(new AuthService(userRepository));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "CivicConnect API is running"
    });
});

// --- Authentication (public login, protected identity check) ---
app.post("/api/auth/login", authController.login.bind(authController));
app.get("/api/auth/me", authenticateToken, authController.me.bind(authController));

// --- Service requests: every route requires a valid token; RBAC per action ---
app.get("/api/requests", authenticateToken,
    authorizeRoles("CITIZEN", "STAFF", "ADMIN"),
    controller.getRequests.bind(controller));
app.post("/api/requests", authenticateToken,
    authorizeRoles("CITIZEN", "STAFF", "ADMIN"),
    controller.createRequest.bind(controller));

app.get("/api/requests/:id", authenticateToken,
    authorizeRoles("CITIZEN", "STAFF", "ADMIN"),
    controller.getRequestById.bind(controller));
app.put("/api/requests/:id", authenticateToken,
    authorizeRoles("STAFF", "ADMIN"),
    controller.updateRequest.bind(controller));

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (lets tests import `app`).
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CivicConnect server running on port ${PORT}`);
    });
}

module.exports = app;
