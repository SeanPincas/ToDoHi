# Operation: Mobile Book Page - Implementation Phases

This document breaks the mobile/tablet dashboard reform into smaller implementation
slices so we can rebuild the narrow-screen experience safely without disturbing
the desktop opened-book layout.

Operation context source:
- `context/mobile-book-page-operation.md`

Core responsive rule:
- desktop and laptop from `1024px` and above stay on the current opened-book spread
- tablet and phone below `1024px` switch to a single active dashboard page system

Core product direction:
- one focused main dashboard page at a time on tablet/phone
- preserve an opened-book feel with a narrow right continuation strip
- swipe left/right navigation between dashboard page groups
- clickable page indicators
- bottom navigation for direct access and shortcuts
- keep the notebook/planner theme while improving readability and touch behavior

Do not change:
- desktop spread behavior
- routes
- APIs
- dashboard feature logic
- preview feature meaning
- modal business logic

---

## Phase 0 - Current Narrow-Screen Dashboard Audit

Purpose:
- inspect the current dashboard structure and identify exactly where mobile/tablet
  book-mode should attach without breaking desktop

### Phase 0.1 - Structure Audit
Goal:
- map the current dashboard layout tree and preview grouping

Steps:
- inspect the dashboard page container structure
- inspect left-page and right-page wrappers
- inspect where greetings, quote, todo, memo, stats, planner, and charts render
- identify the best wrapper level for mobile page grouping

Primary files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`

Done when:
- we know which existing modules belong to mobile page 1, 2, and 3

### Phase 0.2 - Responsive Behavior Audit
Goal:
- identify current breakpoints and rules that would conflict with single-page mode

Steps:
- inspect dashboard mobile/tablet media queries
- inspect sidebar rail behavior on small screens
- inspect any existing stacked-mode logic
- note any fixed heights, gaps, or overflow rules that will fight page-mode

Primary files:
- `frontend/src/pages/DashboardPage.css`
- related dashboard preview CSS files

Done when:
- we have a conflict list before implementation starts

### Phase 0.3 - Interaction Audit
Goal:
- identify where gesture conflict may happen

Steps:
- inspect scrollable areas inside:
  - todo preview
  - memo preview
  - stats/chart regions if applicable
- identify where page swipe must not steal inner scroll behavior

Done when:
- we know which regions need protected vertical scroll behavior

---

## Phase 1 - Mobile Book Mode Foundation

Purpose:
- establish a narrow-screen-only page system while leaving desktop untouched

### Phase 1.1 - Breakpoint Gate
Goal:
- create one explicit dashboard mode split between desktop and mobile/tablet

Steps:
- define the layout switch at `< 1024px`
- keep current spread rendering for `1024px+`
- add a clear class/state for mobile book mode

Primary files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`

Done when:
- dashboard can render in two modes without cross-contaminating desktop behavior

### Phase 1.2 - Page Group Data Model
Goal:
- define the three mobile dashboard page groups in code

Steps:
- group existing dashboard sections into:
  - page 1: greetings + quote + todo
  - page 2: daily planner + memo
  - page 3: stats + charts
- keep grouping declarative and easy to maintain

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- mobile dashboard page composition is explicit and stable

### Phase 1.3 - Active Page State
Goal:
- introduce a single source of truth for the current mobile dashboard page

Steps:
- add `activeDashboardPage` state
- clamp navigation between page 1 and page 3
- keep desktop unaffected

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- the mobile dashboard can change pages predictably through state

---

## Phase 2 - Mobile Open-Book Layout Shell

Purpose:
- build the actual one-page-at-a-time visual layout while preserving the mobile opened-book feel

### Phase 2.1 - Mobile Page Wrapper
Goal:
- create a narrow-screen page-stage container that holds the page groups

Steps:
- add mobile-only page viewport wrapper
- add a main active page region
- add a narrow right continuation strip
- place page groups inside a slideable track
- keep the main page width stable and fully readable

Primary files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`

Done when:
- mobile dashboard visually behaves like one active content page with hidden siblings and a visible continuation strip

### Phase 2.2 - Slide Transition
Goal:
- add lightweight page movement

Steps:
- use a simple horizontal transform transition
- keep the continuation strip visually attached during movement
- keep the motion subtle and performant
- avoid heavy page-curl or 3D effects

Primary files:
- `frontend/src/pages/DashboardPage.css`

Done when:
- moving between pages feels smooth without performance-heavy animation

### Phase 2.3 - Active Page Spacing
Goal:
- make each mobile page feel breathable and readable

Steps:
- tune vertical spacing per mobile page
- avoid desktop-style tightness
- reduce cramped stacking on tablet/phone

Primary files:
- `frontend/src/pages/DashboardPage.css`
- preview CSS files if required

Done when:
- each mobile page reads like a focused planner sheet, not a squeezed dashboard

---

## Phase 3 - Page Navigation Controls

Purpose:
- add touch and tap navigation methods for the mobile book mode

### Phase 3.1 - Clickable Page Indicators
Goal:
- add 3 direct-jump page indicators

Steps:
- add `3 dots` or `3 dash lines`
- make each indicator clickable
- reflect active page clearly

Primary files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`

Done when:
- users can jump directly to any dashboard page on mobile/tablet

### Phase 3.2 - Swipe Navigation
Goal:
- add left/right swipe behavior

Steps:
- swipe left = next page
- swipe right = previous page
- optional tap on the continuation strip = next page
- clamp at first and last page
- keep the implementation light

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- mobile page turning works naturally by gesture

### Phase 3.3 - Gesture Safety
Goal:
- reduce conflicts between page swipe and inner vertical scroll

Steps:
- make swipe activation conservative
- prefer edge-first or threshold-based activation
- protect scrollable preview regions from accidental page turns

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- scrolling todo/memo content does not feel hijacked by page navigation

---

## Phase 4 - Bottom Navigation Rework For Mobile/Tablet

Purpose:
- replace the old narrow-screen sidebar rail concept with a more usable bottom nav

### Phase 4.1 - Bottom Nav Shell
Goal:
- add a mobile-only bottom navigation bar

Target structure:
- `[ More ] [ Memo ] [ Home ] [ Planner ] [ Settings ]`

Steps:
- add mobile bottom nav wrapper
- keep `Home` visually centered
- keep layout touch-friendly and uncluttered

Primary files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DashboardPage.css`

Done when:
- the bottom nav exists on tablet/phone without affecting desktop

### Phase 4.2 - Bottom Nav Behaviors
Goal:
- wire the bottom nav to the agreed actions

Steps:
- `Memo` opens `MemoBoardPage`
- `Home` returns to mobile dashboard page 1
- `Planner` opens the daily planner modal entry point
- `More` opens a drop-up menu for overflow actions
- `Settings` opens a drop-up with user settings and logout

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- bottom nav buttons perform their intended actions reliably

### Phase 4.3 - Mobile Sidebar Icon Direction
Goal:
- align icon semantics with the new mobile nav model

Steps:
- move the old burger mental model into the bottom-nav `More` role
- use the newer `sidebar` icon direction where appropriate elsewhere
- keep icon language consistent

Done when:
- mobile nav icon meaning feels clean and intentional

---

## Phase 5 - Page Content Density Reformation

Purpose:
- tune each preview so it behaves like a preview on smaller screens instead of a compressed desktop module

### Phase 5.1 - Mobile Greetings and Quote
Goal:
- tune the top greeting area for page 1 narrow-screen readability

Steps:
- rebalance greeting content
- tune quote row spacing
- avoid crowding title, time, and quote areas

Primary files:
- dashboard header/greeting CSS and TSX

Done when:
- page 1 starts calm and readable on mobile/tablet

### Phase 5.2 - Mobile Todo Preview Density
Goal:
- keep todo preview usable as the main page-1 feature

Steps:
- tune filter density
- tune action button density
- preserve list scroll behavior
- avoid horizontal pressure

Primary files:
- `frontend/src/components/dashboard/TodoPreview.tsx`
- `frontend/src/components/dashboard/TodoPreview.css`

Done when:
- todo preview feels like a focused mobile sheet section

### Phase 5.3 - Mobile Daily Planner Preview Density
Goal:
- simplify planner preview presentation for page 2

Steps:
- preserve feature identity
- reduce visual crowding
- keep it obviously a preview, not the full planner workspace

Primary files:
- `frontend/src/components/dashboard/DailyPlanPreview.tsx`
- `frontend/src/components/dashboard/DailyPlanPreview.css`

Done when:
- planner preview remains readable and inviting on narrow screens

### Phase 5.4 - Mobile Memo Preview Density
Goal:
- keep memo preview compact and readable on page 2

Steps:
- tune header/action button density
- tune grid/list behavior if needed for mobile mode
- preserve internal scrolling and preview meaning

Primary files:
- `frontend/src/components/dashboard/MemoPreview.tsx`
- `frontend/src/components/dashboard/MemoPreview.css`

Done when:
- memo preview behaves like a true preview, not a compressed board

### Phase 5.5 - Mobile Stats and Charts Density
Goal:
- keep page 3 readable without turning into a long cramped data dump

Steps:
- tune stats strip/list layout for narrow screens
- tune chart stack spacing
- reduce visual heaviness

Primary files:
- `frontend/src/components/dashboard/DashboardStats.tsx`
- `frontend/src/components/dashboard/DashboardStats.css`
- chart preview CSS/TSX files

Done when:
- page 3 remains scannable and not exhausting on phone/tablet

---

## Phase 6 - Mobile State Persistence and UX Stability

Purpose:
- make mobile page navigation feel stable and predictable

### Phase 6.1 - Page State Persistence
Goal:
- preserve the current mobile dashboard page during normal interaction

Steps:
- keep active page stable during dashboard re-renders
- avoid resetting to page 1 unnecessarily
- preserve page-specific UI state where reasonable

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- users do not feel like the dashboard keeps losing their place

### Phase 6.2 - Modal Layer Safety
Goal:
- ensure modals open cleanly above the mobile page system

Steps:
- verify z-index layering
- make sure modals do not trigger page movement underneath
- preserve current page after modal close

Primary files:
- dashboard page and shared modal CSS as needed

Done when:
- modal interactions feel independent from the mobile page-turn shell

### Phase 6.3 - Route and Return Stability
Goal:
- make cross-feature jumps feel natural

Steps:
- verify:
  - `Memo` button to memo board
  - return paths back to dashboard
  - `Home` behavior from mobile dashboard state

Done when:
- users can move between dashboard and feature pages without confusion

---

## Phase 7 - Tablet and Phone Polish Pass

Purpose:
- tailor the single-page system separately for tablet and phone instead of treating them as one size

### Phase 7.1 - Tablet Polish
Goal:
- give tablet a roomier single-page layout

Steps:
- tune spacing, type, and card density for `601px` to `1023px`
- preserve book feel without wasted space

Done when:
- tablet feels like a refined planner page, not a blown-up phone view

### Phase 7.2 - Phone Polish
Goal:
- make phone mode tighter and clearer

Steps:
- reduce bulky spacing where needed
- keep touch targets safe
- avoid long overcrowded header/tool rows

Done when:
- phone mode feels intentional and touch-friendly

### Phase 7.3 - Narrow-Height Safety
Goal:
- support shorter viewports gracefully

Steps:
- inspect compressed-height cases
- keep bottom nav, indicators, and page content from colliding

Done when:
- short screens remain usable without awkward stacking

---

## Phase 8 - Verification and Regression Safety

Purpose:
- confirm the new mobile-book mode is stable and desktop remains safe

### Phase 8.1 - Desktop Regression Check
Goal:
- verify `1024px+` desktop behavior is unchanged

Steps:
- inspect opened-book spread
- inspect sidebar rail behavior
- inspect left/right page composition

Done when:
- desktop still looks and behaves like the current intended book spread

### Phase 8.2 - Mobile/Tablet Navigation QA
Goal:
- validate the full page-turn navigation model

Steps:
- verify swipe
- verify indicators
- verify bottom nav
- verify page clamping

Done when:
- all mobile navigation paths are reliable

### Phase 8.3 - Inner Scroll Conflict QA
Goal:
- validate that inner scrolling still works

Steps:
- test todo preview scrolling
- test memo preview scrolling
- test mixed swipe/scroll behavior

Done when:
- inner content remains usable without gesture frustration

### Phase 8.4 - Build and Final QA
Goal:
- confirm implementation health

Steps:
- run frontend build
- perform final visual QA across:
  - phone
  - tablet
  - desktop

Done when:
- the mobile-book dashboard is stable, readable, and regression-safe

---

## Recommended Execution Order

Recommended start:
1. Phase 0 - audit
2. Phase 1 - breakpoint gate and page state
3. Phase 2 - page shell
4. Phase 3 - indicators and swipe
5. Phase 4 - bottom nav
6. Phase 5 - preview density tuning
7. Phase 6 - state and modal safety
8. Phase 7 - tablet/phone polish
9. Phase 8 - verification

## Success Definition

This operation is successful when:
- desktop remains untouched
- tablet and phone no longer show a cramped two-page spread
- the dashboard feels like one planner page at a time while still hinting at the next page through a right continuation strip
- users can navigate by swipe, indicators, and bottom nav
- previews stay readable and stable
- narrow-screen UX feels intentional instead of squeezed
