const jwt = require("jsonwebtoken");

/**
 * Authentication & authorisation middleware (Member 3 - Security).
 *
 * authenticateToken -> proves WHO the caller is (401 if not).
 * authorizeRoles    -> checks WHAT the caller may do (403 if not).
 *
 * The secret is read at request time (not at import time) so it always
 * reflects the loaded environment and is never hardcoded in source.
 */
function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            success: false,
            message: "Bearer token required"
        });
    }

    try {
        // Pin the algorithm so a forged "alg: none" token is rejected.
        req.user = jwt.verify(parts[1], getSecret(), {
            algorithms: ["HS256"]
        });
        return next();
    } catch (error) {
        if (error.message === "JWT_SECRET is not configured") {
            console.error(error.message);
            return res.status(500).json({
                success: false,
                message: "Server security configuration error"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
}

module.exports = { authenticateToken, authorizeRoles, getSecret };
