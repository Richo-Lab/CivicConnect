# ADR-002: Spring Boot as backend framework

- **Status:** Superseded by [ADR-006](ADR-006-change-backend-stack.md)
- **Date:** TBC (M2 baseline)
- **Deciders:** Virtual Group H
- **Source:** M1/M2 document, section 1.6 and 1.4

## Context
The team needed a framework supporting API development, security, testing and maintainability. Risks R-002, R-008 and R-013: limited team experience with the selected technologies.

## Alternatives considered
Node.js/Express, Spring Boot, ASP.NET Core.

## Decision and rationale
Spring Boot (Java) with JUnit, because it provides a structured environment for REST services, security and testing. The M1 technology matrix scored Stack B (Java, PostgreSQL, JUnit) 4.10 out of 5 against 4.05 for Stack A (React, Node.js, Jest, MongoDB), a small difference that depended on team capability.

## Trade-offs and risks
A structured framework but a learning curve and possible configuration errors.

## Consequences (observed)
The final implementation does not use Spring Boot. The decision was replaced during construction; see ADR-006 for the change, its reason and its effects.

## Requirements affected
All.
