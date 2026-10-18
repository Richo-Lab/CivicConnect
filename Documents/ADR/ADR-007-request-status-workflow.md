# ADR-007: Request status workflow and rules

- **Status:** Accepted (retrospective record: team to confirm)
- **Date:** TBC
- **Deciders:** TBC
- **Related:** M2 traceability label "ADR-004: Status Management"

## Context
FR-005 requires staff to update a request "through defined statuses", and FR-007 requires resolution and closure. The M1 risk for these is data and workflow integrity.

## Alternatives considered
**TBC: no alternatives were documented in M1/M2.** (For example, free-form status changes, or more than three statuses.)

## Decision
A fixed workflow Submitted → In Progress → Resolved, enforced by the service layer:
- a request must be assigned before work can start;
- an invalid transition returns 409;
- a Resolved request cannot be reopened, edited or reassigned;
- the assignee must be an existing STAFF or ADMIN user.

## Trade-offs and risks
Protects workflow integrity, but is rigid: there is no Closed or Rejected status, and no resolution note is recorded (FR-007 is only partially met).

## Consequences (observed)
Rules are covered by tests (unassigned request cannot start; resolved request cannot reopen or be edited; assignment validation). Status history is recorded and readable through the history endpoint.

## Requirements affected
FR-004, FR-005, FR-007, FR-003.

## Evidence
`ALLOWED_TRANSITIONS` and the business rules in `services/RequestService.js`; `tests/requests.test.js`; `tests/request-service.node.cjs`.
