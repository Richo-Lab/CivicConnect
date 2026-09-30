# CivicConnect
CivicConnect is a project for SEN381, the project is to design a controlled digital platform that provides a reliable, traceable and usable way to submit, manage, monitor and report on service requests using Software Engineering Concepts

## Current Status (Milestone 2)
- Express REST API with in-memory repositories (MongoDB persistence being added by Member 2).
- Authentication: JWT login with bcrypt-hashed passwords. Role-based access control (CITIZEN / STAFF / ADMIN).

## Prerequisites
- Node.js 18+ and npm

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and set `JWT_SECRET` (long random string) and the `SEED_*_PASSWORD` values. **Never commit `.env`.**
3. `npm start` (server runs on http://localhost:3000)

## Demo users (created at startup from your `.env` passwords)
| Email | Role |
|---|---|
| admin@civicconnect.local | ADMIN |
| staff@civicconnect.local | STAFF |
| citizen@civicconnect.local | CITIZEN |

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Any logged-in user |
| GET | /api/requests, /api/requests/:id | CITIZEN, STAFF, ADMIN |
| POST | /api/requests | CITIZEN, STAFF, ADMIN |
| PUT | /api/requests/:id | STAFF, ADMIN |

Send the token as `Authorization: Bearer <token>`.
Status codes: 400 invalid input, 401 missing/invalid/expired token or bad credentials, 403 role not permitted, 404 not found.

## Security design
- Passwords stored only as bcrypt hashes (bcryptjs, cost 10); never returned by the API.
- JWT (HS256, 1h expiry) signed with `JWT_SECRET` from the environment; algorithm pinned on verify.
- Login returns one generic error for wrong email or wrong password (prevents user enumeration).
- Layers: `middleware/auth.js` (401/403) -> `controllers/AuthController.js` -> `services/AuthService.js` -> `repositories/UserRepository.js`.

## Running tests
`npm test` (Jest + Supertest, see `tests/auth.test.js`)

## Known limitations / TODO
- Users are in memory; Member 2 to swap `UserRepository` to the MongoDB `User` schema.
- No registration, refresh tokens, rate limiting or account lockout yet (deferred).
