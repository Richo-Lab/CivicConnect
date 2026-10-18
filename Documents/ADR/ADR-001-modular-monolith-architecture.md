# ADR-001: Modular monolith with a layered backend

- **Status:** Accepted
- **Date:** TBC (M2 baseline)
- **Deciders:** Virtual Group H (Dominic Smith, Richo Labuschagne, Oratile Nare)
- **Source:** M1/M2 document, section 1.6 (ADR table)

## Context
CivicConnect needs a maintainable backend for users, service requests, reporting and future change, within limited time, team capability and budget (M1 constraints). Risk R-007: the chosen architecture may be unnecessarily complex.

## Alternatives considered
Traditional monolith, modular monolith, microservices.

## Decision and rationale
A modular monolith. It separates responsibilities into logical modules without the communication, deployment and testing overhead of distributed services (Su and Li, 2024; Faustino et al., 2024).

## Trade-offs and risks
Simpler deployment and testing, but less independently scalable than microservices. Modules may become tightly coupled if boundaries are not maintained.

## Consequences (observed)
The backend is organised into controllers, services, repositories, models and middleware, which makes individual components testable (services are tested directly in `tests/request-service.node.cjs` and through the API in `tests/requests.test.js`). The single deployable unit kept CI simple. **TBC: team to note any coupling problem encountered.**

## Requirements affected
All (architecture baseline). See RTM.md section 3.

## Evidence
`controllers/`, `services/`, `repositories/`, `models/`, `middleware/`, `server.js`.
