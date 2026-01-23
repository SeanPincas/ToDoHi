import {
    // ---------------- BASIC ACTIONS ----------------
    RiAddFill,
    RiDeleteBin6Fill,
    RiPencilFill,
    RiCloseFill,

    // ---------------- CHECK / STATUS ----------------
    RiCheckboxCircleFill,
    RiCheckboxBlankCircleLine,
    RiCheckboxFill,
    RiCheckFill,

    // ---------------- NAV / MENU ----------------
    RiMenuFill,
    RiArrowUpSLine,
    RiArrowDownSLine,
    RiArrowLeftSLine,
    RiDragMove2Fill,

    // ---------------- USER / SETTINGS ----------------
    RiSettings3Fill,
    RiUserFill,
    RiLockFill,
    RiTimeFill,

    // ---------------- PRODUCTIVITY ----------------
    RiTodoFill,
    RiCalendarTodoFill,
    RiBookOpenFill,
    RiRepeat2Fill,

    // ---------------- FEEDBACK / ALERT ----------------
    RiErrorWarningFill,     // ⚠️ warning / danger / confirm delete
    RiInformationFill,      // ℹ️ info messages / help
    RiQuestionFill,         // ❓ tooltips / guides
    RiAlertFill             // 🚨 critical alerts (future-proof)
} from "react-icons/ri";

// ============================================================================
// ICON MAP
// Usage: <Icons.Delete /> instead of importing from react-icons directly
// ============================================================================

export const Icons = {
    // ---------------- BASIC CRUD ----------------
    Add: RiAddFill,
    Delete: RiDeleteBin6Fill,
    Edit: RiPencilFill,
    Close: RiCloseFill,

    // ---------------- CHECKBOX / STATUS ----------------
    Check: RiCheckboxCircleFill,
    Uncheck: RiCheckboxBlankCircleLine,
    CheckboxDeleteTick: RiCheckboxFill,
    Confirm: RiCheckFill,

    // ---------------- NAVIGATION ----------------
    Menu: RiMenuFill,
    ArrowUp: RiArrowUpSLine,
    DropdownArrow: RiArrowDownSLine,
    SidebarCollapse: RiArrowLeftSLine,
    Drag: RiDragMove2Fill,

    // ---------------- USER / SETTINGS ----------------
    Settings: RiSettings3Fill,
    User: RiUserFill,
    Lock: RiLockFill,
    Clock: RiTimeFill,

    // ---------------- PRODUCTIVITY ----------------
    Todo: RiTodoFill,
    Planner: RiCalendarTodoFill,
    Notebook: RiBookOpenFill,
    Repeat: RiRepeat2Fill,

    // ---------------- ALERTS / FEEDBACK ----------------
    Warning: RiErrorWarningFill,     // used in DeleteConfirmModal
    Info: RiInformationFill,         // future: help modals, tips
    Question: RiQuestionFill,        // future: tooltips, guides
    Alert: RiAlertFill               // future: critical system alerts
};