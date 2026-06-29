# Operation: Mobile Book Page - Phase 0 Audit

Project:
ToDoHi

Phase:
Phase 0 - Current Narrow-Screen Dashboard Audit

Purpose:
Document the current dashboard structure, responsive behavior, and interaction
conflicts before implementing the mobile/tablet one-active-page open-book mode.

Source files reviewed:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`
- `frontend/src/components/dashboard/TodoPreview.tsx`
- `frontend/src/components/dashboard/TodoPreview.css`
- `frontend/src/components/dashboard/MemoPreview.tsx`
- `frontend/src/components/dashboard/MemoPreview.css`
- `frontend/src/components/dashboard/DashboardStats.tsx`
- `frontend/src/components/dashboard/DashboardStats.css`
- `frontend/src/components/dashboard/DailyPlanPreview.tsx`
- `frontend/src/components/dashboard/DailyPlanPreview.css`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Sidebar.css`

---

## 1. Current Dashboard Structure Audit

### Current render structure

The dashboard page is currently rendered as:

- `dashboard-page`
  - `dashboard-container`
    - `opened-book-spread`
      - `left-book-page`
        - `dashboard-greeting-bar`
          - greeting top row
          - quote row
        - `left-page-stack`
          - `TodoPreview`
          - `MemoPreview`
      - `book-spine`
      - `right-book-page`
        - `DashboardStats`
        - `DailyPlanPreview`
        - charts stack

### Current section grouping already matches the planned mobile page model

This is a strong foundation because the current content already maps cleanly to the
desired mobile page groups:

- Mobile Page 1
  - greeting
  - quote
  - todo preview

- Mobile Page 2
  - daily planner preview
  - memo preview

- Mobile Page 3
  - stats preview
  - chart stack

### Best structural insertion point for mobile-book mode

Best wrapper level:
- `opened-book-spread`

Reason:
- this is where left page, spine, and right page are currently composed
- desktop can keep this exact spread
- mobile/tablet can switch this area into a different page-stage layout without
  rewriting the internals of each preview

Recommended implementation direction:
- keep `DashboardPage.tsx` as the orchestration point
- introduce a mobile-only page-group wrapper at the dashboard page level
- shape that wrapper as:
  - one main active page region
  - one narrow right continuation strip
- do not rebuild `TodoPreview`, `MemoPreview`, `DashboardStats`, or `DailyPlanPreview`
  as separate mobile versions unless later tuning requires it

---

## 2. Current Responsive Behavior Audit

### What the dashboard does today

Current responsive behavior is halfway between desktop spread and stacked layout:

- under `900px`
  - `opened-book-spread` becomes one column
  - `book-spine` is hidden
- under `768px`
  - greeting area starts wrapping more
  - quote becomes multi-line
- under `425px`
  - page gutter and chart card sizing reduce more

### Why the current mobile layout still feels awkward

Even though the spread collapses to one column, it still behaves like:
- a stacked desktop composition
- not a focused one-active-page notebook system
- not an opened-book composition with a visible continuation cue

That creates:
- too much content visible at once
- weak information hierarchy on small screens
- book metaphor losing clarity
- cramped visual rhythm as multiple large sections compete vertically

### Important current CSS behavior to preserve on desktop

Desktop/laptop foundations that must stay untouched:
- two-page spread grid
- central `book-spine`
- left-page greeting + todo + memo composition
- right-page stats + planner + charts composition
- current desktop-specific compact tuning around `1025px+` and short-height screens

### Important current CSS rules that will conflict with mobile-book mode

1. Current collapse threshold is `900px`, but the new operation wants:
- desktop safe from `1024px+`
- mobile/tablet page mode below `1024px`

So the current breakpoint structure must be refactored.

2. `dashboard-page` becomes `overflow-y: auto` under `1200px`
- this is fine for stacked layout
- but mobile page-slide mode will need more deliberate overflow control

3. `opened-book-spread` currently changes from 3-column spread to 1-column stack
- this is not enough for the new one-active-page plus continuation-strip model

4. `left-page-stack` and `right-page-chart-stack` still depend on desktop-oriented
row sizing and min-heights
- these values will need mobile-specific reinterpretation

5. `dashboard-header-logo` is absolutely centered inside the greeting top row
- mobile page 1 can keep this, but the title area may need lighter scale tuning

---

## 3. Preview Surface Audit

### Todo Preview

Current strengths:
- self-contained header and filter system
- internal scroll area already exists
- list logic is already isolated

Current interaction traits:
- internal list scroll is on `.todo-list`
- mode-specific UI exists for rearrange/delete states
- drag and drop uses `dnd-kit`

Current mobile-book concern:
- page swipe must not interfere with:
  - todo list scroll
  - drag interaction
  - filter dropdown interaction

### Memo Preview

Current strengths:
- self-contained header actions
- list/grid mode already exists
- internal scroll area already exists
- multi-delete state already exists

Current interaction traits:
- preview can navigate to memo board
- internal scroll is on `.memo-preview-list`
- list and grid layouts are both active UX surfaces

Current mobile-book concern:
- page swipe must not fight with:
  - memo list scroll
  - grid/list interaction
  - multi-delete selection
  - navigation button cluster near the header

### Daily Planner Preview

Current state:
- very lightweight placeholder
- currently low risk structurally

Important note:
- `DailyPlanPreview.css` is currently empty

This makes planner preview a good candidate for later mobile tuning because:
- no heavy existing CSS conflict is coming from that file yet

### Stats Preview

Current strengths:
- already compacted into 2 columns
- clear stat grouping

Current mobile-book concern:
- as a full-width narrow-screen block, 2-column stats can still feel dense
- page 3 may need simplified narrow-screen stat spacing or single-column fallback

### Charts Stack

Current traits:
- chart cards are simple stacked blocks
- `right-page-chart-stack` already scrolls vertically

Current mobile-book concern:
- page 3 must balance stats + charts without feeling like a long data dump

---

## 4. Sidebar / Mobile Navigation Audit

### Current sidebar behavior

Current sidebar is still a desktop-first external bookmark + panel system.

It includes:
- top rail quick actions
- bottom rail account actions
- expandable bookmark panel
- drag handle for horizontal movement

### Why current sidebar should not remain the main mobile navigation pattern

For tablet and phone:
- the sidebar still behaves like a constrained desktop bookmark system
- it competes with small-screen width
- it is not the best touch-first dashboard navigation pattern for the new page-turn model

### Current mobile sidebar concerns

1. The sidebar still exists below `1024px`
- it shrinks, but it does not become the new planned bottom-nav system

2. The sidebar panel and rail are layered around the dashboard shell
- this creates complexity we do not need for the new mobile navigation flow

3. The mobile-book operation already has a better narrow-screen direction:
- bottom nav
- direct jump actions
- swipe + indicators

### Audit conclusion for sidebar

Recommended direction:
- keep the existing sidebar system for desktop
- replace narrow-screen dashboard navigation with a mobile-only bottom nav model
- do not try to force the current rail/panel concept into the phone/tablet dashboard shell

---

## 5. Scroll and Gesture Conflict Audit

### Confirmed internal scroll regions

Current scrollable zones include:

- `dashboard-page` under tighter widths
- `right-page-chart-stack`
- `bento-scroll`
- `.todo-list`
- `.memo-preview-list`
- sidebar panel
- failed task list in sidebar

### Gesture conflict risks

If swipe navigation is added naively, it can conflict with:

1. Todo list vertical scroll
2. Memo preview vertical scroll
3. Todo rearrange drag
4. Dropdown interactions in todo preview
5. Button taps near page edges
6. Modal interaction overlays

### Recommended protection rule

For mobile-book mode:
- horizontal page swipe should be conservative
- vertical content scroll must stay higher priority inside interactive scroll regions
- swipe should use edge-first or threshold-based activation

This is one of the most important implementation constraints.

---

## 6. Phase 0 Findings Summary

### What is ready

- the dashboard content is already grouped in a way that maps well to 3 mobile pages
- `DashboardPage.tsx` is the correct orchestration layer
- preview components are already modular enough to reuse
- desktop and mobile can be split without rebuilding the whole dashboard

### What must change

- replace the current `<900px` stacked-spread idea with `<1024px` mobile-book mode
- add explicit `active page` state for tablet/phone
- stop relying on stacked full-dashboard view for narrow screens
- replace sidebar-first narrow-screen navigation with bottom nav + indicators + swipe

### Main risk areas

- gesture conflict with inner scrollable content
- preserving desktop spread untouched
- modal layering over the mobile page shell
- making page 3 feel readable rather than dense

---

## 7. Recommended Next Step

Proceed to:
- `Phase 1.1 - Breakpoint Gate`

Reason:
- the structure audit confirms we can start safely by introducing the desktop/mobile
  layout split first
- this will create the base for the later page wrapper, page state, swipe, and bottom nav

## Phase 0 Status

Phase 0.1 - Structure Audit:
- completed

Phase 0.2 - Responsive Behavior Audit:
- completed

Phase 0.3 - Interaction Audit:
- completed

Overall Phase 0:
- completed
