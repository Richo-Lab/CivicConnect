# ADR-004: REST API with consistent HTTP status codes

- **Status:** Accepted
- **Date:** TBC (M2 baseline)
- **Deciders:** Virtual Group H
- **Source:** M1/M2 document, sections 1.5 to 1.7

## Context
The frontend and backend need a consistent communication method. Risk R-011: API integration may introduce compatibility problems.

## Alternatives considered
REST, GraphQL.

## Decision and rationale
REST. The required operations map onto standard HTTP methods and resources, and a uniform interface supports consistent integration and testing (Fielding, 2000).

## Trade-offs and risks
Simple and widely supported, but complex views may need several requests. Poor endpoint design could cause security or maintenance problems.

## Consequences (observed)
Resource-oriented routes under `/api/auth` and `/api/requests`, including assignment, status, resolve, comments, history, search and report. Status codes used: 400 invalid input, 401 authentication failure, 403 role not permitted, 404 not found, 409 invalid state (for example an invalid status transition). Each is covered by tests in `tests/requests.test.js` and `tests/auth.test.js`.

## Requirements affected
FR-001 to FR-009.

## Evidence
`server.js`, `controllers/RequestController.js`, `tests/requests.test.js`.
