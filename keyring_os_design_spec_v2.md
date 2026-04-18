# Keyring OS — Decision OS Design Spec v2

---

## 1. System Overview

Keyring OS is a **decision-first interface system**.

It replaces:
- dashboards
- side navigation
- passive data views

With:
- briefing surfaces
- command activation
- contextual execution layers

---

## 2. Core UX Model

### Layer 1 — Briefing
Displays:
- Critical Signals
- Needs Your Decision
- Scheduled Events

### Layer 2 — Command
Activated via floating orb (command node).

### Layer 3 — Execution
Dynamic surfaces that present decisions and enable actions.

---

## 3. Navigation Philosophy

No:
- sidebar
- top navigation menus

Instead:
- radial command system
- contextual expansion
- state-driven transitions

---

## 4. Radial Menu System

### Idle State
- Floating orb
- Subtle animation
- Reflects system status

### Primary Expansion
Domains:
- Portfolio
- Payments
- Leasing
- Screening
- Repairs
- Financials

### Secondary Expansion
Context-specific options:
- Units
- Vacancies
- Transactions
- Applicants

---

## 5. Decision Surface Model

### Decision Card Structure

- Title
- Summary
- Reasoning
- Actions

Example:

Tenant overdue — Unit 3C

Reason:
- Payment missed
- Grace period expired

Actions:
[ Send Notice ]
[ Message Tenant ]

---

## 6. Portfolio System

Portfolio → Property → Unit

---

## 7. Unit Lifecycle

Vacant → Turning → Listed → Applied → Approved → Leased → Occupied → Renewal → Vacant

---

## 8. Component System

### Command Components
- CommandNode (Orb)
- RadialMenu

### Decision Components
- DecisionCard
- RecommendationCard

### State Components
- StatusChip
- RiskBadge
- ConfidenceBadge
- LifecycleRail

### Execution Components
- ActionButtons
- ApprovalControls

### Surface Components
- Panel
- Drawer
- FocusView

---

## 9. Interaction Rules

- Show minimal UI by default
- Expand only when needed
- Prioritize top 1–3 actions
- Always attach actions to data

---

## 10. Motion Rules

- Fast and responsive
- Expand from source of interaction
- Avoid excessive animation

---

## 11. Anti-Patterns

Do NOT build:
- dashboards
- static KPI cards
- large data tables as primary UI
- multi-step workflows for simple actions

---

## 12. Success Criteria

- User takes action within seconds
- No navigation required
- Decisions are clear
- Actions are immediate

---

## 13. Design Principle

> Show less. Mean more. Enable action.

---

## 14. System Goal

Keyring OS should feel like:
- a control system
- a chief-of-staff
- an operating layer
