# ADR-008: In-memory repositories as interim persistence

- **Status:** Accepted as interim; carried as technical debt
- **Date:** TBC
- **Deciders:** TBC

## Context
The team needed working API behaviour and tests before database integration was complete. The README records "in-memory repositories (MongoDB persistence being added)".

## Alternatives considered
Integrate the database first. **TBC: why this was not done first.**

## Decision
Keep `RequestRepository` and `UserRepository` in memory behind a repository layer, so persistence could be swapped without changing services or controllers (ADR-001).

## Trade-offs and risks
Fast to build and easy to test, but all users and requests are lost on restart, and the Mongo schemas in `Schemas/` are not used.

## Consequences (observed)
- NFR-003 (reliable data storage) is Not Met in the candidate final build.
- No persistence or restart tests exist.
- This is the largest single gap in Scope Completion (see RTM.md section 6 and PED v4.0 section 2.4).

## Future work
Connect the repositories to the database, add `mongoose` to `package.json`, add persistence tests, and update NFR-003 in the RTM.

## Requirements affected
NFR-003 (Not Met); indirectly FR-001 to FR-009.

## Evidence
`repositories/RequestRepository.js`, `repositories/UserRepository.js`, `Schemas/`, `package.json`, README (Known limitations).
