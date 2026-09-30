const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getSecret } = require("../middleware/auth");

// Compared against when the email is unknown, so "no such user" and
// "wrong password" take similar time (mitigates user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /** Returns { token, user } or throws Error("Invalid email or password"). */
    login(email, password) {
        const user = this.userRepository.findByEmail(email);
        const hash = user ? user.passwordHash : DUMMY_HASH;
        const match = bcrypt.compareSync(password, hash);

        if (!user || !match) {
            // Same message for both cases - never reveal which part was wrong.
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            getSecret(),
            { algorithm: "HS256", expiresIn: "1h" }
        );

        return {
            token,
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
}

module.exports = AuthService;
