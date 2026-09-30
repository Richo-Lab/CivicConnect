const bcrypt = require("bcryptjs");

/**
 * In-memory user store (same approach as RequestRepository).
 * Only password HASHES are stored - never plain-text passwords.
 *
 * TODO (Member 2): replace the internals with the MongoDB `User` schema
 * (Schemas/Users.js). AuthService only depends on findByEmail(), so no
 * other code has to change.
 */
class UserRepository {
    constructor() {
        this.users = [];
        this.nextId = 1;
    }

    addUser({ name, surname, email, password, role }) {
        const user = {
            id: this.nextId++,
            name,
            surname,
            email: email.trim().toLowerCase(),
            passwordHash: bcrypt.hashSync(password, 10),
            role
        };
        this.users.push(user);
        return user;
    }

    findByEmail(email) {
        if (typeof email !== "string") return undefined;
        return this.users.find(u => u.email === email.trim().toLowerCase());
    }

    /**
     * Seeds demo users ONLY from environment variables, so no password
     * is ever committed to the repository.
     */
    seedFromEnv(env = process.env) {
        const demo = [
            ["ADMIN", "Admin", "admin@civicconnect.local", env.SEED_ADMIN_PASSWORD],
            ["STAFF", "Staff", "staff@civicconnect.local", env.SEED_STAFF_PASSWORD],
            ["CITIZEN", "Citizen", "citizen@civicconnect.local", env.SEED_CITIZEN_PASSWORD]
        ];

        for (const [role, name, email, password] of demo) {
            if (password) {
                this.addUser({ name, surname: "Demo", email, password, role });
            } else {
                console.warn(`No SEED_${role}_PASSWORD set - ${role} demo user not created`);
            }
        }
    }
}

module.exports = UserRepository;
