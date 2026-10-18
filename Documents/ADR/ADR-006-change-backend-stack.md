# ADR-006: Change of backend stack to Node.js/Express (CHG-001)

- **Status:** Accepted (retrospective record: team to confirm)
- **Date:** TBC
- **Deciders:** TBC
- **Supersedes:** ADR-002, ADR-003

## Original decision
Java, Spring Boot, PostgreSQL and JUnit (ADR-002, ADR-003, M1/M2 document).

## Problem found during implementation
**TBC: the team must record the real reason for the change, with evidence** (for example team skills, setup time, tooling, or risks R-002/R-008/R-013 materialising). No written reason exists in the M1/M2 document or the repository.

## Revised decision
Node.js with Express for the backend, Jest and Supertest for automated tests, and Mongoose-style schema definitions for MongoDB. This corresponds to Stack A in the M1 technology comparison (4.05 against 4.10 for the original stack).

## Alternatives
Continue with Spring Boot and PostgreSQL. **TBC: why this was not feasible.**

## Consequences (observed)
- Backend, API and tests were delivered on the new stack (39 Jest and 7 node:test checks pass on the candidate commit).
- CI runs on Node.js 22 with `npm ci`, a dependency audit and a secrets check.
- The MongoDB schemas exist in `Schemas/`, but `mongoose` is not a dependency and the running build uses in-memory repositories (ADR-008), so NFR-003 is not met.
- The ERD and relational design from M2 were not carried into a relational implementation.

## Requirements affected
All; NFR-003 most directly. See RTM.md section 3 (CHG-001) and PED v4.0 section 2.3.

## Evidence
`package.json`, `.github/workflows/ci.yml`, `Schemas/`, `tests/`.
