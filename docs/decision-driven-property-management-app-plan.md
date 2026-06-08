# Decision-Driven Property Management App Plan

Date: 2026-06-03

## 1. Executive Summary

Build a full-stack property management operating system that helps managers, owners, vendors, applicants, and residents make better decisions and execute work with less manual coordination. The app should not be a passive dashboard. It should continuously surface important signals, explain why they matter, recommend next actions, execute approved actions, update operational state, and measure outcomes.

The existing `keyring-os` codebase already expresses the right product direction: a decision-driven property management OS with admin and tenant portal surfaces. It includes many domain pages and UI components for payments, leasing, screening, maintenance, renewals, financials, owners, documents, inspections, vendors, reports, and AI/copilot surfaces. The main risk is that much of the product appears UI-first: workflows, state transitions, backend execution, integrations, audit trails, and measurement need to become the core platform rather than follow-up wiring.

Recommended direction: keep the strongest product concepts and UI patterns from the current codebase, but implement a durable domain platform behind them. Depart from the current codebase where doing so makes the system simpler, safer, and faster to ship.

## 2. Product Goal

The app should become the daily operating layer for a property management business.

Primary goal:

- Help property managers decide what matters now, understand the rationale, approve or modify the recommended action, and execute the workflow from one place.

Secondary goals:

- Reduce missed deadlines, manual follow-up, duplicate data entry, and context switching.
- Improve tenant, owner, and vendor communication.
- Increase collections performance, occupancy, maintenance responsiveness, renewal retention, and financial close speed.
- Provide auditable decision records for compliance-heavy workflows.
- Use AI where it materially improves prioritization, extraction, drafting, classification, forecasting, and workflow automation.

## 3. Target Users

- Property managers and operators
- Leasing agents
- Maintenance coordinators
- Accounting and finance staff
- Owners and asset managers
- Tenants and applicants
- Vendors and technicians
- Internal admins and support staff

## 4. Core Product Principle

Every important workflow should follow the same decision chain:

1. Signal: detect that something requires attention.
2. Reason: explain why it matters using evidence.
3. Recommendation: propose the next best action.
4. Approval: let a human approve, modify, reject, or delegate.
5. Execution: perform the action through a real backend workflow or integration.
6. State change: update the canonical business object.
7. Audit: record who or what made the decision and why.
8. Measurement: track outcome, speed, success rate, and exceptions.

If a workflow cannot complete this chain, it should not be presented as a finished decision workflow.

## 5. Planned Functionality

### 5.1 Command Center

The first screen should be an operational command center, not a marketing page.

Capabilities:

- Daily briefing across the portfolio.
- Ranked decision queue by risk, deadline, financial impact, and confidence.
- Cross-domain search across properties, tenants, leases, payments, vendors, work orders, documents, and messages.
- Action composer for natural language requests such as "show high-risk renewals this month" or "draft notices for tenants over 10 days late."
- Portfolio health metrics: occupancy, delinquency, work order SLA, renewal exposure, cash position, owner distributions, and upcoming deadlines.
- Explainable decision cards with evidence, policy references, confidence, recommended action, and available alternatives.

### 5.2 Portfolio and Property Operations

Capabilities:

- Portfolio, property, building, unit, and owner hierarchy.
- Unit lifecycle: vacant, listed, applied, approved, lease drafted, signed, move-in ready, occupied, notice given, turnover, maintenance hold.
- Property-specific policy configuration for screening, payment plans, maintenance approval thresholds, renewals, fees, and notices.
- Risk scoring for properties and units.
- Asset-level tasks, documents, inspections, insurance, warranties, utilities, and compliance records.

AI enhancements:

- Detect properties with rising operational risk.
- Summarize property health and blockers.
- Predict vacancy, delinquency, and maintenance burden.
- Recommend rent changes and renewal posture using comps, occupancy, and historical outcomes.

### 5.3 Leasing and Applications

Capabilities:

- Lead and inquiry management.
- Tour scheduling and follow-up.
- Rental application workflow.
- Applicant screening and policy evaluation.
- Approval, conditional approval, adverse action, and denial workflows.
- Lease generation, document assembly, e-signature, and move-in orchestration.

AI enhancements:

- Extract application details from uploaded documents.
- Summarize applicant risk with evidence.
- Draft compliant applicant communications.
- Recommend next action for stalled leads.
- Generate lease abstracts and highlight unusual clauses.

### 5.4 Tenant and Resident Portal

Capabilities:

- Application submission.
- Lease and document access.
- Payments, ledger, autopay, and payment methods.
- Maintenance requests with photos and updates.
- Messages and notifications.
- Inspections, move-out notices, and renewal responses.

AI enhancements:

- Guided maintenance intake with severity classification.
- Tenant-facing answer assistant grounded in lease, policy, and property documents.
- Drafted responses for common tenant questions.
- Automated routing of requests to the right workflow.

### 5.5 Payments, Collections, and Delinquency

Capabilities:

- Charges, invoices, rent payments, fees, credits, refunds, reversals, and payment plans.
- Ledger by tenant, lease, unit, property, and owner.
- Delinquency queues and escalation paths.
- Notice generation and delivery.
- Payment exception review: failed, disputed, partial, returned, or manually adjusted payments.
- Gateway integration and reconciliation to bank and general ledger.

AI enhancements:

- Prioritize collection actions by risk and likelihood of resolution.
- Draft notices and tenant messages.
- Suggest payment plans within property policy.
- Detect payment anomalies and potential reconciliation mismatches.

### 5.6 Maintenance, Repairs, Vendors, and Inspections

Capabilities:

- Maintenance request intake, triage, SLA tracking, assignment, scheduling, estimates, approvals, completion, quality checks, and billing.
- Vendor directory, availability, insurance, licenses, ratings, specialties, and pricing history.
- Emergency dispatch workflows.
- Inspection checklists, photos, findings, reinspection, and owner/tenant notifications.

AI enhancements:

- Classify severity and probable trade from request text/photos.
- Recommend vendor assignment based on skill, location, availability, cost, and past performance.
- Estimate likely cost range and SLA risk.
- Summarize work order history and detect repeat issues.

### 5.7 Renewals and Retention

Capabilities:

- Renewal window tracking.
- Rent recommendation and offer generation.
- Tenant response capture.
- Renewal acceptance, decline, expiration, and non-renewal state transitions.
- Move-out orchestration when not renewing.

AI enhancements:

- Renewal risk scoring.
- Rent recommendation with confidence and supporting factors.
- Draft renewal offers and negotiation responses.
- Detect retention risk from maintenance, payment, and message history.

### 5.8 Financials, Owner Accounting, and Reporting

Capabilities:

- Chart of accounts mapping.
- Bank feeds and reconciliation.
- Transaction categorization and allocation.
- Property-level P&L.
- Owner statements, draws, reserves, and distributions.
- Monthly close workflow.
- Management fees and expense pass-throughs.
- Reports for operations, accounting, compliance, and owners.

AI enhancements:

- Categorize transactions and explain confidence.
- Detect anomalous expenses.
- Match bank transactions to ledger entries.
- Draft owner statement summaries.
- Explain financial variance.

### 5.9 Documents, Compliance, and Audit

Capabilities:

- Central document store by entity.
- Templates for leases, notices, statements, work orders, and owner communications.
- E-signature workflows.
- Jurisdiction-aware document rules.
- Audit log for decisions, state changes, communications, generated documents, overrides, and AI-generated content.

AI enhancements:

- Document classification and extraction.
- Lease abstraction.
- Clause comparison against standard policy.
- Draft notices from templates and structured facts.
- Retrieval-augmented answers grounded in documents.

### 5.10 Communications

Capabilities:

- Unified inbox for tenant, applicant, owner, and vendor messages.
- Email, SMS, in-app, and push notification delivery.
- Templates, delivery status, opt-in/opt-out, and communication preferences.
- Message history tied to business objects.

AI enhancements:

- Draft replies with tone and compliance controls.
- Summarize threads.
- Detect sentiment and urgency.
- Convert messages into tasks or workflow events.

## 6. AI Strategy

AI should be treated as a decision-support and workflow-acceleration layer, not as an unconstrained autonomous actor.

Recommended AI capabilities:

- Retrieval augmented generation over leases, policies, messages, documents, ledgers, and work order history.
- Structured extraction from PDFs, images, emails, applications, invoices, and inspection reports.
- Classification for maintenance severity, payment exceptions, document type, message intent, and workflow routing.
- Forecasting for delinquency risk, renewal risk, vacancy risk, maintenance SLA risk, and cash flow.
- Draft generation for notices, owner updates, tenant replies, renewal offers, denial letters, and maintenance summaries.
- Decision explanation that cites source facts and policy rules.
- Tool calling to execute approved workflow actions.

AI guardrails:

- Human approval for legal notices, adverse action, lease terms, owner distributions, payment reversals, vendor dispatch above threshold, and policy overrides.
- Grounded answers with source references for documents and policy.
- No silent state changes by AI.
- Store prompt inputs, model outputs, cited evidence, user approval, final executed action, and outcome for regulated workflows.
- Use deterministic rule engines for policy enforcement; use AI for summarization, extraction, ranking, and drafting.

## 7. Recommended Architecture

### 7.1 High-Level Architecture

Use a modular monolith first, with strong domain boundaries and event-driven workflows. Split into services only when scale, team ownership, or compliance demands it.

Recommended components:

- Web apps: Admin app, tenant portal, owner portal, vendor portal.
- API gateway/BFF: Next.js route handlers or a dedicated API gateway for auth/session handling and frontend aggregation.
- Core backend: NestJS or similar TypeScript backend organized by domain modules.
- Workflow engine: Temporal, Inngest, Trigger.dev, or a lightweight queue-backed state machine layer.
- Database: PostgreSQL as system of record.
- Cache/queue: Redis for jobs, locks, rate limits, and ephemeral state.
- Object storage: S3-compatible storage for documents, photos, generated PDFs, and exports.
- Search/vector: Postgres full-text plus pgvector initially; move to dedicated search/vector service if needed.
- Event bus: Postgres outbox plus queue initially; upgrade to Kafka/Pub/Sub if volume requires.
- Analytics warehouse: Postgres read models initially; later BigQuery/Snowflake/ClickHouse for high-volume analytics.
- Observability: OpenTelemetry, structured logs, traces, metrics, and error tracking.

### 7.2 Domain Modules

Core modules:

- Identity and access
- Organizations and workspaces
- Portfolio, properties, units, and owners
- Tenants, applicants, households, and vendors
- Leases, renewals, move-in, and move-out
- Payments, ledger, invoices, and collections
- Maintenance, repairs, estimates, inspections, and vendors
- Financials, reconciliation, owner statements, and reports
- Documents, templates, e-signature, and compliance
- Messaging and notifications
- Decisions, signals, recommendations, and audit
- AI orchestration, retrieval, extraction, and evaluations
- Integrations and webhooks

### 7.3 Decision Platform

Create a first-class decision platform that all domains use.

Core entities:

- `Signal`: an observed condition requiring attention.
- `Decision`: a recommended judgment or action tied to an entity.
- `Evidence`: facts, documents, messages, policy rules, calculations, and model outputs supporting the decision.
- `Action`: executable operation with required permissions, confirmation, idempotency key, and side effects.
- `WorkflowState`: canonical lifecycle state for the business object.
- `AuditEvent`: immutable event record for decisions and state changes.
- `OutcomeMetric`: measurement tied to the decision and action.

This layer is the product differentiator. It should be implemented once and reused across payments, maintenance, leasing, screening, renewals, and financials.

### 7.4 Data Model Priorities

Initial canonical entities:

- Organization, workspace, user, role, permission
- Property, building, unit, owner
- Tenant, applicant, household member
- Lease, application, screening report, renewal offer
- Charge, payment, invoice, ledger entry, payment plan
- Maintenance request, work order, estimate, vendor, inspection
- Document, template, envelope, signature recipient
- Message, notification, delivery log
- Decision, signal, action, evidence, audit event, workflow execution
- Integration account, webhook event, sync cursor

Important data principles:

- Use UUIDs for public identifiers.
- Use immutable ledger and audit records.
- Use explicit state machines for core lifecycles.
- Use idempotency keys for all externally triggered mutations.
- Use row-level tenant isolation and organization scoping from the beginning.
- Use soft deletes only where legally and operationally appropriate; preserve audit records.

### 7.5 Integration Strategy

Likely integrations:

- Payments: Stripe, Plaid, ACH provider, card processor.
- Accounting: QuickBooks Online initially, with export fallbacks.
- E-signature: DocuSign or Dropbox Sign.
- Communications: SendGrid/Postmark for email, Twilio for SMS.
- Screening: TransUnion, Experian, Checkr, RentPrep, or a property-management-specific screening provider.
- Listings and rent comps: Zillow, Apartments.com, RentCast, local MLS/comps provider where available.
- Maps and geocoding: Google Maps or Mapbox.
- Storage: AWS S3, Cloudflare R2, or Azure Blob.

Integration design:

- Every integration should have a normalized internal model.
- Webhook events should be stored raw before processing.
- Sync jobs should be replayable.
- External side effects should be wrapped in workflow actions with audit records.
- Failures should create operational decisions, not disappear into logs.

## 8. Recommended Stack

Preferred stack for fastest high-quality execution:

- Monorepo: pnpm + Turborepo
- Language: TypeScript end to end
- Frontend: Next.js App Router, React, Tailwind CSS, Radix/Base UI primitives, TanStack Query
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma or Drizzle; choose one and keep schema discipline strict
- Workflow/job orchestration: Temporal for maximum durability, or Inngest/Trigger.dev for faster startup
- Queue/cache: Redis
- Search/vector: PostgreSQL full-text + pgvector initially
- Object storage: S3-compatible
- Auth: Clerk/Auth0/Supabase Auth for speed, or first-party OIDC/JWT if enterprise control is required
- Authorization: RBAC plus policy checks in backend services
- AI: OpenAI API for model calls, embeddings, structured outputs, and tool calling
- Validation: Zod
- Testing: Vitest, Testing Library, Playwright
- Observability: Sentry, OpenTelemetry, structured JSON logs
- Deployment: Vercel for web apps plus managed backend on Render/Fly/AWS/Azure, or full AWS/Azure if enterprise/security needs require it

Stack decision:

- If speed to MVP is the top priority: Next.js + NestJS + PostgreSQL + Prisma + Inngest + Redis + OpenAI.
- If durability and long-running business workflows are top priority: Next.js + NestJS + PostgreSQL + Temporal + Redis + OpenAI.
- If the app must support large enterprise portfolios early: consider AWS/Azure from day one with strict networking, audit, backups, and tenant isolation.

## 9. Current Codebase Assessment

Observed structure:

- Monorepo using pnpm and Turborepo.
- Admin Next.js app under `apps/admin`.
- Tenant portal Next.js app under `apps/tenant-portal`.
- Shared packages under `packages/types`, `packages/ui`, and `packages/config`.
- Existing product docs for architecture, UI system, decision policy, remediation, and audit.
- Existing domains include payments, leasing, screening, repairs, renewals, financials, portfolio, inspections, vendors, reports, owner portal, documents, messages, and copilot surfaces.

Strengths:

- The product concept is clear and differentiated.
- Domain coverage is broad.
- The decision surface concept is already present in types and UI components.
- There is useful audit documentation identifying workflow gaps.
- The monorepo structure is a reasonable starting point.

Risks:

- The backend is not present in this workspace, while frontend code proxies to a backend at `localhost:3001/api`.
- Existing docs disagree on backend completeness: one audit says many workflows do not execute, while an API gap report says many endpoints exist in an external backend.
- Many pages may be prototypes rather than production workflows.
- Measurement, audit, and durable state transitions appear underdeveloped relative to the product ambition.
- AI architecture should be formalized before more copilot features are added.

Recommended treatment:

- Keep the current repo as a product prototype and design reference.
- Inventory every route and classify it as production-ready, prototype, or dead surface.
- Create or attach the real backend repo before implementation planning is finalized.
- Build the decision platform, workflow execution layer, audit trail, and domain state machines before expanding more UI.

## 10. Implementation Roadmap

### Phase 0: Product and Architecture Decisions

Duration: 1-2 weeks

Deliverables:

- Confirm target customer segment and first market.
- Confirm property types and jurisdiction scope.
- Confirm whether to evolve this repo or start a clean backend plus preserved UI.
- Select stack and hosting.
- Select first-party vs third-party auth.
- Select payment, e-signature, email/SMS, accounting, and screening providers.
- Define P0 workflows and acceptance criteria.
- Build a workflow inventory from the existing UI.

### Phase 1: Platform Foundation

Duration: 3-5 weeks

Deliverables:

- Auth, organization/workspace tenancy, roles, and permissions.
- PostgreSQL schema and migrations for core portfolio, tenants, leases, payments, maintenance, documents, messages, decisions, and audit.
- Backend domain modules and API contracts.
- Decision platform core: signals, decisions, evidence, actions, audit, outcomes.
- Workflow/state machine layer with idempotent actions.
- Notification and document storage foundations.
- Observability, error handling, and test infrastructure.

### Phase 2: First Complete Decision Workflows

Duration: 4-6 weeks

Ship a narrow but real operating loop:

- Overdue rent decision and notice workflow.
- Emergency maintenance triage and vendor dispatch.
- Applicant screening review with evidence and approve/deny/conditional action.
- Lease generation and e-signature.
- Owner statement draft, approval, and send.

Acceptance standard:

- Each workflow must include signal, reason, recommendation, execution, state change, audit, and measurement.

### Phase 3: AI-Enhanced Operations

Duration: 4-6 weeks

Deliverables:

- RAG over leases, policies, documents, and messages.
- AI drafting for tenant, owner, vendor, and applicant communications.
- Maintenance severity classification.
- Document extraction for leases, invoices, applications, and inspection reports.
- Transaction categorization and anomaly explanation.
- Decision explanations with evidence citations.
- AI evaluation set for safety, accuracy, compliance, and regression testing.

### Phase 4: Portals and Integrations

Duration: 4-8 weeks

Deliverables:

- Tenant portal production workflows.
- Owner portal with statements, documents, reports, and approvals.
- Vendor portal or vendor-facing links for assignments, estimates, completion, and invoices.
- Payment provider integration.
- Accounting integration.
- E-signature integration.
- Communication provider integration.
- Screening provider integration.

### Phase 5: Scale, Compliance, and Commercial Readiness

Duration: ongoing

Deliverables:

- Data retention and export policies.
- SOC 2 readiness controls.
- Backup and disaster recovery.
- Fine-grained permissions.
- Advanced reporting and analytics.
- Multi-market compliance content.
- Admin tools, support impersonation with audit, billing, and onboarding.

## 11. MVP Recommendation

The fastest credible MVP should focus on one property-manager command center with five real workflows:

1. Collect overdue rent.
2. Triage and dispatch urgent maintenance.
3. Review applicant screening and send decision.
4. Generate and send lease for signature.
5. Send owner statement.

Do not attempt to make every property management feature deep in the first version. Broad but shallow will look impressive and fail trust quickly. A narrower set of complete decision workflows will prove the core product.

## 12. Success Metrics

Operational metrics:

- Time from signal creation to action execution.
- Percentage of decisions resolved from the command center.
- Delinquency resolution rate.
- Maintenance SLA compliance.
- Application approval cycle time.
- Lease signing cycle time.
- Renewal acceptance rate.
- Monthly close duration.
- Owner statement send timeliness.

AI metrics:

- Draft acceptance rate.
- Classification accuracy.
- Extraction correction rate.
- Recommendation override rate.
- Hallucination or unsupported-claim rate.
- Workflow automation success rate.

Business metrics:

- Properties/units onboarded.
- Active operators per organization.
- Retention by organization.
- Monthly active workflows executed.
- Revenue per managed unit.
- Support tickets per organization.

## 13. Key Risks and Mitigations

Risk: UI appears functional before execution exists.

Mitigation: Gate every action behind real backend workflows or mark it clearly as unavailable.

Risk: AI makes unsupported or noncompliant recommendations.

Mitigation: Use deterministic policy rules, evidence citations, human approval, and AI evaluation suites.

Risk: Integrations become brittle.

Mitigation: Store raw webhook events, use idempotent processing, sync cursors, retry policies, and operational alerts.

Risk: Accounting complexity is underestimated.

Mitigation: Use immutable ledger design, reconciliation records, and early QuickBooks integration validation.

Risk: Legal/compliance requirements vary by jurisdiction.

Mitigation: Make jurisdiction and policy explicit data inputs. Use templates and legal review for notices and adverse actions.

Risk: Building every portal too early slows the core product.

Mitigation: Start with admin command center and tenant portal workflows that directly support the first five MVP workflows.

## 14. Information Needed From You

These answers are needed to turn this plan into an implementation-ready build plan:

1. Target customer: small landlords, independent property managers, enterprise PM firms, HOA/condo managers, commercial managers, or a mix?
2. Property type: single-family, multifamily, student housing, short-term rental, commercial, HOA, or mixed portfolio?
3. Initial geography: which states or countries must the product support first?
4. Scale target: expected units per customer and total units in the first year?
5. Source of truth: will this replace existing PMS tools or integrate with systems such as AppFolio, Buildium, Rent Manager, Yardi, or QuickBooks?
6. Payments provider preference: Stripe, ACH-specific provider, Plaid-backed flow, or undecided?
7. Accounting requirement: full ledger inside the app, QuickBooks sync, or reports/export only at first?
8. E-signature provider preference: DocuSign, Dropbox Sign, PandaDoc, or undecided?
9. Screening provider preference and compliance requirements?
10. Communication channels required for MVP: email, SMS, in-app, phone logging, or all?
11. AI posture: assistant-only, human-approved automation, or limited autonomous execution for low-risk actions?
12. Build preference: evolve the current codebase, start clean, or hybrid where UI concepts are preserved but backend/domain layers are rebuilt?
13. Deployment/security requirements: Vercel/simple managed stack, AWS/Azure enterprise stack, SOC 2 target, SSO requirement, or HIPAA-like constraints?
14. MVP deadline and team size.
15. Are there existing backend repositories, databases, API specs, or provider credentials that were not included in this workspace?

## 15. Recommended Next Step

Before building more UI, complete a one-week technical discovery sprint:

- Locate or create the backend source of truth.
- Pick the first five workflows.
- Define state machines and API contracts for those workflows.
- Build the decision platform schema.
- Decide the integration providers.
- Convert the roadmap into epics, user stories, acceptance criteria, and a delivery schedule.

The current codebase should then be used selectively: preserve useful UI, types, and product language, but make the backend workflow platform the center of the product.
