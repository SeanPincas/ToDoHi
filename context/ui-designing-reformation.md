# Project Goal: UI Designing Reformation

Project:
ToDoHi — a full-stack productivity app and daily execution companion.

Main Goal:
Reform the existing ToDoHi UI/UX into a clean notebook-sheet inspired dashboard while preserving the current UI structure, feature layout, and application logic.

This is not a full redesign from scratch. The current dashboard/sidebar/module structure should remain recognizable. The goal is to tune, refine, soften, and improve the existing interface so it better matches the intended product identity.

Product Identity:
ToDoHi should feel like a digital productivity notebook / planner page, not a corporate SaaS dashboard or generic task tracker.

The UI should communicate:
- Calm productivity
- Daily structure
- Personal motivation
- Clean execution flow
- Notebook/planner familiarity
- Lightweight dashboard intelligence
- Japanese Zen / Ikigai-inspired focus

Design Direction:
The visual style should be inspired by:
- Lined notebook paper
- Grid notebook paper
- Planner sheets
- Handwritten notes
- Soft paper surfaces
- Thin ink-like dividers
- Calm, purposeful dashboard tracking

The UI should remain data-driven because ToDoHi has dashboard stats, charts, task tracking, memo tracking, and daily-plan progress. However, the data presentation should feel like a planner tracker or productivity journal, not an enterprise analytics panel.

Important Rule:
Keep the existing UI structure first. Improve the look, spacing, visual hierarchy, density, borders, typography, backgrounds, and component styling without changing app behavior.

Do not rewrite business logic.
Do not change APIs.
Do not refactor unrelated feature code.
Do not rebuild the dashboard layout from scratch unless specifically instructed.

Current UI Direction:
The current app has a functional sidebar, dashboard header, stats row, task preview, daily plan preview, memo preview, and chart placeholder sections. These should be preserved as the base structure.

Current UI Issues to Improve:
- Thick borders make the UI feel too heavy.
- Some sections feel like hard boxes instead of notebook areas.
- Buttons and blue accents may feel too dominant.
- Sidebar feels more like a control panel than a planner index.
- Dashboard has good structure but needs softer notebook/paper treatment.
- Data sections should feel like productivity trackers.
- Spacing and sizing should be refined for better density.
- The handwritten identity should be strengthened without hurting readability.

Palette Note:
The project already has global CSS variables and new accent colors may already exist. Before adding new colors, inspect the current global CSS/theme files first.

Do not blindly introduce duplicate palette variables.
First check:
- existing CSS variables
- existing accent colors
- existing border colors
- existing button colors
- existing background colors
- existing typography/font imports

Then reuse, rename, consolidate, or extend the current theme carefully.

Target Design Feel:
A clean notebook dashboard:
- warm paper background
- subtle ruled/grid texture
- thin ink-like borders
- soft shadow or paper lift
- handwritten-style headings
- readable body text
- calm accent colors
- compact but breathable layout
- personal planner energy
- clear dashboard information

Final UI Goal:
ToDoHi should look like an Ikigai-inspired digital notebook for daily execution — calm, structured, personal, and data-aware.
