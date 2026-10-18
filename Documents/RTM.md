# CivicConnect – Requirements Traceability Matrix (RTM)

**Project:** SEN381 CivicConnect, Virtual Group H
**Team:** Dominic Smith (602596), Richo Labuschagne (601759), Oratile Nare (600511)
**Repository:** https://github.com/Richo-Lab/CivicConnect
**RTM status:** Living document, continued from the M1 baseline. It is extended at each milestone, not recreated.

| Field | Value |
|---|---|
| RTM version | v4.0 Final (draft: update fields marked **TBC** before submission) |
| Assessed baseline (commit / tag) | **TBC** (frozen final commit on `main`) |
| Implementation references checked against | `main` @ `2fe286b` (16 Oct 2026). **Re-verify every reference on the final commit.** |
| Referenced from | PED v4.0, section 3 |

**Trace chain:** Stakeholder Need → Requirement → Acceptance Criterion → Design Decision / ADR → Implementation → Test Case(s) → Expected Result → Execution Evidence → Defect / Status → Final Outcome

---

## 1. Conventions

- **Baseline:** 12 requirements (FR-001 to FR-009, NFR-001 to NFR-003), each with one acceptance criterion (AC), taken from the M1 RTM baseline. The Scope Completion denominator is **12** unless an approved change alters it.
- **Priority mapping for M4:** High = Must, Medium = Should.
- **AC status:** Met = 1.0, Partially Met = 0.5, Not Met = 0.0.
- **Final outcome categories:** IMPLEMENTED, PARTIALLY IMPLEMENTED, NOT IMPLEMENTED, CHANGED/REMOVED THROUGH APPROVED CHANGE.
- **Role mapping:** the M1 roles Requester, Staff and Management correspond to `CITIZEN`, `STAFF` and `ADMIN` in the implementation (**TBC: confirm**).
- **ADR numbering:** the M2 section 5.1.2 trace uses ADR-001 to ADR-010 (API Architecture … Database Selection) while the M2 ADR table uses ADR-001 to ADR-005 (Architecture, Framework, Database, API, Authentication). **TBC: the team must confirm one authoritative list and align the references below.**
- A requirement is only marked Met when execution evidence exists. A working screen is not evidence of acceptance.

---

## 2. M1 Requirements Baseline (carried forward unchanged)

| Req. ID | Stakeholder | Requirement | Priority (M4 mapping) | Type | Acceptance Criterion | Risk / Constraint |
|---|---|---|---|---|---|---|
| FR-001 | Requester | Submit a service request | High (Must) | Functional | Requester can submit a request and receive confirmation | Scope / usability |
| FR-002 | Requester | View submitted requests and status | High (Must) | Functional | Requester can view their requests and current status | Privacy / security |
| FR-003 | Requester | View request history | Medium (Should) | Functional | Requester can view the history of their requests | Data availability |
| FR-004 | Staff | Assign requests | High (Must) | Functional | Staff can assign a request to an authorised staff member | RBAC |
| FR-005 | Staff | Update request status | High (Must) | Functional | Staff can update a request through defined statuses | Data integrity |
| FR-006 | Staff | Add comments/actions | Medium (Should) | Functional | Staff can record relevant actions and comments | Auditability |
| FR-007 | Staff | Record resolution and close request | High (Must) | Functional | Staff can record a resolution and close the request | Workflow integrity |
| FR-008 | Management | Search and filter requests | Medium (Should) | Functional | Management/staff can locate requests using defined criteria | Performance |
| FR-009 | Management | View management information/reporting | Medium (Should) | Functional | Management can access relevant service information | Data accuracy |
| NFR-001 | All users | Only authorised users may access appropriate functions | High (Must) | Non-functional | Access is restricted according to user role | Security |
| NFR-002 | All users | Protect sensitive information | High (Must) | Non-functional | Sensitive information is protected from unauthorised access | POPIA / security |
| NFR-003 | System Owner | System should provide reliable data storage | High (Must) | Non-functional | Data can be stored and retrieved reliably | Availability / recovery |

---

## 3. M2 Architecture and Design Trace (carried forward from M2)

| Req. ID | Architecture / Design Element | Backend Component | Design Decision / ADR (as recorded in M2) |
|---|---|---|---|
| FR-001 | Request Management Architecture | Request API / Request Service | ADR-001: API Architecture |
| FR-002 | Request Management Architecture | Request Service | ADR-001: API Architecture |
| FR-003 | Request Management Architecture | Request History Service | ADR-002: History/Audit Design |
| FR-004 | Request Management Architecture | Assignment Service | ADR-003: Assignment Model |
| FR-005 | Request Management Architecture | Request Service | ADR-004: Status Management |
| FR-006 | Request Management Architecture | Comment / Action Service | ADR-005: Activity Recording |
| FR-007 | Request Management Architecture | Resolution Service | ADR-004: Status Management |
| FR-008 | Request Management Architecture | Search / Request Service | ADR-006: Query Design |
| FR-009 | Reporting Architecture | Reporting Service | ADR-007: Reporting Approach |
| NFR-001 | Security Architecture | Authentication & Authorisation Service | ADR-008: Authentication/RBAC |
| NFR-002 | Security/Data Architecture | Data Access / Security Layer | ADR-009: Data Protection |
| NFR-003 | Data Architecture | Database / Data Access Layer | ADR-010: Database Selection |

### Controlled changes affecting this trace

| Change ID | Original decision | Change | Reference |
|---|---|---|---|
| CHG-001 | Java, Spring Boot, PostgreSQL, JUnit (M1/M2 technology decisions) | Node.js/Express, MongoDB schemas, Jest (**TBC: confirm final stack**) | **TBC** (ADR/change record, PED v3.0 section 3) |

---

## 4. Implementation, Verification and Final Status (M3 → M4)

Implementation references below are the files and routes found on `main` @ `2fe286b`. **TBC** means no evidence has been confirmed yet. Update each row from the final commit; do not leave inferred statuses.

| Req. ID | Implementation / Component | Test Case(s) | Expected Result | Execution Evidence | Defect / Status | Final AC Status | Final Outcome |
|---|---|---|---|---|---|---|---|
| FR-001 | `POST /api/requests`, `controllers/RequestController.js`, `services/RequestService.js`, `repositories/RequestRepository.js` | TC-10, TC-13 | Authenticated user can create a request; request with missing title is rejected with 400. Confirmation / reference returned: **TBC** | **TBC** (CI run / report) | **TBC** | **TBC** | **TBC** |
| FR-002 | `GET /api/requests`, `GET /api/requests/:id` | TC-10 | Authenticated user can retrieve requests. Requester sees only own requests and current status: **TBC, not evidenced** | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-003 | `Schemas/RequestStatusHistory.js` defined; no history endpoint seen on `main` | None | Requester can view history of their requests | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-004 | `assignedID` in `Schemas/ServiceRequests.js`; no dedicated assignment endpoint seen on `main` | None | Staff can assign a request to an authorised staff member | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-005 | `PUT /api/requests/:id` restricted to `STAFF`/`ADMIN` | TC-11, TC-12 | Staff update succeeds (200); citizen update is forbidden (403). Defined status workflow: **TBC, not evidenced** | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-006 | `Schemas/RequestActions.js` defined; no endpoint seen on `main` | None | Staff can record actions and comments | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-007 | `resolvedAt` / `closedAt` in `Schemas/ServiceRequests.js`; no resolution endpoint seen on `main` | None | Staff can record a resolution and close the request | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-008 | None seen on `main` | None | Management/staff can search and filter requests | **TBC** | **TBC** | **TBC** | **TBC** |
| FR-009 | None seen on `main` | None | Management can access service information/reports | **TBC** | **TBC** | **TBC** | **TBC** |
| NFR-001 | `middleware/auth.js` (`authenticateToken`, `authorizeRoles`), per-route role rules in `server.js` | TC-06, TC-07, TC-08, TC-09, TC-11, TC-12 | Missing, invalid, expired or wrongly signed token returns 401; role not permitted returns 403; permitted role succeeds | **TBC** | **TBC** | **TBC** | **TBC** |
| NFR-002 | bcrypt password hashing and generic login error in `services/AuthService.js`; JWT (HS256, 1h expiry); secrets from `.env` | TC-01, TC-02, TC-03, TC-05 | Stored password is a bcrypt hash; wrong password and unknown email return the same 401 message (no user enumeration). Authorisation of data per user: **TBC, not evidenced** | **TBC** | **TBC** | **TBC** | **TBC** |
| NFR-003 | Schema definitions in `Schemas/`, `Connection.js`; repositories are in-memory on `main`; `mongoose` is not listed in `package.json` on `main` | None | Data can be stored and retrieved reliably (persistence) | **TBC** | **TBC** | **TBC** | **TBC** |

---

## 5. Test Case Catalogue (existing suite: `tests/auth.test.js`)

These are the 14 tests present on `main` @ `2fe286b`. Add tests from other branches and the final commit, and record a result for each.

| Test ID | Test (as named in the suite) | Level / Type | Supports | Result | Run evidence |
|---|---|---|---|---|---|
| TC-01 | Valid credentials return 200 and a JWT with the role | API / functional | NFR-002, NFR-001 | **TBC** | **TBC** |
| TC-02 | Wrong password returns 401 | API / negative | NFR-002 | **TBC** | **TBC** |
| TC-03 | Unknown email returns the same 401 message (no user enumeration) | API / negative, security | NFR-002 | **TBC** | **TBC** |
| TC-04 | Missing login fields return 400 | API / negative | NFR-002 | **TBC** | **TBC** |
| TC-05 | Stored value is a bcrypt hash, not the plain password | Unit / security | NFR-002 | **TBC** | **TBC** |
| TC-06 | No token returns 401 | API / negative | NFR-001 | **TBC** | **TBC** |
| TC-07 | Garbage token returns 401 | API / negative | NFR-001 | **TBC** | **TBC** |
| TC-08 | Expired token returns 401 | API / negative | NFR-001 | **TBC** | **TBC** |
| TC-09 | Token signed with a different secret returns 401 | API / negative | NFR-001 | **TBC** | **TBC** |
| TC-10 | Citizen can create and view requests | API / integration | FR-001, FR-002 | **TBC** | **TBC** |
| TC-11 | Citizen cannot update a request (403) | API / negative, RBAC | FR-005, NFR-001 | **TBC** | **TBC** |
| TC-12 | Staff can update a request (200) | API / RBAC | FR-005, NFR-001 | **TBC** | **TBC** |
| TC-13 | Missing title returns 400 | API / validation | FR-001 | **TBC** | **TBC** |
| TC-14 | `/api/auth/me` returns identity for a valid token | API | NFR-001 | **TBC** | **TBC** |

---

## 6. Scope Completion Calculation

**Scope Completion % = (sum of AC scores ÷ 12 applicable approved acceptance criteria) × 100**

| AC status | Count | Value each | Subtotal |
|---|---|---|---|
| Met | **TBC** | 1.0 | **TBC** |
| Partially Met | **TBC** | 0.5 | **TBC** |
| Not Met | **TBC** | 0.0 | 0.0 |
| **Total** | 12 | | **TBC** ÷ 12 = **TBC**% |

Target: at least 80%, with every Must requirement either Met or justified. Worked example: 8 Met, 2 Partially Met and 2 Not Met gives (8 + 1) ÷ 12 = 75%.

---

## 7. Open Defects and Limitations Affecting Acceptance Criteria

| Defect ID | Affects (Req. / AC) | Severity | Status | Fix / Reverification evidence |
|---|---|---|---|---|
| **TBC** | **TBC** | **TBC** | **TBC** | **TBC** |

Known limitation recorded in the repository README: user registration, refresh tokens, rate limiting and account lockout are deferred (**TBC: confirm still deferred and where approved**).

---

## 8. RTM Version History

| Version | Milestone | What changed |
|---|---|---|
| v1.0 | M1 | Requirements baseline: stakeholder, requirement, priority, type, acceptance criterion, risk/constraint (section 2) |
| v2.0 | M2 | Architecture element, backend component and ADR trace added (section 3) |
| v3.0 | M3 | Implementation, test cases, expected results, execution evidence and defect status added (sections 4, 5) (**TBC: confirm what was recorded at M3**) |
| v4.0 | M4 Final | Final AC status, final outcome and Scope Completion calculation added (sections 4, 6, 7); evidence refers to the final assessed commit **TBC** |
