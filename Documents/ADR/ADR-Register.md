# CivicConnect – Architecture Decision Records (ADR) Register

Location: `docs/adr/`. One file per decision. Referenced from PED v4.0 (section 6) and `RTM.md` (section 3).

Records are never rewritten. When a decision changes, the old record's status becomes **Superseded** and a new record explains the change (original decision → problem found → revised decision → consequence). Items marked **TBC** need information only the team has.

## Register

| ID | Decision | Status | Requirements affected | Superseded by |
|---|---|---|---|---|
| [ADR-001](ADR-001-modular-monolith-architecture.md) | Modular monolith, layered backend | Accepted | All | – |
| [ADR-002](ADR-002-backend-framework.md) | Spring Boot as backend framework | Superseded | All | ADR-006 |
| [ADR-003](ADR-003-database-postgresql.md) | PostgreSQL relational database | Superseded | NFR-003, FR-001 to FR-009 | ADR-006 |
| [ADR-004](ADR-004-rest-api.md) | REST API with consistent HTTP status codes | Accepted | FR-001 to FR-009 | – |
| [ADR-005](ADR-005-authentication-rbac.md) | Backend authentication and role-based authorisation | Accepted | NFR-001, NFR-002 | – |
| [ADR-006](ADR-006-change-backend-stack.md) | Change of backend stack to Node.js/Express (CHG-001) | Accepted (retrospective, TBC) | All | – |
| [ADR-007](ADR-007-request-status-workflow.md) | Request status workflow and rules | Accepted (retrospective, TBC) | FR-004, FR-005, FR-007 | – |
| [ADR-008](ADR-008-in-memory-repositories.md) | In-memory repositories as interim persistence | Accepted (interim), carried as technical debt | NFR-003 | – |

## Numbering and mapping to the M2 traceability table

The M2 document used two numbering schemes. This register uses the numbering of the full ADR table in the M2 document (ADR-001 to ADR-005 with full content) as authoritative, and adds ADR-006 to ADR-008 for decisions made during construction. The labels in the M2 RTM traceability table map as follows:

| M2 traceability label | Now recorded as |
|---|---|
| ADR-001: API Architecture | ADR-004 (REST API) and ADR-001 (architecture) |
| ADR-008: Authentication/RBAC | ADR-005 |
| ADR-010: Database Selection | ADR-003, superseded by ADR-006 and ADR-008 |
| ADR-004: Status Management | ADR-007 |
| ADR-002 History/Audit, ADR-003 Assignment Model, ADR-005 Activity Recording, ADR-006 Query Design, ADR-007 Reporting Approach, ADR-009 Data Protection | No written decision record exists in the M1/M2 document. **TBC: team to either write records or note these were design labels only.** |

## Template for new records

```
# ADR-0NN: Title
Status: Proposed | Accepted | Superseded by ADR-0MM
Date: YYYY-MM-DD
Deciders: names
Context / problem
Alternatives considered
Decision and rationale
Trade-offs and risks
Consequences (observed in the final product)
Requirements affected (RTM IDs)
Evidence (files, commits, tests)
```
