# ADR-005: Backend authentication and role-based authorisation

- **Status:** Accepted
- **Date:** TBC (M2 baseline; implementation detail added during construction)
- **Deciders:** Virtual Group H
- **Source:** M1/M2 document, sections 1.6 and 2

## Context
CivicConnect holds personal and operational information that only authorised users may access (NFR-001, NFR-002). Risk R-009: incorrect authentication or RBAC design could expose unauthorised data.

## Alternatives considered
Session-based authentication, JWT, external identity provider.

## Decision and rationale
Backend authentication with role-based authorisation, enforced on the server rather than relying on frontend controls (Sandhu et al., 1996). Passwords are stored only as adaptive password hashes (Biryukov, Dinu and Khovratovich, 2016). The M2 document did not fix the token mechanism.

## Detail decided during construction
JWT (HS256, 1 hour expiry, algorithm pinned on verification) signed with a secret from the environment; passwords hashed with bcrypt (bcryptjs, cost 10); one generic login error for wrong email or wrong password to prevent user enumeration; roles CITIZEN, STAFF and ADMIN (M1 roles Requester, Staff, Management). **TBC: team to record why JWT was chosen over sessions.**

## Trade-offs and risks
Stronger access control, but incorrect configuration could allow unauthorised access. Deferred: registration, refresh tokens, rate limiting and account lockout.

## Consequences (observed)
Role-level access is enforced and tested (401 for missing, invalid, expired and wrongly signed tokens; 403 for forbidden roles). The decision did not include per-user (object-level) scoping, so any authenticated user can currently read all requests. This is why NFR-002 is only partially met. See RTM.md.

## Requirements affected
NFR-001 (Met), NFR-002 (Partially Met).

## Evidence
`middleware/auth.js`, `services/AuthService.js`, `tests/auth.test.js`, README security design.
