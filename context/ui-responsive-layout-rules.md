# UI Responsive Layout Rules

## Project
ToDoHi

## Purpose
This document defines responsive sizing and layout behavior for the ToDoHi opened-book dashboard so future UI reformation phases stay consistent across mobile, tablet, laptop, desktop, and 4K screens.

## Responsive Design Principle
- Design desktop/laptop first for the opened-book dashboard experience.
- Preserve readability and data clarity before decorative fidelity.
- Avoid stretching the book shell infinitely on large screens.
- Avoid forcing full two-page spread on small screens when usability drops.
- Prefer fluid sizing with `min()`, `max()`, `clamp()`, `%`, and `max-width`.
- Avoid fragile fixed pixel-only layout systems.

## Layout Layers
1. Table/workspace background
2. Blue leather book shell
3. External book-tab sidebar rail
4. Opened book spread
5. Left page
6. Spine/rings/seam
7. Right page
8. Inner dashboard modules

## Breakpoint Table
| Device/Range | Width | Book Shell Behavior | Page Layout Behavior | Sidebar Behavior | Notes |
|---|---:|---|---|---|---|
| Mobile Base | <=425px | Full-width shell with safe side padding | Single-page or stacked notebook mode | Drawer or compact toggle button | Prioritize feature access and readability |
| Mobile L | 425px | Full-width shell with tighter frame | Stacked layout preferred | Drawer/tab button mode | No horizontal scroll |
| Tablet / iPad | 768px | `min(100% - 24px, 740px)` shell target | Single-column or simplified book mode | Rail may become overlay/drawer fallback | Keep modules readable before metaphor |
| Small Desktop / Laptop | 1024px | `min(100% - 32px, 980px)` shell target | Two-page may be compact; allow reduced gaps/padding | Rail outside left page, avoid overlap | Compact mode may be needed |
| Desktop | 1440px | `min(100% - 48px, 1360px)` | Stable two-page spread target | Collapsed rail beside left page, expanded outward-left | Primary design target |
| Large Desktop / 4K | 1920-2560px+ | `clamp(1320px, 86vw, 1680px)` at 1920, `clamp(1500px, 72vw, 1840px)` at 2560 | Keep two-page spread centered and readable | Keep external rail behavior; no content overlap | Increase table whitespace, not content stretch |

## Recommended Width Strategy
- Use `width: min(100% - safe-padding, max-width)` for shell sizing.
- Use explicit `max-width` caps for desktop and 4K.
- Keep side table/background visible as part of identity.
- Maintain readable page widths and module proportions.

Suggested baseline targets (adjustable after visual QA):
- Mobile: shell width `100%`, stacked/single-page mode.
- Tablet 768px: `min(100% - 24px, 740px)`.
- Small Desktop 1024px: `min(100% - 32px, 980px)`.
- Desktop 1440px: `min(100% - 48px, 1360px)`.
- Full HD 1920px: `clamp(1320px, 86vw, 1680px)`.
- 4K 2560px: `clamp(1500px, 72vw, 1840px)`.

## Book Shell Rules
- Shell should remain centered or intentionally placed.
- Table background should remain visible around shell.
- Shell must not touch viewport edges on desktop.
- Shell must not create horizontal overflow.
- Blue leather frame should remain visible but not oversized.
- Use responsive shell padding plus max-width caps.

## Two-Page Spread Rules
- Desktop/laptop should use two-page spread by default.
- Left/right page measurements should remain stable.
- Spine/seam should be subtle and not consume excessive width.
- Reduce page padding/gaps before collapsing layout.
- If still constrained, switch to stacked/simplified mode.

## Left Page Rules
Left page contains:
- Greeting + Date/Time
- To-Do Preview
- Memo Preview

Rules:
- Must not be covered by sidebar tab rail on desktop.
- Content must remain readable at all supported widths.
- Task/memo cards should not overflow horizontally.
- Page padding may shrink responsively.

## Right Page Rules
Right page contains:
- Stats Bar
- Daily Planner Preview
- Charts/Progress Stack

Rules:
- Stats bar stays compact and usable.
- Daily planner remains prominent.
- Charts can stack vertically on tighter widths.
- Avoid squeezing chart cards into unreadable states.

## External Sidebar Book-Tab Rail Rules
- Sidebar rail is outside the left page container.
- Sidebar is not inside dashboard paper page content flow.
- Collapsed rail sits beside left page.
- Collapsed rail must not cover left-page content on desktop.
- Expanded panel should open outward-left on desktop where space allows.
- Expansion must not disturb left/right page measurements.
- On smaller screens, drawer/overlay fallback is allowed.

## Mobile / Narrow Screen Rules
- Full two-page metaphor is optional on mobile.
- Prefer stacked/single-page notebook mode.
- Sidebar can become drawer/tab button.
- Preserve feature access over strict visual metaphor.
- Avoid horizontal scrolling.
- Prioritize usability and tap readability.

## 4K / Large Screen Rules
- Do not stretch shell to fill entire screen width.
- Use max-width and clamp caps.
- Keep book centered on table workspace.
- Add whitespace around shell instead of stretching modules.
- Preserve comfortable line lengths and chart/card proportions.

## CSS Implementation Guidelines
- Prefer `clamp()`, `min()`, `max()`, `%`, and `max-width`.
- Use centralized layout tokens/variables.
- Use container queries only if already supported and justified.
- Avoid scattered magic numbers across files.
- Keep layout sizing logic centralized and reusable.

Suggested token names:
- `--layout-mobile-padding`
- `--layout-tablet-padding`
- `--book-shell-max-sm`
- `--book-shell-max-md`
- `--book-shell-max-lg`
- `--book-shell-max-xl`
- `--book-shell-max-4k`
- `--book-page-min-width`
- `--book-spine-width`
- `--sidebar-tab-rail-width`
- `--sidebar-expanded-width`

## QA Checklist
Validate at:
- 425px
- 768px
- 1024px
- 1440px
- 1920px
- 2560px

For each size, verify:
- no horizontal overflow
- sidebar accessible
- left page readable
- right page readable
- stats bar usable
- planner not crushed
- charts readable
- table background visible where appropriate
- book shell not overstretched

## No-Go Rules
- Do not hardcode one fixed desktop width only.
- Do not let 4K stretch content endlessly.
- Do not force desktop two-page spread onto mobile.
- Do not let sidebar cover left page on desktop.
- Do not solve layout by hiding important content.
- Do not change feature logic for responsiveness.
- Do not duplicate layout systems.

## Final Guiding Rule
Responsive behavior should preserve the opened-book identity where it is useful, but usability and readability come first.
