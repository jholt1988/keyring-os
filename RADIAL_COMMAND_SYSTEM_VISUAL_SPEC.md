# RADIAL_COMMAND_SYSTEM_VISUAL_SPEC.md
## Keyring OS

## 1. Purpose

This document defines the visual language for the Radial Command System.

It covers:
- spatial composition
- sizing and spacing
- orb styling
- ring item styling
- label treatment
- color logic
- depth and glow rules
- motion cues
- visual states
- responsive behavior
- examples of intended composition

This is the visual companion to:
- `RADIAL_COMMAND_SYSTEM_SPEC.md`
- `RADIAL_COMMAND_SYSTEM_IMPLEMENTATION.md`

---

## 2. Visual Intent

The Radial Command System should feel like:

- a **control nucleus**
- a **calm high-intelligence command surface**
- a **premium operating system object**
- a **precision instrument**

It should not feel like:
- a novelty animation
- a playful mobile menu
- a social-media floating action button
- a sci-fi gimmick
- a game HUD

The visual tone is:
- restrained
- dark
- spatial
- high-contrast
- deliberate

---

## 3. Core Visual Principles

1. **The node is the center of control**  
   It must immediately read as important.

2. **Hierarchy must be obvious**  
   Node > primary commands > secondary commands > labels.

3. **Motion must support clarity**  
   Visual change should show causality, not decoration.

4. **Depth should feel engineered**  
   Surfaces should feel layered and grounded, never foggy or random.

5. **Color is semantic**  
   Accent and urgency colors exist to communicate state and domain.

6. **The system should remain calm under pressure**  
   Critical states may intensify the node, but the interface must never feel panicked.

---

## 4. Radial Composition Model

## 4.1 Spatial Hierarchy

```text
Node (orb)
→ Primary domain ring
→ Secondary contextual ring
→ Label halo / contextual annotation
→ Focus surface handoff
```

### Reading order
The eye should move:
1. to the orb
2. to the currently emphasized radial item
3. to the label
4. to the execution surface or drawer

---

## 4.2 Default Anchor Position

### Desktop
- bottom-center
- lifted above the bottom safe area
- visually centered in the shell

### Tablet
- bottom-center
- slightly tighter spacing

### Mobile
- bottom-center
- may bias upward slightly to avoid thumb collision with native browser chrome

### Rule
The radial system must feel like a central control anchor, not a tucked-away shortcut.

---

## 5. Command Node (Orb)

## 5.1 Purpose
The orb is the single persistent interactive object that anchors the system.

## 5.2 Size

### Desktop
- 64px diameter

### Tablet
- 58px diameter

### Mobile
- 54px diameter

### Accessibility
- touch target must never drop below 44px

---

## 5.3 Shape
- perfect circle
- no squircle
- no hard bevel
- no thick rim

The silhouette must remain unmistakable at a glance.

---

## 5.4 Surface Treatment

### Base material
- dark glass / dark polished composite
- deep navy / charcoal base
- subtle transparency only
- strong center depth

### Internal layering
- soft inner glow
- restrained highlight near upper quadrant
- mild reflective gradient

### Avoid
- chrome
- mirrored metal
- loud neon
- plastic toy finish

---

## 5.5 Orb Border
- thin semantic ring
- 1px to 1.5px visible line
- slight intensity increase on hover/open/focus
- should not become a hard outline unless accessibility focus demands it

---

## 5.6 Orb Status Colors

### Neutral / Ready
- cyan-blue ring glow
- subtle internal light response

### Attention
- amber ring and faint warm accent
- should imply unresolved work, not failure

### Critical
- rose-red outer ring and stronger shadow depth
- critical state must remain elegant and controlled

### Stable
- minimal green accent
- use sparingly; stable should usually look calm rather than celebratory

### Review / AI Context
- violet or cool indigo accent
- reserved for decision or multi-step review states

---

## 5.7 Idle State
The orb remains visible at all times.

### Visual behavior
- soft breathing glow every 3–4 seconds
- almost imperceptible scale drift or luminance shift
- no constant bounce
- no spinning
- no orbiting particles

---

## 5.8 Hover State
Desktop only.

### Visual behavior
- slightly brighter border
- increased inner glow
- shadow becomes marginally deeper
- optional micro-lift of 1–2px

---

## 5.9 Open State
When expanded:
- orb remains visible as center anchor
- border intensifies
- internal highlight sharpens
- surrounding backdrop or vignette slightly increases contrast

The orb must remain legible as the source of all expanded items.

---

## 6. Ring Item Design

## 6.1 Purpose
Radial items represent primary or secondary commands.

They must feel related to the orb but subordinate to it.

---

## 6.2 Size

### Primary ring items
- 48px diameter desktop
- 46px tablet
- 44px mobile minimum

### Secondary ring items
- same or slightly smaller than primary, but never tiny
- 44–46px is preferred

---

## 6.3 Shape
- circular by default
- do not use pills for ring items
- labels carry the text; circles carry the command identity

---

## 6.4 Ring Item Surface
- dark elevated disc
- lower visual weight than orb
- semantic ring or accent glow
- readable icon at center

### Recommended composition
- dark background
- 1px subtle border
- icon in high-contrast white or near-white
- semantic accent as ring or light edge

---

## 6.5 Icon Styling
- simple, clean iconography
- line or lightly filled icons
- center aligned
- no oversized detail

### Rules
- icons must remain readable at 16–18px
- do not use highly decorative or inconsistent icon sets
- primary domains should have visually distinct icons

---

## 6.6 Item States

### Default
- calm elevated disc
- low semantic accent
- visible icon

### Hover / Focus
- stronger border
- slight scale increase
- clearer semantic accent
- optional label emphasis

### Active
- strongest semantic accent
- may gain glow ring
- label locked visible

### Disabled
- reduced opacity
- muted icon
- no glow
- cursor and interaction suppressed

### Critical
- item may receive badge or elevated ring intensity
- do not flood the entire item red unless action is inherently destructive

---

## 7. Radial Labels

## 7.1 Purpose
Labels translate icon meaning into operational clarity.

They must be readable, concise, and anchored to the selected item.

---

## 7.2 Label Container
Preferred treatments:
- pill label
- floating translucent capsule
- clean text with subtle backing surface

### Recommended style
- dark translucent backing
- mild blur
- thin border
- tight padding
- white or near-white text

---

## 7.3 Label Positioning
- placed outside the ring item
- offset according to item angle
- must not overlap orb or neighboring labels
- should bias outward from the center

### Position logic
- left-side items → labels open left
- right-side items → labels open right
- top-center items → labels stack below or above depending on space

---

## 7.4 Label Typography
- 11px–12px body on desktop
- 10px–11px on mobile if needed
- medium weight
- high contrast
- no exaggerated tracking

### Labels should be:
- operational
- short
- explicit

Good:
- Payments
- Units
- Reconcile
- Notices

Bad:
- Manage
- Actions
- Control
- Stuff

---

## 7.5 Label States
### Hidden
- idle state

### Reveal
- on ring expansion
- fade/slide in after item placement begins

### Locked
- selected or keyboard-focused item keeps label visible

---

## 8. Geometry & Spacing

## 8.1 Ring Radius

### Primary ring
- desktop: 108px
- tablet: 96px
- mobile: 88px

### Secondary ring
- desktop: 164px
- tablet: 144px
- mobile: 132px

---

## 8.2 Arc Treatment
Do not default to a full circle.

### Preferred opening
- upward fan from bottom-center anchor
- 160° to 220° arc

This keeps:
- the lower viewport clear
- the orb visually grounded
- labels readable
- commands near natural eye movement

---

## 8.3 Command Density Rules
### Maximum
- 6 primary items
- 5 secondary items preferred

### If crowded
- reduce visible items
- compress arc carefully
- push overflow into focus drawer or sheet
- never let labels collide

---

## 8.4 Safe Spacing
Maintain enough spacing so items never feel cramped.

### Recommended minimums
- 16px between item edges on desktop
- 12px absolute minimum on smaller screens

### Label spacing
- at least 8px from item edge
- enough gap to feel anchored but separate

---

## 9. Depth, Shadow, and Glow

## 9.1 Shadow Philosophy
Shadows should create grounding and hierarchy.

### Orb shadow
- deepest and softest
- broad radius
- implies anchor weight

### Ring item shadow
- smaller and lighter than orb
- still enough to separate from background

### Labels
- minimal shadow
- mostly rely on backing contrast

---

## 9.2 Glow Philosophy
Glow is used as a semantic signal, not decoration.

### Allowed glow uses
- orb status
- active command emphasis
- critical domain emphasis
- hover/focus state support

### Avoid
- multi-colored glows
- thick neon bloom
- glowing every item at once

---

## 9.3 Recommended Glow Structure
- subtle outer blur
- faint inner ring
- no hard halo edge

The effect should read as energy or readiness, not special effects.

---

## 10. Backdrop & Focus Treatment

## 10.1 Purpose
When the radial system opens, the rest of the interface should gently recede.

## 10.2 Preferred treatment
- light vignette
- subtle dim of background
- optional low-blur layer
- preserve visibility of active workspace

### Rule
The backdrop should not feel fully modal unless the resulting action surface is modal.

---

## 10.3 Open-State Focus
When a ring is open:
- background reduces in emphasis
- orb and ring items rise in contrast
- selected item may get slightly higher elevation than siblings

---

## 11. Domain Color Logic

Use semantic color mapping across domains.

### Recommended domain accents
- Portfolio → cyan / blue
- Payments → emerald
- Leasing → violet
- Screening → amber
- Repairs → teal or red-amber depending on severity
- Financials → green-blue
- Renewals → indigo or sky-blue

### Rule
The domain color should appear in:
- ring outline
- badge
- active label edge
- subtle focus shadow

Not in:
- full item fills
- giant gradients
- noisy background patterns

---

## 12. Motion Cues (Visual)

## 12.1 Expand
Items move from the orb to final position.
They should:
- scale up slightly
- fade in
- land softly
- reveal labels with a slight delay

## 12.2 Collapse
Items should return toward the node origin.
They should:
- fade quickly
- shrink slightly
- avoid dramatic reverse arcs

## 12.3 Active Selection
When a user selects a domain:
- active item sharpens
- sibling items soften
- secondary ring emerges from active item logic
- optional connecting motion is allowed, but keep it subtle

---

## 12.4 Handoff to Drawer / Focus Surface
The selected command should visually hand off into the next surface.

### Preferred cue
- active item remains lit for a beat
- focus drawer or panel fades/slides in
- the system should feel continuous, not like a new page appeared arbitrarily

---

## 13. Responsive Visual Behavior

## 13.1 Desktop
- full radial expression
- labels fully visible
- best spatial clarity

## 13.2 Tablet
- slightly tighter arcs
- fewer simultaneous labels if needed

## 13.3 Mobile
- radial must remain legible and thumb-friendly
- if the secondary ring becomes dense, transition to hybrid radial + bottom sheet
- never force crowded labels into unreadable overlap

---

## 14. Reduced Motion Visual Mode

When reduced motion is enabled:
- remove pulse
- remove travel arc animation
- use fade/instant position
- preserve hierarchy through contrast and depth instead of motion

The system must still look premium, just calmer and more static.

---

## 15. Example Compositions

## 15.1 Idle

```text
       subtle background intelligence

                ●
```

Visual read:
- orb present
- system alive
- no clutter

---

## 15.2 Primary Open

```text
          [Payments]

   [Portfolio]   ●   [Leasing]

   [Screening]       [Repairs]

          [Financials]
```

Visual read:
- orb remains dominant
- domains fan upward
- labels explain clearly
- no overlap

---

## 15.3 Secondary Open (Portfolio)

```text
           [Units]

 [Properties]   ●   [Vacancies]

      [Owners]     [Map]
```

Visual read:
- chosen domain becomes active
- second-level options appear with lower but clear emphasis
- still readable at a glance

---

## 15.4 Action Handoff

```text
      [Overdue] selected
             ↓
   drawer / focus panel appears
```

Visual read:
- command selection causes a meaningful surface change
- user understands the relationship between command and result

---

## 16. Anti-Patterns

Do not do any of the following:

- giant neon orb
- cartoonish bounce
- floating particles or sci-fi HUD clutter
- overuse of blur
- too many ring items
- labels inside tiny circles
- inconsistent icon sizes
- bright saturated gradient floods
- mobile crowding without fallback
- unstable layout that moves commands unpredictably every time

---

## 17. Visual QA Checklist

A build passes visual review only if:

1. The orb is immediately legible as the primary control object.
2. Primary commands feel subordinate to the orb but still highly tappable.
3. Labels are readable and collision-free.
4. Colors communicate state and domain without becoming noisy.
5. Motion feels precise, not playful.
6. The background recedes appropriately when the system opens.
7. The radial layout remains usable on tablet and mobile.
8. Reduced-motion mode still feels premium.
9. The visual system remains calm even in critical states.
10. The overall composition feels like a control system, not an app gimmick.

---

## 18. Tailwind / Token Guidance

## Orb
- dark shell
- soft semantic ring
- strong shadow
- subtle inner gradient

## Ring items
- dark elevated discs
- semantic accent border
- white icon
- restrained hover state

## Labels
- dark translucent pill
- white or slate-50 text
- low border contrast
- high readability

## Backdrop
- dark translucent veil
- optional radial vignette
- no opaque modal blackout unless action truly blocks the app

---

## 19. Final Visual Principle

The radial command system should feel like the user has put their hand on the control center of the product.

It should feel:
- precise
- intelligent
- spatial
- premium
- fast

It should never feel like the interface is showing off.

The visual system succeeds only when the user feels that the shortest path to action has become more elegant, more obvious, and more direct.
