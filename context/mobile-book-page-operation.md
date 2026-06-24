# Operation: Mobile Book Page

Project:
ToDoHi

Goal:
Reform the dashboard experience on tablet and phone resolutions so it no longer forces the opened two-page desktop book spread into cramped small-screen layouts.

Core Direction:
Desktop keeps the current opened-book spread.
Tablet and phone switch into a single active book-page system with slide navigation between page groups.

Execution Rule:
This is a responsive layout reformation for narrow screens only.

Preserve:
- Desktop and laptop dashboard behavior from `1024px` and above
- Existing dashboard feature logic
- Existing routes
- Existing APIs
- Existing state management
- Existing preview component internals unless needed for mobile containment
- Existing modal behavior and feature access

Improve:
- Mobile readability
- Tablet readability
- Book metaphor consistency on smaller screens
- Navigation clarity
- Touch ergonomics
- Section breathing space
- Page grouping and information hierarchy

## Problem Statement

The current dashboard layout still behaves too much like a desktop opened-book spread on tablet and phone resolutions.

Result:
- pages feel cramped
- the opened-book metaphor breaks visually
- modules become chunky or awkward
- controls compete for limited width
- the user sees too much content at once with poor breathing space

For small screens, the dashboard should feel like turning through one notebook page at a time rather than shrinking the whole open spread.

## Mobile/Tablet North Star

On phone and tablet, ToDoHi should feel like:
- a planner page you can flip through
- one focused sheet at a time
- smooth but lightweight page movement
- touch-friendly navigation
- readable previews instead of cramped dense dashboards

Avoid:
- squeezing the full two-page spread into narrow widths
- preserving decorative fidelity at the cost of usability
- thick permanent side-edge controls that steal page width
- heavy page curl animation
- gesture conflict with scrollable inner cards

## Responsive Mode Split

Desktop / laptop:
- `1024px` and above
- keep current opened-book spread behavior

Tablet:
- `601px` to `1023px`
- single-page dashboard book mode

Phone:
- `600px` and below
- single-page dashboard book mode with stronger compaction

## Single-Page Dashboard Structure

Tablet and phone should use 3 dashboard page groups:

### Page 1
- Greetings bar
- Quote row
- To-Do preview

### Page 2
- Daily Planner preview
- Memo preview

### Page 3
- Stats preview
- Charts / progress previews

## Navigation Model

Primary navigation:
- swipe left = next page
- swipe right = previous page

Secondary navigation:
- 3 clickable page indicators
- indicators may be dots or short dash lines

Utility navigation:
- bottom navigation bar

Important:
Do not rely on always-visible thick left/right page-edge controls because they consume valuable width and make the active page feel thinner.

Use:
- invisible or subtle edge swipe zones if needed
- clickable indicators
- bottom navigation

## Bottom Navigation Rules

Target structure:
- `[ More ] [ Memo ] [ Home ] [ Planner ] [ Settings ]`

Behavior:
- `More`
  - opens a drop-up menu for overflow actions
- `Memo`
  - opens `MemoBoardPage`
- `Home`
  - stays at the visual center
  - returns to dashboard page 1
- `Planner`
  - opens the Daily Planner modal / feature entry point
- `Settings`
  - opens a drop-up area for user settings and logout

Icon note:
- the burger icon used for the old sidebar concept should shift to this new mobile bottom-nav `More` role
- the sidebar trigger icon elsewhere should use the newer `sidebar` icon direction if needed

## Page Indicators

Indicators should:
- reflect the current active dashboard page
- be clickable
- allow direct jump to pages 1, 2, and 3

Possible visuals:
- 3 dots
- 3 short dash lines

Requirement:
- indicators must supplement swipe, not replace it

## Gesture Rules

Swipe should feel supportive, not disruptive.

Rules:
- horizontal swipe should trigger page movement
- vertical scroll inside cards should continue to work normally
- if gesture conflict appears, prioritize scroll inside interactive/scrollable content
- edge-first swipe activation is preferred

Important conflict to avoid:
- user tries to scroll a preview list or modal content
- page swipe steals the interaction unexpectedly

## State Persistence Rules

When navigating between mobile dashboard pages:
- preserve active filters where reasonable
- preserve scroll positions where possible
- do not reset page-specific preview state unnecessarily
- returning to a page should feel stable, not rebuilt from scratch every time

## Modal Layering Rules

Modals must:
- appear above the mobile page system
- not break page navigation state
- not accidentally trigger swipe/page movement underneath
- preserve current dashboard page when dismissed

## Density Rules For Previews

Because Daily Planner and Memo are previews:
- prioritize readability over density
- show a focused preview slice, not full heavy content
- allow direct navigation to the full feature page/modal when needed

## Animation Rules

Animation style:
- simple slide transition only

Avoid:
- complex page curl animation
- 3D transforms that hurt performance
- decorative motion that causes lag on mobile devices

Performance priority:
- light transitions
- predictable movement
- stable frame rate

## Implementation Principles

- keep desktop spread untouched
- build a mobile-only page-group wrapper
- route existing dashboard modules into page groups without rewriting their feature logic
- centralize responsive layout logic instead of scattering one-off rules
- keep mobile controls reusable and theme-consistent

## Expected Mobile UX Outcome

When complete:
- the dashboard feels intentional on tablet and phone
- only one active book page is shown at a time
- users can swipe or tap indicators to move through dashboard pages
- bottom nav gives quick access to memo board, planner, home, and settings
- the opened-book metaphor stays believable without cramming the desktop spread into small screens

## Planned Next Step

After this context file:
- create phased implementation steps for `Operation: Mobile Book Page`
- start with structural page grouping and navigation shell
- then add swipe, indicators, and bottom nav behavior
- then polish responsive density and transitions
