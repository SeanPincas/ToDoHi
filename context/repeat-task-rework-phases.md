# Repeat Task Rework - Phases and Steps

Project:
ToDoHi

Feature Mission:
Rework the repeat-task flow so it feels less strict from the user perspective while preserving manual daily repetition and reflective productivity history.

Core Product Direction:
- Repeat tasks manually by users
- Preserve failed-task reflection
- Introduce a gentler retention model
- Keep yesterday's failed tasks visible in Todo preview
- Replace harsh destructive wording and behavior

New Terminology:
- Use `Failed Task Archive`
- Do not use `Recycle Bin` for this feature direction

Execution Rule:
This is a behavior and data-lifecycle redesign, not just a modal copy update.

Preserve:
- Existing routes unless later phases explicitly require a new page
- Existing resetHour boundary logic
- Existing repeat-cycle key logic
- Existing manual repeat concept
- Existing task CRUD stability outside the repeat-task mission

Improve:
- User-facing flexibility
- Historical failed-task visibility
- Retention behavior
- Repeat modal experience
- Daily review flow
- Archive naming and semantics

## Phase 0 - Current Flow Audit

Goal:
Inspect and document the current repeat-task feature behavior before changing logic.

Purpose:
Understand where the current strictness comes from and identify the destructive code paths.

Steps:
- Inspect where the repeat modal opens.
- Inspect where `repeatCycleAcknowledged` is checked.
- Inspect where `repeatCycleAcknowledged` is reset.
- Inspect where failed tasks are snapshotted.
- Inspect how selected repeated tasks are recreated.
- Inspect how completed and failed tasks are deleted.
- Inspect how the Todo failed filter works today.
- Inspect what data is available for yesterday-failed preview.
- Report current risks and behavior constraints.
- Do not modify behavior in this phase.

Expected Result:
- A clear audit of the current repeat-task flow, deletion behavior, and failed-task visibility.

Acceptance Criteria:
- Repeat trigger points were documented.
- Repeat backend deletion path was documented.
- Failed snapshot behavior was documented.
- Todo failed filter limitations were documented.

---

## Phase 1 - New Behavior Rules

Goal:
Define the new repeat-task behavior clearly before schema or backend implementation.

Purpose:
Create an implementation contract so later logic work stays aligned with the intended user experience.

### Phase 1 Behavior Rules

#### 1. Manual repeat stays
- Users must still manually choose which previous tasks to repeat.
- Repeated tasks may still be created as fresh tasks for the new day.
- Fresh repeated tasks may still receive new MongoDB `_id` values.

#### 2. Failed Task Archive is introduced
- Unselected failed tasks must not be deleted immediately.
- Unselected failed tasks should move into `Failed Task Archive`.
- Archived failed tasks should no longer behave like active today tasks.
- Archived failed tasks should remain available for temporary review and future recovery logic if needed.

#### 3. Archived failed tasks are deleted later
- Failed tasks in `Failed Task Archive` should be auto-deleted after a retention window.
- Initial target retention window:
  - 30 days
- Permanent deletion should happen only after that retention window ends.

#### 4. Yesterday's failed tasks stay visible in Todo preview
- Yesterday's failed tasks should still appear in Todo preview for reflection.
- This preview should represent yesterday only, not the entire archive.
- These preview items should be visually separate from active today tasks.

#### 5. Repeat modal becomes a daily review flow
- The repeat modal should feel like a morning review step, not a punishment gate.
- Wording should avoid immediate-loss language where possible.
- Users should understand that unselected failed tasks go to `Failed Task Archive`, not immediate destruction.

#### 6. Active task list remains clean
- Active Todo task lists should continue showing live working tasks only.
- Archived failed tasks should not remain mixed into normal active Todo filters unless a later phase explicitly adds that view.

#### 7. Failed filter semantics must be clarified
- The current `Failed` filter is based on live tasks only.
- After archive behavior is introduced, we must explicitly decide:
  - whether `Failed` means live failed tasks only
  - or whether a separate archive/history surface should hold older failed tasks

### Phase 1 Steps
- Define active-task behavior after a reset cycle.
- Define repeated-task behavior after user selection.
- Define unselected failed-task behavior.
- Define unselected completed-task behavior.
- Define `Failed Task Archive` scope and meaning.
- Define archive retention window.
- Define yesterday-failed preview source and visibility rules.
- Define whether the repeat modal remains blocking or becomes skippable later.
- Define which parts of current behavior must remain unchanged.
- Define Phase 1 acceptance criteria before coding.

### Current Recommended Rules For Implementation
- Selected tasks:
  - Create fresh pending tasks for the new day
- Unselected failed tasks:
  - Move to `Failed Task Archive`
- Unselected completed tasks:
  - Do not keep in active Todo
  - Final storage/archive decision to be defined in Phase 2 data-model planning
- Yesterday-failed preview:
  - Continue to exist in Todo preview
  - Must only represent yesterday's failed tasks
- Deletion timing:
  - Delete archived failed tasks after 30 days, not immediately

Expected Result:
- A stable behavior spec for the repeat-task redesign exists before backend logic changes begin.

Acceptance Criteria:
- Manual repeat requirement remains preserved.
- `Failed Task Archive` terminology is established.
- Immediate deletion is no longer the intended behavior for unselected failed tasks.
- Yesterday-failed preview behavior is explicitly retained.
- Retention-based deletion target is defined.

Phase 1 Check Against Current Code:
- Manual repeat preserved today:
  - Yes
- Failed Task Archive exists today:
  - No
- Unselected failed tasks preserved today:
  - No
- Retention deletion exists today:
  - No
- Yesterday-failed preview/history is strong enough today:
  - No
- Current feature matches new Phase 1 target:
  - No

---

## Phase 2 - Data Model Plan

Goal:
Decide the safest data structure for archive and retention behavior.

Purpose:
Support the new behavior without breaking current task flows.

### Phase 2 Model Decisions

#### 1. `Task` remains the live-task model only
- `Task` continues to represent active working tasks.
- `Task` should not become the archive model.
- `Task` should not become the reusable collection/template model.
- Current task behavior should stay focused on:
  - active Todo items
  - current-day status
  - deadline/reset-hour behavior
  - live filters
  - live stats

Reason:
- This keeps repeat logic, filters, stats, and scheduler behavior cleaner.
- It avoids overloading one model with active, archived, and reusable meanings.

#### 2. Introduce `TaskArchive` as a separate model
- `TaskArchive` stores task records that are no longer active but still temporarily preserved.
- Initial Phase 2 direction:
  - send failed tasks into `TaskArchive`
  - also archive completed tasks when they leave the active flow

Reason:
- The archive should preserve reflection/history without polluting active task queries.
- It gives us a clean place for:
  - retention
  - yesterday-failed sourcing
  - future review/history features

#### 3. Introduce `TaskCollection` as a separate model
- `TaskCollection` stores reusable task bundles or reusable task blueprints.
- `TaskCollection` is not part of the repeat-task archive flow directly.
- It exists as a separate reusable-task feature direction and should not be merged into `Task`.

Reason:
- Collections represent reusable planning presets, not live daily tasks.
- Keeping them separate protects stats, repeat logic, and active task queries.

### Phase 2 Planned Models

#### A. `Task`
Role:
- Active task only

Keep current responsibilities:
- `pending`, `completed`, `failed` live state
- active Todo rendering
- daily deadline behavior
- drag-and-drop ordering
- memo linkage
- live user stats participation

Do not add:
- archive retention fields
- collection/template ownership fields
- long-term history fields unless later strictly necessary for linkage only

#### B. `TaskArchive`
Role:
- Historical storage for tasks that have left the active list
- supports gentler cleanup and reflection

Recommended fields:
- `userId`
- `originalTaskId`
- `title`
- `description`
- `category`
- `status`
- `createdAt`
- `deadline`
- `orderIndex`
- `isExpired`
- `memoId`
- `containerColor`
- `archivedAt`
- `archiveType`
- `archiveReason`
- `sourceCycleKey`
- `repeatedIntoTaskId`
- `retentionDeleteAt`

Field meaning:
- `originalTaskId`
  - points to the original live task that was archived
- `archivedAt`
  - when the archive event happened
- `archiveType`
  - initial planned values:
    - `failed`
    - `completed`
- `archiveReason`
  - initial planned values:
    - `repeat-unselected`
    - `repeat-selected-source`
    - `manual-clear`
    - reserved future values allowed later
- `sourceCycleKey`
  - stores which repeat/reset cycle the archived record came from
- `repeatedIntoTaskId`
  - points to the new fresh repeated task if the archived task was selected for repeat
- `retentionDeleteAt`
  - scheduled permanent deletion date

Important behavior direction:
- `TaskArchive` stores snapshots of task data at archive time.
- It should not depend on the original live `Task` continuing to exist.
- Once archived, the record should be self-sufficient for review/history UI.

#### C. `TaskCollection`
Role:
- Reusable set of tasks for future manual reuse

Recommended top-level fields:
- `userId`
- `name`
- `description`
- `isPinned`
- `isArchived`
- `colorTag`
- `createdAt`
- `updatedAt`
- `lastUsedAt`
- `tasks`

Recommended embedded `tasks` item fields:
- `title`
- `description`
- `category`
- `containerColor`
- `memoTemplateText` or reserved future note field only if needed later
- `defaultOrderIndex`

Important behavior direction:
- `TaskCollection` items are blueprints, not live tasks.
- They should not carry:
  - live `status`
  - `isExpired`
  - `deadline` tied to a past day
  - repeat-cycle acknowledgement behavior
- Using a collection should generate fresh `Task` records later.

### Phase 2 Archive Scope Rules

#### Failed tasks
- Failed tasks that leave the active cycle should go to `TaskArchive`.
- These are the primary archive target for the repeat-task mission.

#### Completed tasks
- Completed tasks should also go to `TaskArchive` instead of vanishing immediately.
- This keeps the model consistent and preserves historical reflection.
- Whether completed tasks get a different retention rule can be decided later.
- Initial Phase 2 assumption:
  - same archive model
  - same 30-day retention unless later revised

### Phase 2 Retention Rules

- `TaskArchive` records should be auto-deleted after 30 days by default.
- `retentionDeleteAt` should be written at archive time.
- Active `Task` documents should never use this retention field.
- `TaskCollection` should not use archive-retention deletion logic.

### Phase 2 Repeat Linkage Rules

- When a user repeats a task:
  - create a fresh live `Task`
  - archive the old source record in `TaskArchive`
  - link archive source to the fresh task using `repeatedIntoTaskId`

- This preserves the current "rebirth" concept while avoiding destructive loss.

### Phase 2 Yesterday-Failed Data Direction

Recommended source:
- `TaskArchive` should become the long-term reliable source of failed-task history.

Transitional note:
- `failedTaskSnapshot` may still remain temporarily for lightweight yesterday-preview support.
- Later phases should decide whether to:
  - keep snapshot as a small performance/helper layer
  - or fully derive yesterday-failed preview from `TaskArchive`

Current recommendation:
- keep snapshot temporarily during transition
- design toward `TaskArchive` as the trusted history source

### Phase 2 Migration Direction

- No risky backfill is required for older deleted tasks because they are already gone.
- Existing live `Task` records can remain as-is until Phase 3 logic refactor begins.
- New archive behavior should apply prospectively once backend logic changes are implemented.
- Existing `failedTaskSnapshot` can remain for compatibility until later phases replace or reduce it.

### Phase 2 Steps
- Confirm `Task` remains active-only.
- Define `TaskArchive` responsibilities and boundaries.
- Define `TaskCollection` responsibilities and boundaries.
- Define archive fields and retention fields.
- Define archive linkage to repeated fresh tasks.
- Define whether completed tasks share the same archive model.
- Define how yesterday-failed data should transition toward archive-backed history.
- Define migration strategy for current users and current live tasks.
- Record Phase 2 acceptance criteria before backend refactor.

Expected Result:
- A clear schema/data lifecycle plan exists for live tasks, archived tasks, and reusable task collections.

Acceptance Criteria:
- `Task` remains the live-task model.
- `TaskArchive` is chosen as a separate archive/history model.
- `TaskCollection` is chosen as a separate reusable collection model.
- Archive retention fields are defined.
- Repeat linkage strategy is defined.
- Archive scope for failed/completed tasks is clarified.

---

## Phase 3 - Backend Repeat Logic Refactor

Goal:
Refactor the repeat endpoint away from destructive immediate deletion.

Purpose:
Make repeat logic match the new user-facing rules.

Steps:
- Replace immediate delete behavior.
- Recreate selected tasks safely for the new day.
- Move unselected failed tasks into `Failed Task Archive`.
- Preserve repeat-cycle acknowledgement logic unless Phase 5 changes it.
- Preserve resetHour deadline alignment.

Expected Result:
- Repeat flow no longer destroys failed-task history immediately.

Acceptance Criteria:
- Selected tasks repeat correctly.
- Unselected failed tasks are archived instead of deleted.
- Immediate hard deletion is removed from the repeat path.

---

## Phase 4 - Yesterday Failed Source Refactor

Goal:
Make yesterday-failed preview reliable under the new archive model.

Purpose:
Preserve reflective visibility after the repeat-task redesign.

Steps:
- Decide whether yesterday-failed preview comes from snapshot, archive data, or both.
- Expand snapshot/history data if needed.
- Ensure preview only shows yesterday's failed tasks.
- Ensure archived older failed tasks do not leak into yesterday-only UI.

Expected Result:
- Yesterday-failed preview remains accurate and useful.

Acceptance Criteria:
- Yesterday-only filtering works.
- Preview survives repeat-task cleanup changes.

---

## Phase 5 - Repeat Modal UX Rework

Goal:
Turn the repeat modal into a calmer daily review experience.

Purpose:
Reduce the strict and destructive feeling of the current flow.

Steps:
- Rename or reframe modal language.
- Remove immediate-loss wording.
- Explain `Failed Task Archive` clearly.
- Keep manual selection behavior.
- Evaluate whether the modal remains blocking or becomes skippable.

Expected Result:
- The modal feels like a review step, not a punishment gate.

Acceptance Criteria:
- Wording reflects archive behavior.
- User choices are clearer and less harsh.

---

## Phase 6 - Todo Preview Integration

Goal:
Keep yesterday's failed tasks visible in Todo preview.

Purpose:
Preserve reflective awareness without mixing failed history into active tasks.

Steps:
- Add or refine a `Yesterday Failed` preview area.
- Keep it visually separate from active Todo items.
- Ensure it only shows yesterday's failed tasks.
- Make later repeat/archive actions possible if desired.

Expected Result:
- Todo preview supports daily reflection without cluttering active tasks.

Acceptance Criteria:
- Yesterday-failed items are visible.
- Active today tasks remain clean.

---

## Phase 7 - Failed Task Archive Foundation

Goal:
Create the initial `Failed Task Archive` behavior and retrieval path.

Purpose:
Support temporary failed-task retention cleanly.

Steps:
- Create archive query flow.
- Define archive retrieval API if needed.
- Define archive view or lightweight inspection surface later.
- Keep archive separate from active tasks.

Expected Result:
- Archived failed tasks are accessible for retention and review logic.

Acceptance Criteria:
- Archive data can be stored and retrieved reliably.

---

## Phase 8 - Stats and Filter Review

Goal:
Ensure stats and filters still make sense after repeat-task redesign.

Purpose:
Prevent confusion and silent metric regressions.

Steps:
- Review how repeated tasks affect created stats.
- Review failed-task counters.
- Clarify what the live `Failed` filter should mean.
- Confirm archive items do not distort active stats unintentionally.

Expected Result:
- Stats and filters remain understandable.

Acceptance Criteria:
- Stats behavior is explicitly documented and verified.
- Failed filter semantics are clarified.

---

## Phase 9 - Retention Cleanup

Goal:
Delete archived failed tasks only after the retention window.

Purpose:
Complete the softer deletion lifecycle.

Steps:
- Add scheduled cleanup for archive retention.
- Delete only eligible archived failed tasks.
- Preserve active tasks and recent archived tasks.
- Verify retention boundary correctness.

Expected Result:
- Archived failed tasks are cleaned up automatically after 30 days.

Acceptance Criteria:
- Cleanup is time-based, safe, and targeted.

---

## Phase 10 - QA and Edge Cases

Goal:
Validate the new repeat-task system thoroughly.

Purpose:
Catch regressions in cycle timing, archive behavior, and preview visibility.

Steps:
- Test no repeatable tasks.
- Test completed-only tasks.
- Test failed-only tasks.
- Test mixed completed and failed tasks.
- Test selected repeat subset.
- Test no selected tasks.
- Test repeatCycleAcknowledged behavior across repeated logins.
- Test resetHour boundary behavior.
- Test yesterday-failed preview correctness.
- Test archive retention cleanup timing.

Expected Result:
- Repeat-task redesign is stable and predictable.

Acceptance Criteria:
- No major logic regressions.
- User-facing flow matches the new behavior rules.

## Execution Strategy

- Do not jump into schema and modal redesign at the same time.
- Complete behavior rules first.
- Complete data model plan second.
- Only then refactor backend and UI.

Recommended order:
- Phase 0
- Phase 1
- Phase 2
- Phase 3
- Phase 4
- Phase 5
- Phase 6
- Phase 7
- Phase 8
- Phase 9
- Phase 10

Guiding sentence:
ToDoHi repeat-task flow should feel like a gentle daily review: repeat what matters, preserve failed-task reflection, and move unwanted failed tasks into `Failed Task Archive` before later cleanup.
