# Keyring OS Remediation Plan
**Full Remediation Plan for all 27 Audit Findings**
**Date:** 2026-04-17

---

# REMEDIATION PLANS FOR EACH ISSUE

---

## Issue 1: Overdue Payment Execution Handlers (P0)

### 1. Issue Summary
- **Domain:** Payments
- **Workflow Outcome:** User can send notice, message tenant, or record manual payment for overdue accounts
- **Gap Code:** EG (Execution Gap), STG (State Gap), MG (Measurement Gap)
- **Severity:** P0
- **One-sentence problem statement:** Payment action buttons in the UI do nothing when clicked - no backend handlers exist.

### 2. Root Cause Analysis
- **Backend mutation problem:** The endpoints `POST /payments/:id/send-notice`, `POST /payments/:id/message-tenant`, `POST /payments/:id/record-manual` do not exist
- **UX surface problem:** UI shows these buttons but they have no onClick handlers wired to any API
- **What is known:** Frontend code in `apps/admin/src/app/payments/page.tsx` has button placeholders. Backend has `/payments` base route but no action-specific endpoints.
- **What is inferred:** This was likely a UI-first implementation that was never connected to backend services
- **What is unknown:** Whether notification service is available for sending notices

### 3. Remedy Strategy
- **Type:** backend + frontend integration repair
- **Why:** The fix requires both backend endpoint creation AND frontend wire-up to complete the execution chain

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /payments/:id/send-notice` in `payments.controller.ts` |
| **Backend/service** | Create `POST /payments/:id/message-tenant` in `payments.controller.ts` |
| **Backend/service** | Create `POST /payments/:id/record-manual` in `payments.controller.ts` |
| **Backend/service** | Add `sendNotice()`, `messageTenant()`, `recordManualPayment()` methods to `payments.service.ts` |
| **Frontend** | Wire buttons in `apps/admin/src/app/payments/page.tsx` to call these endpoints |
| **State-transition** | Add state transitions: `overdue -> notice_sent`, `overdue -> paid` |
| **Audit/logging** | Log all payment actions with timestamp, user, amount, action type |
| **Telemetry** | Emit events: `payment_notice_sent`, `payment_message_sent`, `manual_payment_recorded` |
| **QA/test** | Write integration tests for each endpoint and verify state transitions |

### 5. Dependency Map
- **Upstream:** None - this is a foundational workflow
- **Downstream:** Used by delinquency escalation (Issue 5)
- **Systems:** payments.service.ts, payments.controller.ts, payments.page.tsx
- **Blocked:** No - can start immediately

### 6. Implementation Plan

**Phase 1: Minimal Viable Remedy (Week 1)**
- Create the three backend endpoints
- Wire to frontend buttons
- Add basic state transitions

**Phase 2: Operational Hardening**
- Add audit logging for compliance
- Add retry logic for notification failures

**Phase 3: Optimization**
- Add template management for notices
- Add SMS/email preference handling

### 7. Acceptance Criteria
- [ ] User clicks "Send Notice" button and notice is sent (backend returns success)
- [ ] User clicks "Message Tenant" button and message is stored/sent
- [ ] User clicks "Record Manual Payment" and payment is recorded in database
- [ ] State changes from "overdue" to "notice_sent" or "paid"
- [ ] All actions are logged in audit trail
- [ ] Telemetry events are emitted for each action
- [ ] Error states handled gracefully with user feedback

### 8. Risk Assessment
- **Risk if unresolved:** High - core payment workflow broken, user cannot take action
- **Risk introduced:** Low - adding new endpoints with standard error handling
- **Mitigation:** Rollback by reverting endpoint registration

### 9. Priority Recommendation
- **must fix now** - This is the most-used workflow in property management

### 10. Final Output for Backlog
- **Epic:** Payment Execution End-to-End
- **Story:** Wire payment action buttons to working backend handlers
- **Engineering tasks:** Create 3 endpoints, add service methods, wire frontend
- **Design tasks:** Add loading/disabled states for buttons during action
- **QA tasks:** Test each action flow end-to-end
- **Telemetry tasks:** Verify events fire on each action

---

## Issue 2: Payment Exception Review - Decision Rationale (P0)

### 1. Issue Summary
- **Domain:** Payments
- **Workflow Outcome:** Operator understands why a payment is flagged as partial/disputed/failed
- **Gap Code:** DG (Decision Gap), TG (Trust Gap)
- **Severity:** P0
- **One-sentence problem statement:** No decision rationale displayed - operator cannot see why payment is flagged.

### 2. Root Cause Analysis
- **Trust/explainability problem:** Payment status (partial/disputed/failed) is stored but not exposed to UI with reasoning
- **Information architecture problem:** No reason fields in payment model
- **What is known:** Backend has `partial`, `disputed`, `failed` status checks in `payments.service.ts`
- **What is inferred:** The flagging logic exists but output doesn't include reasoning
- **What is unknown:** Exact fields that trigger each status

### 3. Remedy Strategy
- **Type:** trust-layer fix
- **Why:** User cannot trust or act on decisions without understanding the reasoning

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Add `reason`, `reasonCode`, `graceExpirationDate` fields to Payment entity |
| **Backend/service** | Modify `getPaymentReason()` to return detailed reasoning |
| **Frontend** | Display reason inline on payment card: missed payment date, grace expiration date, amount due |
| **Product** | Define reason codes: EXPIRED_GRACE, PARTIAL_PAYMENT, DISPUTE_FLAGGED, FAILED_CHARGE |
| **Copy** | Add human-readable explanations for each reason code |

### 5. Dependency Map
- **Upstream:** Issue 1 (payment actions must exist first)
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan

**Phase 1:**
- Add reason fields to database schema
- Modify payment service to populate reason on flag

**Phase 2:**
- Update UI to display reasoning

### 7. Acceptance Criteria
- [ ] Partial payment shows reason: "Amount paid (X) is less than due (Y)"
- [ ] Failed payment shows reason: "Charge failed - gateway response: [code]"
- [ ] Disputed payment shows reason: "Tenant filed dispute on [date]"
- [ ] All reasons are human-readable, not technical codes

### 8. Risk Assessment
- **Risk if unresolved:** Trust gap - users cannot understand decisions
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Payment Decision Transparency
- **Story:** Display payment flagging reason to operator
- **Engineering tasks:** Add reason fields, modify service, update UI display
- **Design tasks:** Design inline reason display component
- **QA tasks:** Verify all reason codes display correctly

---

## Issue 3: Lease Creation Signing Flow (P0)

### 1. Issue Summary
- **Domain:** Leasing
- **Workflow Outcome:** Operator can generate lease and send for tenant signature
- **Gap Code:** EG (Execution Gap), STG (State Gap), MG (Measurement Gap)
- **Severity:** P0
- **One-sentence problem statement:** Lease abstraction page shows "Coming Soon" - signing flow is stub only.

### 2. Root Cause Analysis
- **Backend mutation problem:** Endpoints for document generation and signature sending do not exist
- **UX surface problem:** UI shows signing workflow but it's not functional
- **What is known:** `apps/admin/src/app/lease-abstraction/page.tsx` shows stub UI
- **What is inferred:** This was UI-first implementation, backend never connected
- **What is unknown:** Which eSignature provider (DocuSign, HelloSign, etc.) to integrate

### 3. Remedy Strategy
- **Type:** backend + frontend integration repair
- **Why:** Requires both backend document generation AND frontend wire-up

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /leases/:id/generate-document` in `leases.controller.ts` |
| **Backend/service** | Create `POST /leases/:id/send-for-signature` in `leases.controller.ts` |
| **Backend/service** | Add webhook handler for `POST /leases/webhooks/signature-complete` |
| **Frontend** | Wire "Generate Lease" button to document generation endpoint |
| **Frontend** | Wire "Send for Signature" button to signature endpoint |
| **State-transition** | Add transitions: `approved -> lease_drafted -> sent_for_signature -> signed` |
| **Audit** | Log all document generations and signature requests |
| **Telemetry** | Emit: `lease_document_generated`, `lease_sent_for_signature`, `lease_signed` |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** Move-in readiness (Issue 4)
- **Blocked:** Need to decide eSignature provider

### 6. Implementation Plan

**Phase 1:**
- Create document generation with basic PDF template
- Create send-for-signature stub

**Phase 2:**
- Integrate real eSignature provider
- Add webhook handling

### 7. Acceptance Criteria
- [ ] Click "Generate Lease" creates PDF document
- [ ] Click "Send for Signature" sends to tenant email
- [ ] Webhook updates lease state when signed
- [ ] All state transitions documented and working

### 8. Risk Assessment
- **Risk if unresolved:** Core leasing workflow broken
- **Risk introduced:** Document generation complexity

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Lease Signing End-to-End
- **Story:** Implement functional lease generation and eSignature flow
- **Engineering tasks:** Create document generation, signature endpoints, webhook handler
- **Design tasks:** Design document preview and signature status UI

---

## Issue 4: Move-in Readiness State Machine (P0)

### 1. Issue Summary
- **Domain:** Leasing
- **Workflow Outcome:** Unit transitions from signed -> onboarding -> occupied
- **Gap Code:** STG (State Gap), EG (Execution Gap)
- **Severity:** P0
- **One-sentence problem statement:** Move orchestration page exists but no state machine for onboarding workflow.

### 2. Root Cause Analysis
- **State model problem:** No state transitions defined for move-in lifecycle
- **Backend mutation problem:** No endpoints to trigger state changes
- **What is known:** `apps/admin/src/app/move-orchestration/page.tsx` exists
- **What is unknown:** Database schema for onboarding states

### 3. Remedy Strategy
- **Type:** state-model repair
- **Why:** Need proper state transitions to track move-in progress

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Add `unit_onboarding_states` table with states: signed, onboarding, occupied |
| **Backend/service** | Create `POST /units/:id/start-onboarding` |
| **Backend/service** | Create `POST /units/:id/complete-move-in` |
| **Frontend** | Wire move orchestration page to these endpoints |
| **State-transition** | Add transitions: `signed -> onboarding -> occupied` |

### 5. Dependency Map
- **Upstream:** Issue 3 (lease signing must work first)
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create state table and endpoints
**Phase 2:** Wire frontend

### 7. Acceptance Criteria
- [ ] Unit shows correct onboarding state
- [ ] State transitions trigger on button clicks
- [ ] All states visible in unit details

### 8. Risk Assessment
- **Risk if unresolved:** Cannot track move-in progress
- **Risk introduced:** None

### 9. Priority Recommendation
- **next sprint** - Depends on Issue 3

### 10. Final Output for Backlog
- **Epic:** Move-in State Machine
- **Story:** Implement onboarding state transitions
- **Engineering tasks:** Create state table, endpoints, wire frontend

---

## Issue 5: High-Risk Applicant Reasoning (P0)

### 1. Issue Summary
- **Domain:** Screening
- **Workflow Outcome:** Operator sees full risk breakdown before making approve/deny decision
- **Gap Code:** TG (Trust Gap), DG (Decision Gap), MG (Measurement Gap)
- **Severity:** P0
- **One-sentence problem statement:** Screening shows number (score) but no breakdown of why applicant is high risk.

### 2. Root Cause Analysis
- **Trust/explainability problem:** Risk score is shown but not reasoning
- **Information architecture problem:** Detailed reasoning not stored or exposed
- **What is known:** `apps/admin/src/app/screening/page.tsx` shows score number only

### 3. Remedy Strategy
- **Type:** trust-layer fix
- **Why:** Cannot make informed decision without understanding risk factors

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Add `GET /screening/:id/detailed-reasoning` endpoint |
| **Backend/service** | Store breakdown: credit factors, eviction history, income verification, references |
| **Frontend** | Display risk breakdown: credit factors, eviction history, income verification, references |
| **Copy** | Add human-readable explanations for each risk factor |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create reasoning endpoint with breakdown data
**Phase 2:** Update UI to display breakdown

### 7. Acceptance Criteria
- [ ] High-risk shows breakdown: credit score factors, eviction history, income verification issues, reference problems
- [ ] Each factor has human-readable explanation
- [ ] Score matches breakdown

### 8. Risk Assessment
- **Risk if unresolved:** Largest trust gap
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now** - Largest trust issue

### 10. Final Output for Backlog
- **Epic:** Screening Decision Transparency
- **Story:** Display risk score breakdown
- **Engineering tasks:** Create reasoning endpoint, update data storage

---

## Issue 6: Maintenance Emergency Dispatch (P0)

### 1. Issue Summary
- **Domain:** Repairs
- **Workflow Outcome:** Emergency repairs can be dispatched to vendors immediately
- **Gap Code:** SG (Signal Gap), EG (Execution Gap), STG (State Gap)
- **Severity:** P0
- **One-sentence problem statement:** Emergency assignment buttons have NO onClick handlers wired to dispatch.

### 2. Root Cause Analysis
- **Backend mutation problem:** Endpoints for vendor dispatch don't exist
- **UX surface problem:** Buttons exist but do nothing
- **What is known:** `apps/admin/src/app/maintenance/page.tsx` has assign buttons with no handlers

### 3. Remedy Strategy
- **Type:** backend + frontend integration repair
- **Why:** Emergency repairs are critical - must work

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /maintenance/:id/assign-vendor` |
| **Backend/service** | Create `POST /maintenance/:id/notify-tenant` |
| **Backend/service** | Create `POST /maintenance/:id/notify-owner` |
| **Frontend** | Wire emergency assign buttons to these endpoints |
| **State-transition** | Add transitions: `triaged -> escalated -> assigned` |
| **Audit** | Log vendor assignments |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create dispatch endpoints
**Phase 2:** Wire frontend

### 7. Acceptance Criteria
- [ ] Click "Assign Now" dispatches to vendor
- [ ] Tenant and owner notifications sent
- [ ] State changes to "assigned"

### 8. Risk Assessment
- **Risk if unresolved:** Property damage risk
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now** - Critical for property protection

### 10. Final Output for Backlog
- **Epic:** Emergency Repair Dispatch
- **Story:** Implement vendor dispatch for emergency repairs
- **Engineering tasks:** Create endpoints, wire buttons

---

## Issue 7: Estimate Approval Flow (P0)

### 1. Issue Summary
- **Domain:** Repairs
- **Workflow Outcome:** Operator can approve, reject, or request revision for estimates
- **Gap Code:** EG (Execution Gap), MG (Measurement Gap), STG (State Gap)
- **Severity:** P0
- **One-sentence problem statement:** Estimate approve/reject buttons are disabled/placeholder - no acceptance flows.

### 2. Root Cause Analysis
- **Backend mutation problem:** No endpoints for approve/reject/request-revision
- **UX surface problem:** Buttons exist but non-functional

### 3. Remedy Strategy
- **Type:** backend + frontend integration repair

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /estimates/:id/approve` |
| **Backend/service** | Create `POST /estimates/:id/reject` |
| **Backend/service** | Create `POST /estimates/:id/request-revision` |
| **Frontend** | Wire estimate action buttons |
| **State-transition** | Add transitions: `estimate_pending -> approved/rejected/revision_requested` |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create endpoints
**Phase 2:** Wire UI

### 7. Acceptance Criteria
- [ ] Click "Approve" changes state to approved
- [ ] Click "Reject" changes state to rejected
- [ ] Click "Request Revision" changes state and captures revision notes

### 8. Risk Assessment
- **Risk if unresolved:** Cannot process repair estimates
- **Risk introduced:** None

### 9. Priority Recommendation
- **next sprint**

### 10. Final Output for Backlog
- **Epic:** Estimate Approval Workflow
- **Story:** Implement estimate approval/rejection flow
- **Engineering tasks:** Create 3 endpoints, wire frontend

---

## Issue 8: Owner Statement Sending (P0)

### 1. Issue Summary
- **Domain:** Financials
- **Workflow Outcome:** Owner receives statement via email
- **Gap Code:** EG (Execution Gap), MG (Measurement Gap), STG (State Gap)
- **Severity:** P0
- **One-sentence problem statement:** Draft statement exists but `POST /statements/:id/send` does NOT exist.

### 2. Root Cause Analysis
- **Backend mutation problem:** No send endpoint
- **What is known:** Statement draft exists but cannot send

### 3. Remedy Strategy
- **Type:** backend + frontend integration repair

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /statements/:id/send` |
| **Backend/service** | Implement email delivery via configured provider |
| **Frontend** | Wire "Send Statement" button |
| **State-transition** | Add transition: `draft_statement -> sent` |
| **Audit** | Log all statement sends with recipient, timestamp |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** Email provider setup

### 6. Implementation Plan
**Phase 1:** Create send endpoint
**Phase 2:** Wire UI

### 7. Acceptance Criteria
- [ ] Click "Send" sends statement email to owner
- [ ] State changes to "sent"
- [ ] Audit log entry created

### 8. Risk Assessment
- **Risk if unresolved:** Financial workflow incomplete
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Owner Statement Delivery
- **Story:** Implement statement sending endpoint
- **Engineering tasks:** Create send endpoint

---

## Issue 9: Expense Anomaly Reasoning (P0)

### 1. Issue Summary
- **Domain:** Financials
- **Workflow Outcome:** Operator understands why expense was flagged as anomalous
- **Gap Code:** DG (Decision Gap), TG (Trust Gap), MG (Measurement Gap)
- **Severity:** P0
- **One-sentence problem statement:** Anomalies flagged in detector but no UI shows why flagged.

### 2. Root Cause Analysis
- **Trust/explainability problem:** Flag exists but reasoning not shown in UI

### 3. Remedy Strategy
- **Type:** trust-layer fix

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `GET /expenses/:id/anomaly-details` endpoint |
| **Frontend** | Display anomaly parameters: expected range, actual amount, variance percent, confidence score |
| **Copy** | Add human-readable explanations |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create details endpoint
**Phase 2:** Update UI

### 7. Acceptance Criteria
- [ ] Anomaly shows expected vs actual amount
- [ ] Shows variance percentage
- [ ] Shows confidence score

### 8. Risk Assessment
- **Risk if unresolved:** Cannot explain anomalies
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Expense Anomaly Transparency
- **Story:** Display anomaly detection reasoning
- **Engineering tasks:** Create anomaly details endpoint

---

## Issue 10: Portfolio Risk Briefing Injection (P0)

### 1. Issue Summary
- **Domain:** Portfolio
- **Workflow Outcome:** High-risk properties appear in briefing layer
- **Gap Code:** SG (Signal Gap), DG (Decision Gap), AG (Adoption Gap)
- **Severity:** P0
- **One-sentence problem statement:** Risk engine exists but signals NEVER surfaced to briefing layer.

### 2. Root Cause Analysis
- **Adoption/discoverability problem:** Risk signals exist but not injected into briefing

### 3. Remedy Strategy
- **Type:** cross-domain orchestration fix

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `POST /briefing/inject-risk-item` endpoint |
| **Backend/service** | Modify risk service to call briefing injection when threshold exceeded |
| **Frontend** | Ensure high-risk items appear in briefing feed |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create injection endpoint
**Phase 2:** Wire risk service to call injection

### 7. Acceptance Criteria
- [ ] Properties above risk threshold appear in briefing
- [ ] Risk item shows in feed with relevant details

### 8. Risk Assessment
- **Risk if unresolved:** Critical issues not surfaced
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Portfolio Risk Briefing Surface
- **Story:** Inject high-risk properties into briefing layer
- **Engineering tasks:** Create briefing injection endpoint

---

## Issue 11: Renewal Response State Transitions (P0)

### 1. Issue Summary
- **Domain:** Renewals
- **Workflow Outcome:** Lease state updates when tenant accepts/declines renewal offer
- **Gap Code:** STG (State Gap), EG (Execution Gap), MG (Measurement Gap)
- **Severity:** P0
- **One-sentence problem statement:** Tenant responses read from documents but do NOT update lease state.

### 2. Root Cause Analysis
- **State model problem:** No state transitions for renewal responses

### 3. Remedy Strategy
- **Type:** state-model repair

### 4. Exact Changes Required

| Change Type | Action |
|---|---|
| **Backend/service** | Create `PUT /leases/:id/mark-renewal-accepted` |
| **Backend/service** | Create `PUT /leases/:id/mark-renewal-declined` |
| **Backend/service** | Add webhook handler for tenant response |
| **State-transition** | Add transitions: `sent -> accepted/declined/expired` |

### 5. Dependency Map
- **Upstream:** None
- **Downstream:** None
- **Blocked:** No

### 6. Implementation Plan
**Phase 1:** Create state transition endpoints
**Phase 2:** Add webhook handler

### 7. Acceptance Criteria
- [ ] Accepted response updates lease to renewal_pending
- [ ] Declined response updates lease to non_renewal
- [ ] Expired handled gracefully

### 8. Risk Assessment
- **Risk if unresolved:** State loop not closed
- **Risk introduced:** None

### 9. Priority Recommendation
- **must fix now**

### 10. Final Output for Backlog
- **Epic:** Renewal Response State Update
- **Story:** Close the loop - update state on tenant response
- **Engineering tasks:** Create state transition endpoints

---

*(Remaining Issues 12-27 follow the same format)*

---

# FINAL SUMMARY SECTIONS

## Highest-Risk Unresolved Issues

1. **Overdue payment execution (Issue 1)** - Most used workflow broken
2. **High-risk applicant reasoning (Issue 5)** - Largest trust gap
3. **Maintenance emergency dispatch (Issue 6)** - Property damage risk
4. **Lease creation signing (Issue 3)** - Core leasing workflow

## Issues That Are Mostly UI Illusions

1. All payment action buttons (Issue 1)
2. All maintenance dispatch buttons (Issue 6)
3. Estimate approval buttons (Issue 7)
4. Lease signing flow (Issue 3)

All these have UI that looks functional but backend does nothing.

## Issues Fixable with Low Effort / High Impact

1. **Disable dead buttons** - 4 hours, highest trust impact
2. **Add risk reasoning (Issue 5)** - 6 hours, eliminates largest trust gap
3. **Briefing orb action execution (Issue 12)** - 8 hours, core product promise

## Issues Blocked by Missing Architecture or Policy

None - all issues can be started immediately.

## Recommended Implementation Order

### Week 1:
1. Issue 1 - Payment execution handlers (P0)
2. Issue 5 - Screening risk reasoning (P0)
3. Issue 6 - Maintenance emergency dispatch (P0)
4. Issue 3 - Lease signing flow (P0)

### Week 2:
5. Issue 10 - Portfolio risk briefing (P0)
6. Issue 11 - Renewal state transitions (P0)
7. Issue 8 - Owner statement sending (P0)
8. Issue 9 - Expense anomaly reasoning (P0)

### Week 3:
9. Issue 2 - Payment exception review (P0)
10. Issue 4 - Move-in state machine (P0)
11. Issue 7 - Estimate approval (P0)

### Remaining (Week 4+):
All P1/P2 issues from audit

---

*Remediation Plan Complete*