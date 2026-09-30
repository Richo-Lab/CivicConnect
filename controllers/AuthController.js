/**
 * HTTP layer for authentication. Validates input and maps results to
 * status codes; the actual logic lives in AuthService.
 */
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login(req, res) {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        try {
            const { token, user } = this.authService.login(email, password);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user
            });
        } catch (error) {
            if (error.message === "Invalid email or password") {
                return res.status(401).json({ success: false, message: error.message });
            }
            console.error("Login error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Returns the identity carried by the verified token.
    me(req, res) {
        return res.status(200).json({ success: true, user: req.user });
    }
}

module.exports = AuthController;
