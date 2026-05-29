# Project Goal: UI Designing Reformation — Phases and Steps

Project:
ToDoHi

Goal:
Reform the current UI/UX into a notebook-sheet / planner-style productivity dashboard while preserving the existing app structure and functionality.

Execution Rule:
This is a UI tuning and refinement project, not a full rebuild.

Preserve:
- Dashboard layout structure
- Sidebar structure
- Existing routes
- Existing APIs
- Existing feature logic
- Existing state management
- Existing task/memo/daily-plan behavior

Improve:
- Visual identity
- Theme consistency
- Notebook/paper aesthetic
- Typography hierarchy
- Border weight
- Background treatment
- Component density
- Button styling
- Section clarity
- Dashboard readability
- Overall polish

## Visual North Star

ToDoHi should feel like an opened notebook for daily execution.

- Sidebar should feel like the left notebook side / planner index.
- Dashboard should feel like the right notebook page.
- Main dashboard surface should feel like clean lined paper.
- Sections should feel like organized planner areas drawn on the page, not heavy SaaS cards.

The UI should feel:
- calm
- personal
- focused
- lightly handcrafted
- readable
- motivational
- notebook-like
- data-aware

Avoid:
- corporate SaaS dashboard look
- heavy admin panel look
- harsh boxed wireframe look
- excessive saturated colors
- noisy wallpaper/background
- decorative choices that reduce readability

## Design System Rules

- Prefer CSS variables over hardcoded colors.
- Prefer reusable style tokens over repeated local values.
- Avoid adding duplicate palette systems.
- Use thin ink-like borders instead of thick heavy outlines.
- Use soft paper-like surfaces instead of flat pure white boxes.
- Keep handwritten fonts mainly for headings, labels, and personality text.
- Keep dense dashboard data readable with cleaner fonts.
- Buttons should feel like planner labels/tabs, not default web buttons.
- Empty states should feel encouraging and personal.
- Every phase must preserve existing behavior unless explicitly stated.

## No-Go Rules

- Do not rebuild the dashboard from scratch.
- Do not change API payloads.
- Do not change backend behavior.
- Do not change resetHour logic.
- Do not replace working components with new components unless instructed.
- Do not add large dependencies without approval.
- Do not make broad changes across many files in one phase.
- Do not sacrifice readability for decoration.
- Do not turn every element into handwritten style.

## Pre-Change Requirement

Inspect the frontend style system before changing UI.

Required inspection targets:
- Global CSS files
- CSS variables
- Theme/accent color definitions
- Font imports
- Layout CSS
- Sidebar CSS
- Dashboard CSS
- Shared button/card styles if they exist

Important:
The project may already have global CSS variables and accent colors. Do not add duplicate palette variables without checking what already exists.

Responsiveness Rule (Global):
For every phase and feature block, automatically review and improve responsiveness not only at the container level but also for internal UI elements, including buttons, text, spacing, padding, controls, and content alignment.

==================================================
PHASES
==================================================

Phase 0 - UI Style System Audit

Goal:
Inspect the existing frontend styling system before making visual changes.

Purpose:
Avoid duplicate theme variables, avoid unnecessary rewrites, and understand where UI styles are controlled.

Steps:
- Inspect global CSS files.
- Identify existing CSS variables.
- Identify existing accent colors.
- Identify current font imports.
- Identify layout CSS files.
- Identify sidebar styling files.
- Identify dashboard styling files.
- Identify shared button/card/form styles if they exist.
- Identify visual mismatch against target:
  - areas too boxed/heavy
  - buttons too saturated
  - borders too thick
  - areas needing notebook treatment
  - areas that must remain structurally unchanged
- Report safe files to edit first.
- Do not modify files.

Expected Result:
A clear audit report showing styling structure, mismatch priorities, and safe starting points.

Acceptance Criteria:
- Existing CSS variables were audited.
- Current palette and font usage were documented.
- Styling ownership map was created.
- No files were modified.

---

Phase 1 - Global Notebook Theme Foundation

Goal:
Establish the base notebook/planner visual identity globally.

Purpose:
Create a consistent visual foundation before editing individual sections.

Steps:
- Reuse existing CSS variables where possible.
- Refine or extend global colors only after checking what already exists.
- Tune paper/background colors.
- Tune ink/border colors.
- Tune accent colors.
- Tune global font usage.
- Decide notebook line treatment:
  - Prefer CSS-based lines for scalability/performance.
  - Use image-based paper texture only if subtle, optimized, and readable.
- Adjust global body/root styling.
- Avoid changing feature logic.

Expected Result:
The app starts feeling like notebook paper at a global level.

Acceptance Criteria:
- Existing variables were reused before adding new ones.
- No duplicate palette system was introduced.
- Global paper/notebook foundation exists.
- No dashboard structure or feature behavior changed.
- Backend untouched.

---

Phase 2 - Dashboard Shell Refinement

Goal:
Refine the main dashboard shell while preserving layout behavior.

Purpose:
Make the dashboard feel like a planner page instead of a heavy boxed admin dashboard.

Steps:
- Keep current dashboard structure.
- Refine main dashboard wrapper.
- Reduce heavy borders.
- Improve spacing and visual hierarchy.
- Apply subtle paper/sheet styling.
- Keep dashboard data readable.
- Preserve responsive behavior.
- Apply opened-notebook shell direction:
  - sidebar as left notebook side
  - dashboard as right paper page
  - subtle seam/spine between them if appropriate

Expected Result:
The main dashboard feels cleaner, softer, and notebook-like without layout rebuild.

Acceptance Criteria:
- Dashboard structure remains the same.
- Shell looks visibly lighter and more paper-like.
- No component behavior changed.

---

Phase 3 - Sidebar Notebook Index Refinement

Goal:
Refine sidebar into a planner index area.

Purpose:
Make sidebar feel connected to notebook identity instead of a separate control panel.

Steps:
- Keep current sidebar structure.
- Refine nav button styling.
- Reduce overly strong colors as needed.
- Improve active/hover states.
- Refine reset hour controls.
- Refine quote preference controls.
- Refine profile/logout/footer area.
- Keep behavior unchanged.

Expected Result:
Sidebar feels like a calm planner index while staying functional.

Acceptance Criteria:
- Navigation and controls remain unchanged functionally.
- Sidebar appearance is less panel-like and more notebook-index-like.
- Accessibility/readability preserved.

---

Phase 4 - Header and Stats Tracker Refinement

Goal:
Refine dashboard header and stats row.

Purpose:
Make top area feel like a personal daily planner heading and tracker strip.

Steps:
- Preserve greeting, date, time, and reset-cycle information.
- Improve typography hierarchy.
- Refine stats row spacing.
- Reduce harsh cell borders.
- Improve stat label readability.
- Keep stat values clear and data-driven.
- Maintain compact dashboard density.
- Keep emotional tone calm/personal/motivating.
- Style stats like tracker strip, not spreadsheet.

Expected Result:
Header and stats feel like productivity notebook elements.

Acceptance Criteria:
- Data content/logic unchanged.
- Readability improved.
- Stats feel less rigid and less table-like.

---

Phase 5 - Main Dashboard Module Refinement

Goal:
Refine main modules while preserving behavior.

Modules:
- To-Do List
- Daily Plan Preview
- Memo Preview

Purpose:
Make modules feel like notebook/planner sections.

Steps:
- Keep module placement.
- Refine section borders and headings.
- Tune task item styling.
- Tune filter/action button styling.
- Tune memo preview styling.
- Keep Daily Plan area prepared for timeline evolution.
- Preserve CRUD, drag/drop, preview, and modal triggers.

Expected Result:
Core modules look more polished, calm, and notebook-inspired.

Acceptance Criteria:
- Module logic unchanged.
- Structure unchanged.
- Visual consistency with global notebook theme improved.

Implementation Note:
Prefer sub-phases when executing:
- Phase 5.1 - To-Do only
- Phase 5.2 - Daily Plan Preview only
- Phase 5.3 - Memo Preview only

---

Phase 6 - Chart and Data Section Refinement

Goal:
Refine chart/data sections and placeholders.

Purpose:
Make data areas feel like progress reflection trackers, not corporate analytics cards.

Steps:
- Keep chart section layout.
- Refine chart containers.
- Add subtle grid/paper treatment where useful.
- Improve empty-state styling.
- Keep data readable.
- Avoid heavy corporate chart visuals.
- Preserve stats API behavior.

Expected Result:
Charts support notebook identity and remain readable.

Acceptance Criteria:
- Data behavior unchanged.
- Visual framing is calmer and less corporate.

---

Phase 7 - Secondary Pages and Modals Refinement

Goal:
Extend notebook/planner identity beyond dashboard.

Scope:
- Daily Planner Modal
- Memo Corkboard Page
- Task forms/modals
- Other existing pages as needed

Purpose:
Ensure whole app experience feels connected.

Steps:
- Refine modal surfaces.
- Refine corkboard page styling while preserving contrast with dashboard.
- Keep modal behavior unchanged.
- Keep memo board drag/drop behavior unchanged.
- Match global notebook theme.
- Maintain responsiveness and accessibility.

Expected Result:
Secondary pages and modals feel consistent with ToDoHi identity.

Acceptance Criteria:
- No behavior regressions in modals/pages.
- Visual consistency improved across app surface.

---

Phase 8 - Density, Spacing, and Consistency Pass

Goal:
Normalize spacing, sizing, borders, and density.

Purpose:
Make UI intentional, compact, and consistent.

Steps:
- Review dashboard spacing.
- Reduce excessive gaps.
- Normalize padding.
- Normalize border radius.
- Normalize button/control height.
- Normalize section header sizing.
- Improve laptop-screen fit.
- Avoid cramped UI.

Expected Result:
Dashboard feels cleaner, tighter, easier to scan.

Acceptance Criteria:
- Spacing system is visibly more consistent.
- Information density improved without crowding.

---

Phase 9 - Interaction and Micro-Polish Pass

Goal:
Refine hover/focus/active feedback.

Purpose:
Make UI feel responsive, calm, and polished.

Steps:
- Refine hover effects.
- Refine focus states.
- Refine active states.
- Refine button transitions.
- Refine dropdown/modal consistency.
- Ensure accessibility and clarity.
- Avoid excessive animation.

Expected Result:
UI interaction feels smoother and intentional.

Acceptance Criteria:
- Interactive states are consistent and accessible.
- Motion remains subtle and non-distracting.

---

Phase 10 - Full Responsive QA Pass

Goal:
Perform cross-screen QA cleanup.

Purpose:
Finalize responsive stability after prior phase changes.

Steps:
- Test common laptop widths.
- Review sidebar behavior.
- Review dashboard grid behavior.
- Review stats row wrapping/overflow.
- Review module stacking behavior.
- Review chart responsiveness.
- Fix text overflow and layout pressure.

Expected Result:
Notebook/planner identity remains stable across supported sizes.

Acceptance Criteria:
- No major overflow, overlap, or clipping on target sizes.
- Internal controls remain usable and readable.

---

Phase 11 - Final Visual Consistency Review

Goal:
Review full UI as one connected design system.

Purpose:
Catch remaining inconsistencies or drift from product identity.

Steps:
- Check color consistency.
- Check font consistency.
- Check border consistency.
- Check shadow consistency.
- Check button consistency.
- Check form control consistency.
- Check section consistency.
- Check empty/loading state consistency.
- Check dashboard readability.
- Confirm alignment with ToDoHi identity.

Expected Result:
ToDoHi feels calm, structured, personal, and notebook-style.

Acceptance Criteria:
- Visual language is coherent across pages/modules.
- Product identity is clearly reflected.
- No behavior or API logic changed during UI work.

==================================================
Execution Strategy Note
==================================================

Do not implement entire broad phases in one pass.
Prefer smaller execution slices, for example:
- Phase 2.1 shell only
- Phase 2.2 paper background only
- Phase 2.3 spacing only
- Phase 5.1 To-Do only
- Phase 5.2 Daily Plan preview only
- Phase 5.3 Memo preview only

Guiding sentence:
ToDoHi should feel like an opened notebook for daily execution: sidebar as planner index, dashboard as lined paper page.
