# RADIAL_COMMAND_SYSTEM_IMPLEMENTATION.md
## Keyring OS

## 1. Purpose

This document translates the Radial Command System Spec into an implementation-ready frontend architecture.

It defines:
- React component responsibilities
- state model
- command tree resolution
- geometry computation
- animation strategy
- accessibility behavior
- integration points with the rest of Keyring OS

This is the engineering document that sits underneath the design spec.

---

## 2. Implementation Goals

The implementation must achieve five things:

1. Make the radial system the fastest way to reach a primary domain.
2. Make the radial system context-aware.
3. Keep the interaction deterministic and debuggable.
4. Preserve accessibility and reduced-motion support.
5. Allow command actions to hand off cleanly into drawers, focus surfaces, or routes.

---

## 3. Recommended Tech Assumptions

- React
- TypeScript
- Tailwind CSS
- Framer Motion or Motion One for animation
- Zustand for UI state
- React Query / TanStack Query for data fetching
- React Router or Next app router for route-level context
- Optional Floating UI utilities for collision-aware positioning

---

## 4. File / Module Structure

```text
src/
  features/
    radial-command/
      components/
        CommandNode.tsx
        RadialMenu.tsx
        RadialItem.tsx
        RadialLabel.tsx
        RadialBadge.tsx
        RadialBackdrop.tsx
        CommandFocusDrawer.tsx
      hooks/
        useRadialMenu.ts
        useRadialGeometry.ts
        useRadialCommands.ts
        useRadialKeyboardNav.ts
        useReducedMotionPreference.ts
      state/
        radialCommandStore.ts
      utils/
        radialGeometry.ts
        radialPriority.ts
        radialContext.ts
        radialTransitions.ts
      types/
        radial.types.ts
      constants/
        radial.constants.ts
      api/
        radialContextApi.ts
```

---

## 5. Top-Level Architecture

The radial system should be mounted once inside the global app shell.

```tsx
<AppShell>
  <MainWorkspace />
  <RadialCommandSystem />
  <GlobalOverlays />
</AppShell>
```

### Important rule
There must only be one radial command system instance in the app.

Do not mount separate radial menus per page.

The system should derive its context from:
- active route
- selected entity
- current domain
- unresolved critical signals
- permissions

---

## 6. Core Components

## 6.1 `RadialCommandSystem`
This is the orchestrator component.

### Responsibilities
- reads global UI/context state
- decides when the node is idle or expanded
- resolves command tree
- renders node, items, backdrop, and action handoff surfaces

### Suggested structure

```tsx
export function RadialCommandSystem() {
  const state = useRadialMenu();
  const commands = useRadialCommands(state.context);
  const geometry = useRadialGeometry({
    anchor: state.anchor,
    level: state.level,
    count: commands.visibleItems.length,
    viewport: state.viewport,
  });

  return (
    <>
      <RadialBackdrop open={state.isOpen} onDismiss={state.closeAll} />
      <CommandNode
        status={state.status}
        isOpen={state.isOpen}
        onToggle={state.togglePrimary}
      />
      <RadialMenu
        level={state.level}
        items={commands.visibleItems}
        geometry={geometry}
        activeCommandId={state.activeCommandId}
        onSelect={state.selectCommand}
      />
      <CommandFocusDrawer
        action={state.pendingAction}
        open={state.drawerOpen}
        onClose={state.closeDrawer}
      />
    </>
  );
}
```

---

## 6.2 `CommandNode`
The persistent orb.

### Responsibilities
- display status color
- open/close primary ring
- announce critical indicator
- maintain keyboard focus entry point

### Props
```ts
interface CommandNodeProps {
  status: "neutral" | "warning" | "critical" | "stable" | "review";
  isOpen: boolean;
  onToggle: () => void;
}
```

### Behavior
- click / tap toggles primary ring
- keyboard enter / space opens
- escape collapses if focused and open
- visual state reflects system state from store

---

## 6.3 `RadialMenu`
Renders radial items for a given level.

### Responsibilities
- map items to computed positions
- apply motion
- render labels and badges
- delegate interactions upward

### Important rule
`RadialMenu` should not own business logic.
It only renders the computed menu state.

### Props
```ts
interface RadialMenuProps {
  level: 1 | 2;
  items: RadialCommand[];
  geometry: RadialPlacement[];
  activeCommandId?: string;
  onSelect: (cmd: RadialCommand) => void;
}
```

---

## 6.4 `RadialItem`
Single radial command button.

### Responsibilities
- show icon
- show badge
- show active/hover/focus/disabled states
- dispatch selection

### Props
```ts
interface RadialItemProps {
  command: RadialCommand;
  placement: RadialPlacement;
  active: boolean;
  onSelect: (cmd: RadialCommand) => void;
}
```

---

## 6.5 `CommandFocusDrawer`
Focus surface for command handoff.

### Responsibilities
- render detail UI for actionType = open_drawer
- host execution flows that should not become full pages
- preserve radial context while user completes task

### Use cases
- send late notice
- conditional applicant approval
- estimate approval
- categorize transaction

---

## 7. TypeScript Contracts

## 7.1 Command Types

```ts
export type CommandDomain =
  | "portfolio"
  | "payments"
  | "leasing"
  | "screening"
  | "repairs"
  | "financials"
  | "renewals";

export type CommandActionType =
  | "open_context"
  | "open_drawer"
  | "navigate"
  | "execute";

export interface RadialCommand {
  id: string;
  label: string;
  icon: string;
  domain: CommandDomain;
  badgeCount?: number;
  priority?: "default" | "elevated" | "critical";
  disabled?: boolean;
  children?: RadialCommand[];
  actionType?: CommandActionType;
  href?: string;
  payload?: Record<string, unknown>;
}

export interface RadialRenderContext {
  mode: "global" | "property" | "unit" | "decision";
  propertyId?: string;
  unitId?: string;
  currentDomain?: CommandDomain;
  userRole: string;
  criticalSignals?: string[];
}
```

---

## 7.2 Geometry Types

```ts
export interface RadialAnchor {
  x: number;
  y: number;
  placement: "bottom-center" | "bottom-right";
}

export interface RadialViewport {
  width: number;
  height: number;
}

export interface RadialPlacement {
  x: number;
  y: number;
  angleDeg: number;
  radius: number;
}

export interface RadialGeometryInput {
  anchor: RadialAnchor;
  viewport: RadialViewport;
  level: 1 | 2;
  count: number;
}
```

---

## 8. Zustand Store

The radial menu should use a dedicated UI store.

## 8.1 Store shape

```ts
interface RadialCommandState {
  status: "neutral" | "warning" | "critical" | "stable" | "review";
  level: 0 | 1 | 2;
  isOpen: boolean;
  activeCommandId?: string;
  selectedDomain?: CommandDomain;
  anchor: RadialAnchor;
  viewport: RadialViewport;
  context: RadialRenderContext;
  drawerOpen: boolean;
  pendingAction?: RadialCommand;

  setViewport: (viewport: RadialViewport) => void;
  setContext: (context: RadialRenderContext) => void;
  setStatus: (status: RadialCommandState["status"]) => void;

  togglePrimary: () => void;
  openPrimary: () => void;
  closeAll: () => void;

  openSecondary: (domain: CommandDomain, commandId?: string) => void;
  selectCommand: (cmd: RadialCommand) => void;

  openDrawer: (cmd: RadialCommand) => void;
  closeDrawer: () => void;
}
```

## 8.2 Store rules
- `level = 0` means idle
- `level = 1` means primary ring open
- `level = 2` means secondary ring open
- `pendingAction` should be set only when the handoff type is known
- `closeAll()` must reset transient state cleanly

---

## 9. Command Resolution Strategy

Command trees should not be hardcoded in components.

Use a resolver utility.

## 9.1 Resolver flow

```text
Read render context
→ resolve allowed primary domains
→ apply priority ordering
→ resolve selected domain children
→ filter by permissions
→ attach badges and emphasis metadata
```

## 9.2 Example resolver API

```ts
export function resolvePrimaryCommands(
  context: RadialRenderContext
): RadialCommand[] {}

export function resolveSecondaryCommands(
  domain: CommandDomain,
  context: RadialRenderContext
): RadialCommand[] {}
```

## 9.3 Example logic
If `context.mode === "property"`:
- prioritize Portfolio, Leasing, Repairs, Financials
- hide commands irrelevant to the current object if necessary

If `context.mode === "unit"` and the unit is delinquent:
- Payments may move to top-center position
- badge count or warning emphasis may be attached

---

## 10. Geometry Engine

Use a dedicated geometry utility.

## 10.1 Responsibilities
- determine arc range
- compute evenly distributed item angles
- adjust for viewport collisions
- return placement coordinates

## 10.2 Constants

```ts
export const RADIAL_SIZES = {
  node: {
    desktop: 64,
    tablet: 58,
    mobile: 54,
  },
  radius: {
    primary: {
      desktop: 108,
      tablet: 96,
      mobile: 88,
    },
    secondary: {
      desktop: 164,
      tablet: 144,
      mobile: 132,
    },
  },
  item: {
    desktop: 48,
    mobile: 44,
  },
};
```

## 10.3 Algorithm outline

```text
1. Determine breakpoint (desktop/tablet/mobile)
2. Choose radius for current level
3. Determine preferred arc from anchor placement
4. If viewport constrained:
   - compress arc
   - rotate arc
   - adjust label direction
5. Compute angle step by count
6. Convert polar coordinates to x/y positions
7. Return placements
```

## 10.4 Example utility signature

```ts
export function computeRadialPlacements(
  input: RadialGeometryInput
): RadialPlacement[] {}
```

---

## 11. Animation Strategy

Use motion in a deterministic way.

## 11.1 Recommended library
Framer Motion is the most practical default.

## 11.2 Motion rules
- node open → primary ring reveal: 180ms
- primary select → secondary reveal: 160ms
- action handoff to drawer: 200–240ms
- collapse: 140–160ms

## 11.3 Suggested implementation pattern

```tsx
<AnimatePresence>
  {open && items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: placement.x,
        y: placement.y,
        transition: {
          duration: 0.18,
          delay: index * 0.01,
          ease: [0.2, 0.8, 0.2, 1],
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        x: 0,
        y: 0,
        transition: { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] },
      }}
    />
  ))}
</AnimatePresence>
```

## 11.4 Reduced motion
If reduced motion is enabled:
- no travel from origin
- fade only
- no ambient pulse
- immediate state changes where practical

---

## 12. Keyboard Navigation

Keyboard support must be first-class.

## 12.1 Hook
Implement a dedicated hook:
- `useRadialKeyboardNav`

## 12.2 Required behavior
- `Enter` / `Space`: open node
- arrow keys: cycle active radial item
- `Enter`: select active item
- `Esc`: collapse one level or fully close
- `Tab`: move focus out of the radial system predictably

## 12.3 Focus strategy
- keep focus trapped only when the system is acting like a modal overlay
- otherwise focus should remain recoverable and sane
- each `RadialItem` must have visible focus treatment

---

## 13. Accessibility Strategy

## 13.1 Screen reader model
- node: announced as primary command launcher
- items: announced as buttons with labels and badge counts
- secondary state: announce domain context

## 13.2 ARIA guidance
- node: `aria-expanded`, `aria-controls`
- menu container: `role="menu"` only if behavior truly matches menu semantics
- items: `role="menuitem"` or standard buttons depending on final interaction model
- drawer: standard dialog semantics when blocking

## 13.3 Accessibility fallback
Provide an alternate linear command list when:
- reduced motion + keyboard only user
- small mobile view with crowded second-level commands
- assistive context requires simpler structure

---

## 14. Handoff Modes

After command selection, the system should route into one of three handoff modes.

## 14.1 `navigate`
Use for:
- property workspace
- unit workspace
- payments workspace
- reconciliation
- full applicant review

```ts
if (cmd.actionType === "navigate" && cmd.href) {
  navigate(cmd.href);
}
```

## 14.2 `open_drawer`
Use for:
- send notice
- review estimate
- approve conditionally
- categorize transaction

```ts
if (cmd.actionType === "open_drawer") {
  store.openDrawer(cmd);
}
```

## 14.3 `execute`
Use only for small high-confidence actions.
Examples:
- acknowledge signal
- apply a ready preset
- trigger a non-destructive automation

```ts
if (cmd.actionType === "execute") {
  await executeCommand(cmd);
}
```

---

## 15. API / Data Integration

The radial system itself should not fetch large datasets directly.

Instead:
- read summarized context from app-level state or small context endpoints
- use React Query for contextual counts and status

## 15.1 Suggested context endpoint

```http
GET /copilot/radial-context
```

### Example response

```ts
interface RadialContextResponse {
  status: "neutral" | "warning" | "critical" | "stable" | "review";
  mode: "global" | "property" | "unit";
  currentPropertyId?: string;
  currentUnitId?: string;
  badges: Record<string, number>;
  priorities: Record<string, "default" | "elevated" | "critical">;
}
```

## 15.2 Why this matters
This keeps the radial system light.
It should not become a mini dashboard in disguise.

---

## 16. Mobile Strategy

Desktop can support true radial interaction well.
Mobile needs a hybrid strategy.

## 16.1 Mobile rules
- primary ring allowed
- secondary ring only if item count stays comfortable
- otherwise transition from primary radial to bottom sheet context list

## 16.2 Hybrid example
Tap node
→ primary ring expands
Tap Payments
→ bottom sheet opens with:
- Overdue
- Notices
- Autopilot
- Tenant Accounts
- Timeline

This keeps the spatial identity without sacrificing usability.

---

## 17. Tailwind Patterns

## 17.1 Command node
Use a strong silhouette with restrained depth.

Example class direction:

```ts
const nodeClass = `
  fixed bottom-6 left-1/2 z-50
  h-16 w-16 -translate-x-1/2
  rounded-full border border-cyan-400/20
  bg-slate-950/85 backdrop-blur-xl
  shadow-[0_16px_40px_rgba(0,0,0,0.45)]
`;
```

## 17.2 Radial items
```ts
const itemClass = `
  absolute flex h-12 w-12 items-center justify-center
  rounded-full border border-white/10
  bg-slate-900/90 text-white
  shadow-[0_10px_30px_rgba(0,0,0,0.35)]
  transition-colors
`;
```

## 17.3 Labels
```ts
const labelClass = `
  rounded-full border border-white/10
  bg-slate-950/90 px-3 py-1.5
  text-xs font-medium tracking-wide text-white/85
  backdrop-blur-md
`;
```

---

## 18. Testing Strategy

## 18.1 Unit tests
Test:
- geometry calculations
- priority ordering
- collision handling
- command tree resolution

## 18.2 Integration tests
Test:
- primary open / close
- secondary expansion
- drawer handoff
- route navigation
- keyboard navigation
- reduced motion behavior

## 18.3 End-to-end tests
Scenarios:
- open radial from global context
- open from property context
- open from unit context with delinquency
- send notice via radial flow
- open screening conditional approval drawer
- mobile fallback to sheet

---

## 19. Debugging / Observability

Track radial events for diagnostics.

## 19.1 Suggested analytics
- node_opened
- primary_domain_selected
- secondary_command_selected
- command_executed
- command_navigated
- drawer_opened
- drawer_completed
- menu_collapsed

## 19.2 Why this matters
You need evidence that the radial system is actually faster than a traditional menu.
Otherwise it is just aesthetic risk.

---

## 20. Implementation Risks

### Risk 1: over-complex command trees
Mitigation:
- limit primary and secondary counts aggressively

### Risk 2: inconsistent spatial memory
Mitigation:
- keep domain positions stable unless there is a strong priority reason to reorder

### Risk 3: mobile crowding
Mitigation:
- switch to sheet earlier, not later

### Risk 4: novelty over speed
Mitigation:
- measure command completion times against baseline navigation

---

## 21. Acceptance Criteria

1. The radial node is globally available from the app shell.
2. The primary ring opens in under 200ms.
3. Primary domains can be reached in one interaction.
4. Secondary commands render contextually and respect permissions.
5. No radial item or label clips out of viewport.
6. Keyboard navigation and escape logic are deterministic.
7. Reduced-motion mode is fully supported.
8. Mobile falls back to hybrid radial + sheet when density is high.
9. Command handoff works for navigate, drawer, and execute modes.
10. The system can be instrumented to compare speed against baseline navigation.

---

## 22. Final Implementation Principle

The radial command system is successful only if it becomes the shortest path between:
- knowing what needs attention
- entering the right domain
- seeing the right context
- taking the right action

If implementation complexity starts to fight that goal, simplify the radial system before you polish it.
