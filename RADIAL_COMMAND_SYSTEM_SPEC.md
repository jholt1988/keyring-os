# Radial Command System Spec
## Keyring OS

## 1. Purpose

The Radial Command System is the primary interaction model for Keyring OS.

It replaces:
- sidebar navigation
- top-level menu browsing
- dashboard-first interaction

It enables:
- intent activation
- context-aware command selection
- fast transition from awareness to action

The radial system must feel like a **control nucleus**, not a gimmick. It is the interface users touch to move the system.

---

## 2. Product Role

The radial system is not a floating shortcut menu.

It is the front-end manifestation of the Keyring OS philosophy:

> awareness → decision → action → resolution

The user should not think:
- “where is that page?”
- “which section is this under?”
- “which menu do I open?”

The user should think:
- “I need to collect rent”
- “I need to review applicants”
- “I need to look at this property”
- “I need to resolve the issue”

---

## 3. Design Principles

1. **Intent before navigation**  
   Commands represent outcomes and domains, not pages.

2. **One focal control**  
   There is one persistent command node, not multiple floating tools.

3. **State-aware expansion**  
   The system should adapt available commands based on current domain, object, urgency, and permissions.

4. **Controlled complexity**  
   Never expose the entire system tree at once.

5. **Fast interaction**  
   Expansion and collapse should feel immediate and precise.

6. **Escalating depth**  
   First ring = domain.  
   Second ring = context.  
   Third layer = direct action or transition.

---

## 4. Core UX Model

### Idle
A single floating command node is visible.

### Primary Open
The first ring expands and reveals major domains.

### Secondary Open
A selected domain expands into contextual options.

### Action Resolve
The selected option opens a focused execution surface, drawer, or context workspace.

### Collapse
The system returns to idle after action handoff unless persistent context is needed.

---

## 5. Placement

## Recommended default
- **Bottom center** on desktop
- Slight vertical lift above the edge for touch comfort and visual importance

## Alternate allowed placements
- Bottom-right only if collision with other surfaces requires it
- Never top-right
- Never mid-screen
- Never left-edge

## Placement rule
The command node must be visually central enough to feel primary, but not obstruct the active work surface.

---

## 6. Visual Model

## Command Node (Orb)
The node is a circular, high-contrast object with subtle depth.

### Idle visual properties
- circular
- premium material feel
- soft glow
- restrained pulse
- status-aware accent ring

### Status colors
- cyan: neutral / system ready
- amber: active attention items
- red: critical unresolved signals
- green: all-clear / stable state (use sparingly)
- purple: context-specific AI review or multi-step flow

### Surface language
- dark glass or dark metal feel
- inner glow, not neon
- shadow should feel anchored, not floating aimlessly

---

## 7. Interaction Rings

## Ring 1: Domain ring
This ring contains the primary operating domains.

### Maximum domain count
6 visible at once

### Recommended domains
- Portfolio
- Payments
- Leasing
- Screening
- Repairs
- Financials

### Optional 7th domain
- Renewals  
Only if it is distinct enough from Leasing in the final product model. Otherwise Renewals should live under Leasing or a contextual branch.

---

## Ring 2: Context ring
This ring appears after domain selection.

Examples:

### Portfolio
- Properties
- Units
- Vacancies
- Map
- Owners

### Payments
- Overdue
- Notices
- Autopilot
- Tenant Accounts
- Timeline

### Screening
- Ready to Review
- Conditional
- Denials
- Compare Applicants
- Policy Settings

### Repairs
- Critical Repairs
- Estimates
- Vendors
- Schedule
- Preventive Risk

### Financials
- Transactions
- Reconcile
- Close Books
- Statements
- Exceptions

---

## Ring 3: Direct action layer
This is not always radial. In many cases it should transition into:
- bottom sheet
- center panel
- right-side focus drawer
- full focus surface

Use ring 3 only for **small, high-confidence actions** such as:
- Send Notice
- Approve with Conditions
- Start Renewal
- Schedule Repair

For more complex tasks, switch to a focus surface instead of over-expanding the circle.

---

## 8. Geometry Spec

## Base node
- diameter: 64px desktop
- diameter: 58px tablet
- diameter: 54px mobile

## Primary ring radius
- 108px desktop
- 96px tablet
- 88px mobile

## Secondary ring radius
- 164px desktop
- 144px tablet
- 132px mobile

## Item size
- 48px visual minimum
- 44px absolute minimum touch target on small screens
- label should appear adjacent or just outside the ring, not inside the item

## Arc strategy
Do not always render a perfect 360° ring.

Preferred pattern:
- fan upward from bottom-center anchor
- open on a 160°–220° arc depending on available space

This prevents collisions with the screen edge and preserves focus.

---

## 9. Positioning Logic

## Desktop
If anchored bottom-center:
- primary commands should fan upward-left through upward-right
- secondary commands should expand around the selected item, biased away from screen edges

## Mobile
- radial should compress to a tighter arc
- labels may become pill tooltips
- if the second level becomes crowded, switch to hybrid radial + sheet model

## Edge detection rules
The radial system must detect available viewport space and:
- compress arc
- rotate command distribution
- flip label direction
- shift expansion bias
before allowing overlap or clipping

---

## 10. Label Behavior

Labels must always be readable.

### Default
- hidden at idle
- visible on expand
- fade/slide in with slight stagger

### Label rules
- no label truncation for primary domains
- secondary labels may wrap to 2 lines max
- if labels crowd each other, reduce count or switch to stacked context panel

### Tone
Use operational verbs or domain nouns:
- Payments
- Screening
- Units
- Reconcile
- Notices

Avoid vague labels:
- Manage
- Stuff
- Workflow
- Actions

---

## 11. Motion Spec

## Timing
- node pulse: ambient only, 3–4s cycle
- primary expand: 180ms
- secondary expand: 160ms
- action transition: 200–240ms
- collapse: 140–160ms

## Easing
Use smooth, decisive easing:
- cubic-bezier(0.2, 0.8, 0.2, 1)

## Motion behavior
- items should travel from node origin to final position
- opacity + scale + translate are sufficient
- avoid bounce
- avoid spring overshoot unless extremely restrained

## Motion meaning
Motion should communicate:
- hierarchy
- causality
- focus transfer

Never animation-for-animation’s-sake.

---

## 12. Input Modes

## Click / tap
Primary interaction mode.

## Hover
Desktop only:
- allowed for preview emphasis
- not allowed as the sole reveal mechanism

## Keyboard
Must support:
- open command node
- move between items
- select domain
- escape to collapse

## Suggested keyboard model
- `Space` or `Enter`: open node
- arrow keys: cycle commands
- `Enter`: select
- `Esc`: collapse / go back one level

---

## 13. Accessibility

The radial system must remain operable without precision pointing.

### Requirements
- keyboard support
- clear focus ring
- semantic labels for screen readers
- reduced motion mode
- alternate linear command list available when needed

### Reduced motion behavior
- disable radial travel animation
- use fade + instant position
- avoid pulsing

### Screen reader behavior
The control should announce:
- current mode
- available commands
- selected command
- back / close state

---

## 14. State Machine

```ts
type RadialState =
  | "idle"
  | "primaryOpen"
  | "secondaryOpen"
  | "executing"
  | "collapsed";

type RadialContext =
  | "global"
  | "property"
  | "unit"
  | "payments"
  | "screening"
  | "repairs"
  | "financials";
```

### Transitions
- idle → primaryOpen
- primaryOpen → secondaryOpen
- secondaryOpen → executing
- executing → collapsed or primaryOpen depending on result
- any state → idle via escape / outside click / completion

### Guards
Prevent transition if:
- item unavailable by permission
- domain has no valid actions in current context
- async execution currently blocking duplicate action

---

## 15. Priority Logic

The radial system should be context-aware.

### Priority sources
- current route / active object
- active critical signals
- user role
- recent behavior
- blocked workflows

### Examples
If a unit is delinquent:
- Payments commands should rise in emphasis

If a property is vacant:
- Leasing or Portfolio → Vacancies should be more prominent

If an estimate is pending:
- Repairs → Estimates should be emphasized

### Emphasis methods
- reorder item position toward top-center
- stronger glow
- subtle badge count
- context subtitle

Do not use all emphasis methods at once.

---

## 16. Badging Rules

Badges should be sparse and meaningful.

### Allowed
- count of critical items
- count of queued decisions
- binary warning indicator

### Avoid
- badge on every item
- decorative counts
- duplicate counts from elsewhere on the screen

---

## 17. Surface Handoff Rules

The radial system should not force full-page navigation for every action.

### Use inline focus drawer when
- action needs limited supporting context
- user can decide within one surface

Examples:
- Send notice
- Review estimate
- Conditional approval
- Categorize transaction

### Use full focus workspace when
- object requires broader context
- task is multi-step or longitudinal

Examples:
- Property control
- Unit lifecycle management
- Reconciliation
- Full applicant review

---

## 18. Recommended Command Trees

## Global
- Portfolio
- Payments
- Leasing
- Screening
- Repairs
- Financials

## Property context
- Units
- Leasing
- Maintenance
- Financials
- Documents
- Schedule

## Unit context
- Lease
- Payments
- Listing
- Maintenance
- Inspections
- Timeline

## Decision context
- Approve
- Deny
- Request Docs
- Schedule
- Send
- Defer

---

## 19. React Component Model

## Core components
- `CommandNode`
- `RadialMenu`
- `RadialItem`
- `RadialLabel`
- `RadialBadge`
- `RadialBackdrop`
- `RadialContextBridge`
- `CommandFocusDrawer`

## Suggested responsibilities

### CommandNode
- persistent anchor
- open/close control
- status color
- unread / critical indicator

### RadialMenu
- computes ring geometry
- renders items
- manages collision-aware layout
- handles navigation state

### RadialItem
- button surface for one command
- icon + badge + hover/focus state

### RadialContextBridge
- decides which command tree to render based on context and permissions

### CommandFocusDrawer
- receives selected action and renders execution surface

---

## 20. Suggested TypeScript Interfaces

```ts
type CommandDomain =
  | "portfolio"
  | "payments"
  | "leasing"
  | "screening"
  | "repairs"
  | "financials"
  | "renewals";

interface RadialCommand {
  id: string;
  label: string;
  icon: string;
  domain: CommandDomain;
  badgeCount?: number;
  priority?: "default" | "elevated" | "critical";
  disabled?: boolean;
  children?: RadialCommand[];
  actionType?: "open_context" | "open_drawer" | "navigate" | "execute";
  href?: string;
  payload?: Record<string, unknown>;
}

interface RadialRenderContext {
  mode: "global" | "property" | "unit" | "decision";
  propertyId?: string;
  unitId?: string;
  userRole: string;
  criticalSignals?: string[];
}
```

---

## 21. Tailwind / Styling Guidance

### Node
- strong circular silhouette
- ring highlight
- restrained glass depth
- high contrast against dark shell

### Items
- slightly smaller than node
- use semantic ring colors, not solid floods
- avoid large text inside circles

### Labels
- pill, capsule, or clean floating text
- dark translucent background
- high legibility

### Backdrop
- subtle dim or blur when primary/secondary rings are open
- enough to increase focus without feeling modal unless necessary

---

## 22. Failure Modes

The radial system fails if:
- it feels like a novelty animation
- users cannot predict where commands will appear
- there are too many items in one ring
- it requires multiple selections for common actions
- labels collide or clip
- it hides critical actions behind cleverness
- keyboard users cannot operate it cleanly

---

## 23. Success Criteria

The radial system succeeds when:
- users can access primary domains faster than with a sidebar
- common actions are available in one or two interactions
- context-specific options feel intelligent, not buried
- the UI feels spatial and premium without becoming obscure
- users understand the system after minimal onboarding

---

## 24. Engineering Acceptance Criteria

1. Primary ring opens in under 200ms.
2. No command item clips outside viewport.
3. System supports keyboard navigation and escape behavior.
4. Context-aware command trees render correctly for global, property, and unit contexts.
5. Badges and priority emphasis are data-driven.
6. Reduced-motion mode is supported.
7. Mobile fallback to hybrid radial + sheet is available when command count exceeds comfortable density.
8. Outside-click and back action collapse behavior is deterministic.
9. Ring geometry is computed, not hardcoded for one screen size.
10. Actions can hand off to drawer, focus surface, or route without breaking state.

---

## 25. Final Principle

The radial system is not there to look futuristic.

It exists to eliminate the dead time between:
- recognizing a need
- locating a function
- opening the right context
- taking action

If it does not reduce that dead time, it should be simplified until it does.
