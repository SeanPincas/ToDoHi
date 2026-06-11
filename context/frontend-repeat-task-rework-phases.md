# Frontend Repeat Task Feature Rework Phases

This document breaks the frontend repeat-task mission into smaller execution slices
so each implementation turn can stay focused, cheaper in prompt cost, and easier
to verify without reloading the whole feature every time.

Core UI surfaces in scope:
- `RepeatTaskModal`
- `RepeatConfirmModal`
- `TaskArchiveModal`
- `TaskCollectionModal`

Core design rule:
- all three task-management modals must share the same notebook/paper visual system
- layout language, border treatment, action buttons, and section framing should feel
  like one family

---

## Phase A - API and Data Wiring

Purpose:
- align frontend data flow with the new backend repeat/archive architecture
- remove old frontend assumptions that depended on deleted backend fields

### Phase A.1 - Review and Archive API Contracts
Goal:
- add all frontend API calls needed by the new repeat/archive flow

Steps:
- add `getRepeatReviewApi()`
- add `getTaskArchiveApi()`
- add `repeatTaskArchiveEntryApi()`
- add `deleteTaskArchiveEntryApi()`
- add typed payloads for:
  - repeat review response
  - archive entry
  - archive list response

Primary files:
- `frontend/src/api/taskApi.ts`

Done when:
- frontend can request repeat review and archive data without ad hoc object guessing

### Phase A.2 - Stale User Field Cleanup
Goal:
- remove frontend references to deleted backend fields

Steps:
- remove `repeatCycleAcknowledged` usage
- remove `failedTaskSnapshot` usage
- align `User` typing with backend `preference` shape
- keep `dayTaskDelete` and `quoteCategory` under `preference`

Primary files:
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/api/userApi.ts`
- any component still reading removed fields

Done when:
- there are no stale references to deleted backend user fields

### Phase A.3 - Dashboard Review Trigger Wiring
Goal:
- stop deriving repeat prompt only from local task state

Steps:
- fetch review payload from backend
- open repeat modal using review response
- pass:
  - tasks
  - cycle key
  - archive label
  - retention days
  - summary counts

Primary files:
- `frontend/src/pages/DashboardPage.tsx`

Done when:
- repeat modal can be opened from backend review state instead of old local cycle logic

### Phase A.4 - Failed-Yesterday Data Bridge
Goal:
- provide a small frontend helper for yesterday-failed UI surfaces

Steps:
- create helper that:
  - checks live review failed tasks first
  - falls back to archive query for current cycle
- keep helper lightweight and UI-oriented

Primary files:
- `frontend/src/utils/repeatReview.ts`

Done when:
- sidebar or preview can request failed-yesterday data through one helper

### Phase A.5 - Verification
Goal:
- make sure the data-wiring phase is stable before UI rework starts

Steps:
- search for stale old field references
- run frontend build

Status:
- completed

---

## Phase B - Repeat Modal UX Rework

Purpose:
- transform repeat flow from a harsh forced-cleanup modal into a calmer review experience

### Phase B.1 - Shared Task-Management Modal Theme
Goal:
- create one reusable modal design system for task-related management surfaces

Steps:
- create shared paper/notebook modal theme CSS
- define:
  - modal shell
  - header layout
  - subtitle styling
  - section panel styling
  - info chips
  - action grid styling
- make it reusable for:
  - repeat modal
  - archive modal
  - collection modal

Primary files:
- `frontend/src/components/common/modals/taskManagementModalTheme.css`

Done when:
- all future task-management modals can inherit the same visual base

### Phase B.2 - Repeat Review Shell
Goal:
- update the repeat modal shell to reflect the new review-first product tone

Steps:
- change modal title from strict “repeat tasks” tone to review-oriented wording
- add calmer subtitle
- surface backend metadata:
  - archive label
  - retention days
  - task summary counts
- remove old “cannot move to the main page” feeling from the structure

Primary files:
- `frontend/src/components/common/modals/RepeatTaskModal.tsx`
- `frontend/src/components/common/modals/RepeatTaskModal.css`

Done when:
- the first impression of the modal feels like a review flow, not a punishment gate

### Phase B.3 - Repeat Filter Controls
Goal:
- refine the status filter area inside the repeat modal

Steps:
- restyle all/completed/failed filter buttons to match notebook modal family
- make active state clearer
- reduce visual noise
- keep control sizing consistent with the rest of dashboard UI

Primary files:
- `frontend/src/components/common/modals/RepeatTaskModal.css`

Done when:
- filters feel intentional and integrated, not like generic admin pills

### Phase B.4 - Repeat Task List Experience
Goal:
- improve scanning, selection, and task hierarchy inside the repeat modal

Steps:
- refine list wrapper framing
- improve task item spacing
- improve metadata readability
- make selected state more visible
- keep failed/completed visual distinction subtle but readable
- prepare for optional empty-state messaging

Primary files:
- `frontend/src/components/common/modals/RepeatTaskModal.tsx`
- `frontend/src/components/common/modals/RepeatTaskModal.css`

Done when:
- the list is easy to scan and selection state is obvious

### Phase B.5 - Repeat Actions Row
Goal:
- make bottom action buttons read as intentional daily-review decisions

Steps:
- keep:
  - delete all
  - repeat all
  - confirm selected
- ensure spacing, sizing, and hierarchy fit notebook modal theme
- ensure button copy still matches backend behavior for now

Primary files:
- `frontend/src/components/common/modals/RepeatTaskModal.css`

Done when:
- the actions are visually balanced and consistent with shared button system

### Phase B.6 - Repeat Confirm Modal Rework
Goal:
- replace destructive confirmation copy with archive-aware confirmation language

Steps:
- update title wording
- update body messaging for:
  - repeat all
  - repeat selected
- mention `Failed Task Archive` instead of immediate destruction
- align confirm and cancel buttons with shared modal theme

Primary files:
- `frontend/src/components/common/modals/RepeatConfirmModal.tsx`
- `frontend/src/components/common/modals/RepeatConfirmModal.css`

Done when:
- confirmation step reflects the archive-based backend behavior clearly

### Phase B.7 - Review-Later Readiness
Goal:
- keep the repeat modal architecture ready for future dismiss/reopen behavior

Steps:
- avoid hard-coding blocking copy
- keep modal data shape reusable
- preserve ability to reopen review later from another trigger

Primary files:
- `RepeatTaskModal.tsx`
- `DashboardPage.tsx`
- any future review launcher

Done when:
- future “review later” behavior can be added without restructuring the modal

Status:
- started
- B.1 complete
- B.2 partial
- B.6 partial

---

## Phase C - Yesterday Failed Preview

Purpose:
- surface yesterday’s failed tasks as reflection, not as noisy duplicate active tasks

### Phase C.1 - Data Source Alignment
Goal:
- define one clear frontend source for yesterday-failed preview

Steps:
- use review/archive helper output
- avoid directly coupling preview UI to raw backend object noise

Primary files:
- `frontend/src/utils/repeatReview.ts`

Done when:
- preview UI consumes one stable helper payload

### Phase C.2 - Todo Preview Reflection Section
Goal:
- add a dedicated yesterday-failed area inside the Todo preview feature

Steps:
- place reflection section inside Todo preview
- visually separate it from active today list
- keep it compact and readable
- preserve notebook/dashboard theme

Primary files:
- `frontend/src/components/dashboard/TodoPreview.tsx`
- `frontend/src/components/dashboard/TodoPreview.css`

Done when:
- users can see yesterday’s failed tasks without confusing them with current live tasks

### Phase C.3 - Interaction Boundary
Goal:
- decide how much interaction the Todo preview reflection area should allow

Steps:
- decide whether it is:
  - read-only
  - quick repeat enabled
  - open archive modal shortcut
- keep first version simple

Primary files:
- `TodoPreview.tsx`

Done when:
- yesterday-failed preview has a clear interaction scope

### Phase C.4 - Sidebar Duplication Check
Goal:
- reduce redundancy across sidebar and todo preview

Steps:
- evaluate whether sidebar still needs full yesterday-failed list
- if too duplicative:
  - keep sidebar compact
  - let Todo preview become the richer reflection surface

Primary files:
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/dashboard/TodoPreview.tsx`

Done when:
- reflection surfaces feel complementary, not repetitive

---

## Phase D - Failed Task Archive Modal

Purpose:
- create the first dedicated user-facing surface for archived failed/completed tasks

### Phase D.1 - Modal Existence and Routing
Goal:
- add the archive modal shell and open/close path

Steps:
- create `TaskArchiveModal.tsx`
- create `TaskArchiveModal.css`
- decide modal trigger location
- register modal in router/global modal layer if needed

Primary files:
- `frontend/src/components/common/modals/TaskArchiveModal.tsx`
- `frontend/src/components/common/modals/TaskArchiveModal.css`
- `frontend/src/router/AppRouter.tsx`
- maybe `Sidebar.tsx` or `TodoPreview.tsx`

Done when:
- archive modal can be opened from the UI

### Phase D.2 - Shared Theme Adoption
Goal:
- ensure archive modal matches repeat modal design family

Steps:
- reuse `taskManagementModalTheme.css`
- use same:
  - shell
  - header
  - panel
  - chip
  - action rhythm

Done when:
- archive modal visually feels like a sibling of repeat modal

### Phase D.3 - Archive Data Hookup
Goal:
- load archive entries into the archive modal

Steps:
- fetch archive entries from backend
- support archive type filter
- support archive reason filter if needed later
- support count display

Primary files:
- `TaskArchiveModal.tsx`
- `frontend/src/api/taskApi.ts`

Done when:
- modal can render real archive data

### Phase D.4 - Archive List UI
Goal:
- make archive items readable and scannable

Steps:
- design archive item row/card
- show:
  - title
  - category
  - original status
  - archive date
  - retention context if useful

Done when:
- archive modal list is usable without requiring a second pass

### Phase D.5 - Archive Actions
Goal:
- expose backend archive actions to users

Steps:
- add repeat action for archive entry
- add delete action for archive entry
- refresh archive list after actions
- refresh active tasks/user stats if needed

Primary files:
- `TaskArchiveModal.tsx`
- `frontend/src/api/taskApi.ts`

Done when:
- archive modal is actionable, not read-only

### Phase D.6 - Empty and Loading States
Goal:
- make archive modal feel complete

Steps:
- add loading state
- add empty state
- add error fallback state

Done when:
- archive modal handles normal UI states gracefully

---

## Phase E - Task Collection Modal

Purpose:
- create the frontend collection surface for reusable grouped task blueprints

### Phase E.1 - Modal Existence and Theme
Goal:
- create the collection modal shell using the same task-management modal theme

Steps:
- create `TaskCollectionModal.tsx`
- create `TaskCollectionModal.css`
- reuse shared modal theme

Done when:
- collection modal exists visually and matches repeat/archive modal family

### Phase E.2 - Collection Form Shell
Goal:
- build the initial collection creation structure

Steps:
- add collection name field
- add optional summary/description field
- add task blueprint section
- define card/list structure for blueprint items

Done when:
- user can see and understand collection-building UI even if backend CRUD is not fully wired yet

### Phase E.3 - Collection Blueprint Item UI
Goal:
- design how individual reusable task blueprints appear inside collection modal

Steps:
- add fields for:
  - title
  - description
  - category
  - containerColor
- keep same visual language as the rest of task management

Done when:
- collection modal can represent reusable tasks clearly

### Phase E.4 - Collection Actions
Goal:
- prepare create/edit/save flow

Steps:
- add save/cancel actions
- keep layout ready for future backend hookup
- if backend collection endpoints do not yet exist, keep modal static but structured

Done when:
- modal is execution-ready for later backend wiring

### Phase E.5 - Collection Launch Strategy
Goal:
- decide where users open the modal from

Steps:
- decide launch point:
  - todo preview
  - add task flow
  - sidebar
  - dedicated button
- keep launch consistent with notebook dashboard style

Done when:
- collection modal has a clear entry point

---

## Phase F - Stats, Filters, and Retention Finalization

Purpose:
- align final UI semantics with the backend behavior we already established

### Phase F.1 - Failed-Yesterday Stat Check
Goal:
- verify the dashboard stat matches backend meaning

Steps:
- confirm `tasksFailedYesterday` is used consistently
- confirm no UI still depends on removed snapshot logic

Done when:
- failed-yesterday stat is semantically correct everywhere

### Phase F.2 - Live Failed Filter Meaning
Goal:
- keep live failed tasks distinct from archive history

Steps:
- verify Todo filters only represent live tasks
- ensure archive items do not leak into live failed UI

Done when:
- “Failed” means live failed items only

### Phase F.3 - Retention Copy
Goal:
- explain retention behavior clearly in UI

Steps:
- add copy near settings and archive surfaces:
  - retention applies only to newly archived tasks
- avoid implying retroactive countdown changes

Done when:
- users can understand archive retention without confusion

### Phase F.4 - Final Modal Family Consistency Pass
Goal:
- ensure repeat/archive/collection modals feel like one design system

Steps:
- compare shell spacing
- compare header rhythm
- compare panel styles
- compare action buttons
- compare mobile behavior

Done when:
- the three task-management modals feel visually unified

---

## Recommended Execution Order

1. Phase A.1
2. Phase A.2
3. Phase A.3
4. Phase A.4
5. Phase A.5
6. Phase B.1
7. Phase B.2
8. Phase B.3
9. Phase B.4
10. Phase B.5
11. Phase B.6
12. Phase B.7
13. Phase C.1
14. Phase C.2
15. Phase C.3
16. Phase C.4
17. Phase D.1
18. Phase D.2
19. Phase D.3
20. Phase D.4
21. Phase D.5
22. Phase D.6
23. Phase E.1
24. Phase E.2
25. Phase E.3
26. Phase E.4
27. Phase E.5
28. Phase F.1
29. Phase F.2
30. Phase F.3
31. Phase F.4

---

## Current Progress Snapshot

- Phase A: complete
- Phase B:
  - B.1 complete
  - B.2 partial
  - B.6 partial
- Phase C onward: pending

