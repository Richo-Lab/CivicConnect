# ADR-003: PostgreSQL as relational database

- **Status:** Superseded by [ADR-006](ADR-006-change-backend-stack.md) (see also [ADR-008](ADR-008-in-memory-repositories.md))
- **Date:** TBC (M2 baseline)
- **Deciders:** Virtual Group H (database design: Richo Labuschagne)
- **Source:** M1/M2 document, section 1.6, section 3 (data model, ERD)

## Context
CivicConnect holds related data: users, roles, requests, categories, statuses and request history. Requirement NFR-003 (reliable data storage) and risk R-010 (database design may not support relationships and integrity).

## Alternatives considered
PostgreSQL, MongoDB.

## Decision and rationale
PostgreSQL, because relational keys and constraints enforce referential integrity at database level (Codd, 1970; PostgreSQL, 2026). Accepted trade-off: less schema flexibility than MongoDB.

## Trade-offs and risks
Strong consistency, but a poor design could affect performance as data grows.

## Consequences (observed)
- The ERD and data model were produced in M2 (M1/M2 document, section 3.1.1).
- The repository contains schema definitions for users, roles, service requests, statuses, categories, status history, actions, attachments and notifications in `Schemas/` (Mongoose style, not relational).
- PostgreSQL was not implemented. The running build stores data in memory (ADR-008), so NFR-003 is not met.

## Requirements affected
NFR-003 (Not Met), all functional requirements that store data. See RTM.md.
