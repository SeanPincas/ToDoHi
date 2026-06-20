import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useTodo } from "../../../context/TodoContext";
import {
    deleteTaskArchiveEntryApi,
    getRepeatReviewApi,
    getTaskArchiveApi,
    repeatTaskArchiveEntryApi,
    type TaskArchiveEntry,
} from "../../../api/taskApi";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import DropdownMenu from "../dropdownMenu/DropdownMenu";
import { SegmentedSwitch } from "../switch/SegmentedSwitch";
import {
    CATEGORY_LABELS,
    TASK_CATEGORIES,
    TASK_CATEGORY_ICON_MAP,
    TASK_COLORS,
    getTaskCategoryIconKey,
    getTaskStatusIconKey,
    resolveTaskContainerColorToHex,
    safeCategoryLabel,
    safeStatusLabel,
    type TaskCategory,
} from "../../../utils/taskUtils";
import { REPEAT_REVIEW_REFRESH_EVENT } from "../../../utils/repeatReview";

import "../../../styles/buttonStyles.css";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "./TaskArchiveModal.css";

type ArchiveStatusTab = "all" | "completed" | "failed";
type ArchiveDaysLeftSort = "none" | "highToLow" | "lowToHigh";
type ArchiveSelectionMode = "none" | "repeat" | "delete";
type ArchiveLayoutMode = "list" | "grid";

const ARCHIVE_TABS: ArchiveStatusTab[] = ["all", "completed", "failed"];

const ARCHIVE_TAB_LABELS: Record<ArchiveStatusTab, string> = {
    all: "All",
    completed: "Completed",
    failed: "Failed",
};

const TaskArchiveModal: React.FC = () => {
    const { refreshUser } = useAuthContext();
    const { modal, closeModal, fetchTasks, openModal } = useTodo();

    const [entries, setEntries] = useState<TaskArchiveEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
    const [busyBulkAction, setBusyBulkAction] = useState<"repeat" | "delete" | null>(null);
    const [selectionMode, setSelectionMode] = useState<ArchiveSelectionMode>("none");
    const [selectedArchiveIds, setSelectedArchiveIds] = useState<Set<string>>(new Set());

    const [activeTab, setActiveTab] = useState<ArchiveStatusTab>("all");
    const [activeCategory, setActiveCategory] = useState<"all" | TaskCategory>("all");
    const [activeContainerColor, setActiveContainerColor] = useState<"all" | string>("all");
    const [daysLeftSort, setDaysLeftSort] = useState<ArchiveDaysLeftSort>("none");
    const [layoutMode, setLayoutMode] = useState<ArchiveLayoutMode>("list");

    const isOpen = modal.isOpen && modal.type === "taskArchive";
    const modalData = modal.type === "taskArchive" ? modal.data ?? {} : {};

    const colorOptions = Object.entries(TASK_COLORS).flatMap(([colorName, shades]) => ([
        { value: `${colorName}-light`, label: `${colorName} light`, swatch: shades.light },
        { value: `${colorName}-normal`, label: `${colorName} normal`, swatch: shades.normal },
        { value: `${colorName}-dark`, label: `${colorName} dark`, swatch: shades.dark },
    ]));

    const categoryOptions = [
        { value: "all", label: "All", iconKey: "List" as const },
        ...TASK_CATEGORIES.map((cat) => ({
            value: cat,
            label: CATEGORY_LABELS[cat],
            iconKey: TASK_CATEGORY_ICON_MAP[cat],
        })),
    ];

    const loadArchive = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getTaskArchiveApi({
                archiveType: "all",
                limit: 200,
            });

            setEntries(response.entries);
        } catch (err) {
            console.error("[TaskArchiveModal] Failed loading archive:", err);
            setError("Could not load the archive right now.");
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const getDaysLeftValue = (retentionDeleteAt?: string | null) => {
        if (!retentionDeleteAt) return Number.POSITIVE_INFINITY;

        const diffMs = new Date(retentionDeleteAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    };

    const filteredEntries = useMemo(() => {
        const nextEntries = entries.filter((entry) => {
            const statusMatch = activeTab === "all" ? true : entry.archiveType === activeTab;
            const categoryMatch = activeCategory === "all" ? true : entry.category === activeCategory;
            const colorMatch = activeContainerColor === "all"
                ? true
                : resolveTaskContainerColorToHex(entry.containerColor) === resolveTaskContainerColorToHex(activeContainerColor);

            return statusMatch && categoryMatch && colorMatch;
        });

        if (daysLeftSort === "none") return nextEntries;

        return [...nextEntries].sort((a, b) => {
            const aDaysLeft = getDaysLeftValue(a.retentionDeleteAt);
            const bDaysLeft = getDaysLeftValue(b.retentionDeleteAt);

            return daysLeftSort === "highToLow"
                ? bDaysLeft - aDaysLeft
                : aDaysLeft - bDaysLeft;
        });
    }, [entries, activeTab, activeCategory, activeContainerColor, daysLeftSort]);

    const summary = useMemo(() => ({
        total: entries.length,
        completed: entries.filter((entry) => entry.archiveType === "completed").length,
        failed: entries.filter((entry) => entry.archiveType === "failed").length,
    }), [entries]);

    const actionableArchiveEntries = useMemo(
        () => filteredEntries.filter((entry) => (entry.source ?? "archive") === "archive"),
        [filteredEntries]
    );

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab("all");
        setActiveCategory("all");
        setActiveContainerColor("all");
        setDaysLeftSort("none");
        setLayoutMode("list");
        setSelectionMode("none");
        setSelectedArchiveIds(new Set());
        loadArchive();
    }, [isOpen]);

    useEffect(() => {
        if (selectionMode === "none") return;

        const visibleIds = new Set(filteredEntries.map((entry) => entry._id));
        setSelectedArchiveIds((prev) => {
            const next = new Set(Array.from(prev).filter((id) => visibleIds.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [filteredEntries, selectionMode]);

    const handleClose = () => {
        if (modalData?.returnTo === "repeat" && modalData?.returnContext) {
            openModal("repeat", modalData.returnContext);
            return;
        }

        closeModal();
    };

    const handleViewEntry = (entry: TaskArchiveEntry) => {
        openModal("view", {
            task: {
                _id: entry._id,
                userId: entry.userId,
                title: entry.title,
                description: entry.description ?? "",
                category: entry.category,
                status: entry.archiveType,
                completedAt: entry.completedAt ?? null,
                failedAt: entry.failedAt ?? null,
                repeatedAt: entry.repeatedAt ?? null,
                createdAt: entry.createdAt,
                updatedAt: entry.archivedAt,
                deadline: entry.deadline ?? null,
                orderIndex: entry.orderIndex ?? 0,
                isExpired: entry.isExpired,
                memoId: entry.memoId ?? null,
                containerColor: entry.containerColor,
            },
            returnTo: "taskArchive",
            returnContext: modal.data,
        });
    };

    const isArchiveEntry = (entry: TaskArchiveEntry) => (entry.source ?? "archive") === "archive";

    if (!isOpen) return null;

    const getDaysLeftLabel = (retentionDeleteAt?: string | null) => {
        if (!retentionDeleteAt) return "No expiry";

        const diffDays = getDaysLeftValue(retentionDeleteAt);
        return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
    };

    const handleToggleDaysLeftSort = () => {
        setDaysLeftSort((prev) => {
            if (prev === "none") return "highToLow";
            if (prev === "highToLow") return "lowToHigh";
            return "none";
        });
    };

    const handleToggleLayoutMode = () => {
        setLayoutMode((prev) => (prev === "list" ? "grid" : "list"));
    };

    const handleOpenReviewTasksYesterday = async () => {
        try {
            const review = await getRepeatReviewApi();

            if (!review.reviewRequired || review.tasks.length === 0) {
                return;
            }

            closeModal();

            window.setTimeout(() => {
                openModal("repeat", {
                    tasks: review.tasks,
                    cycleKey: review.cycleKey,
                    retentionDays: review.retentionDays,
                    archiveLabel: review.archiveLabel,
                    reviewSource: review.reviewSource ?? "live",
                    summary: review.summary,
                });
            }, 0);
        } catch (err) {
            console.error("[TaskArchiveModal] Failed opening review tasks yesterday:", err);
        }
    };

    const handleRepeatEntry = async (archiveEntryId: string) => {
        try {
            setBusyEntryId(archiveEntryId);
            await repeatTaskArchiveEntryApi(archiveEntryId);
            await Promise.all([fetchTasks(), refreshUser(), loadArchive()]);
            window.dispatchEvent(new CustomEvent(REPEAT_REVIEW_REFRESH_EVENT));
        } catch (err) {
            console.error("[TaskArchiveModal] Failed repeating archive entry:", err);
        } finally {
            setBusyEntryId(null);
        }
    };

    const handleDeleteEntry = async (archiveEntryId: string) => {
        try {
            setBusyEntryId(archiveEntryId);
            await deleteTaskArchiveEntryApi(archiveEntryId);
            await Promise.all([refreshUser(), loadArchive()]);
            window.dispatchEvent(new CustomEvent(REPEAT_REVIEW_REFRESH_EVENT));
        } catch (err) {
            console.error("[TaskArchiveModal] Failed deleting archive entry:", err);
        } finally {
            setBusyEntryId(null);
        }
    };

    const handleBulkRepeat = async () => {
        if (selectedArchiveIds.size === 0 || busyBulkAction) return;

        try {
            setBusyBulkAction("repeat");
            for (const archiveEntryId of selectedArchiveIds) {
                await repeatTaskArchiveEntryApi(archiveEntryId);
            }
            await Promise.all([fetchTasks(), refreshUser(), loadArchive()]);
            window.dispatchEvent(new CustomEvent(REPEAT_REVIEW_REFRESH_EVENT));
        } catch (err) {
            console.error("[TaskArchiveModal] Failed bulk repeating archive entries:", err);
        } finally {
            setBusyBulkAction(null);
            setSelectionMode("none");
            setSelectedArchiveIds(new Set());
        }
    };

    const handleBulkDelete = async () => {
        if (selectedArchiveIds.size === 0 || busyBulkAction) return;

        try {
            setBusyBulkAction("delete");
            for (const archiveEntryId of selectedArchiveIds) {
                await deleteTaskArchiveEntryApi(archiveEntryId);
            }
            await Promise.all([refreshUser(), loadArchive()]);
            window.dispatchEvent(new CustomEvent(REPEAT_REVIEW_REFRESH_EVENT));
        } catch (err) {
            console.error("[TaskArchiveModal] Failed bulk deleting archive entries:", err);
        } finally {
            setBusyBulkAction(null);
            setSelectionMode("none");
            setSelectedArchiveIds(new Set());
        }
    };

    const toggleSelectionMode = (mode: Exclude<ArchiveSelectionMode, "none">) => {
        setSelectedArchiveIds(new Set());
        setSelectionMode((prev) => prev === mode ? "none" : mode);
    };

    const toggleArchiveSelection = (archiveEntryId: string) => {
        if (selectionMode === "none") return;

        setSelectedArchiveIds((prev) => {
            const next = new Set(prev);
            if (next.has(archiveEntryId)) {
                next.delete(archiveEntryId);
            } else {
                next.add(archiveEntryId);
            }
            return next;
        });
    };

    return (
        <div
            style={modalOverlayStyle}
            className="task-archive-overlay"
            onMouseDown={handleClose}
        >
            <div
                className={`modal-card-base task-archive-card task-management-modal paper-sheet-lines ${selectionMode === "repeat" ? "multi-repeat-mode" : ""} ${selectionMode === "delete" ? "multi-delete-mode" : ""}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="task-archive-header task-management-modal-header">
                    <div className="task-management-modal-title-group task-archive-title-group">
                        <Icons.Notebook />
                        <h3>Task Archive</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleClose}
                        aria-label="Close task archive"
                    >
                        <Icons.Close />
                    </button>
                </div>

                <div className="task-archive-copy-block">
                    <p className="task-archive-description task-management-modal-subtitle">
                        Archived completed and failed tasks live here until their retention window ends. You can repeat them as fresh tasks or remove them manually.
                    </p>
                    <div className="task-archive-summary">
                        <span>Total: {summary.total}</span>
                        <span>Completed: {summary.completed}</span>
                        <span>Failed: {summary.failed}</span>
                    </div>
                    <div className="task-archive-review-entry">
                        <button
                            type="button"
                            className="btn-secondary-rect task-archive-review-btn"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={handleOpenReviewTasksYesterday}
                            disabled={loading || busyBulkAction !== null || busyEntryId !== null}
                        >
                            <Icons.ListDashes />
                            <span>Review Tasks Yesterday</span>
                        </button>
                    </div>
                </div>

                <div className="todo-tabs task-archive-filters">
                    <SegmentedSwitch
                        value={activeTab}
                        options={ARCHIVE_TABS.map((tab) => ({
                            value: tab,
                            label: ARCHIVE_TAB_LABELS[tab],
                        }))}
                        onChange={(value) => setActiveTab(value as ArchiveStatusTab)}
                        className="todo-status-switch"
                    />

                    <div className="todo-category-menu task-archive-category-menu">
                        <DropdownMenu
                            label="Category"
                            value={activeCategory === "all" ? "All Categories" : CATEGORY_LABELS[activeCategory]}
                            selectedValue={activeCategory}
                            options={categoryOptions}
                            onChange={(value) => setActiveCategory(value as "all" | TaskCategory)}
                            maxHeight={235}
                            renderOption={(option) => {
                                const IconComp = option.iconKey ? Icons[option.iconKey] : null;
                                return (
                                    <span className="todo-category-option">
                                        {IconComp && <IconComp className="todo-category-option-icon" />}
                                        <span>{option.label}</span>
                                    </span>
                                );
                            }}
                        />
                    </div>

                    <div className="todo-color-menu task-archive-color-menu">
                        <DropdownMenu
                            label="Container Color"
                            value="Container Color"
                            selectedValue={activeContainerColor}
                            options={[
                                { value: "all", label: "All", swatch: "transparent" },
                                ...colorOptions,
                            ]}
                            onChange={(value) => setActiveContainerColor(value)}
                            maxHeight={260}
                            menuClassName="todo-color-grid-menu"
                            itemClassName="todo-color-grid-item"
                            renderValue={(selected) => {
                                const swatchColor = selected?.value === "all" ? "transparent" : selected?.swatch;
                                return (
                                    <span className="todo-color-trigger-value">
                                        <span
                                            className={`todo-color-trigger-swatch ${selected?.value === "all" ? "all" : ""}`}
                                            style={swatchColor ? { backgroundColor: swatchColor } : undefined}
                                        />
                                        <span className="todo-filter-text">
                                            {selected?.value === "all" || !selected ? "All Colors" : "Color"}
                                        </span>
                                    </span>
                                );
                            }}
                            renderOption={(option, isActive) => (
                                option.value === "all" ? (
                                    <span className={`todo-color-all-option ${isActive ? "active" : ""}`}>
                                        All
                                    </span>
                                ) : (
                                    <span
                                        className={`todo-color-option-fill ${isActive ? "active" : ""}`}
                                        style={{ backgroundColor: option.swatch }}
                                    />
                                )
                            )}
                        />
                    </div>

                    <button
                        type="button"
                        className={`icon-btn-square task-archive-sort-btn ${daysLeftSort !== "none" ? "active" : ""}`}
                        onClick={handleToggleDaysLeftSort}
                        aria-label={
                            daysLeftSort === "highToLow"
                                ? "Days left sorted high to low. Click to sort low to high"
                                : daysLeftSort === "lowToHigh"
                                    ? "Days left sorted low to high. Click to clear sorting"
                                    : "Sort archive tasks by days left"
                        }
                        title={
                            daysLeftSort === "highToLow"
                                ? "Days left: high to low"
                                : daysLeftSort === "lowToHigh"
                                    ? "Days left: low to high"
                                    : "Days left sort"
                        }
                    >
                        <Icons.Clock />
                        {daysLeftSort !== "none" && (
                            <span className={`task-archive-sort-indicator ${daysLeftSort}`}>
                                <Icons.ArrowUp />
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`icon-btn-square task-archive-layout-btn ${layoutMode === "grid" ? "active" : ""}`}
                        onClick={handleToggleLayoutMode}
                        aria-label={layoutMode === "grid" ? "Switch archive layout to list view" : "Switch archive layout to grid view"}
                        title={layoutMode === "grid" ? "Grid view" : "List view"}
                    >
                        {layoutMode === "grid" ? <Icons.Shapes /> : <Icons.Todo />}
                    </button>

                    <div className="task-archive-bulk-actions">
                        <button
                            type="button"
                            className={`icon-btn-square btn-green-rect task-archive-bulk-btn ${selectionMode === "repeat" ? "active" : ""}`}
                            onClick={() => toggleSelectionMode("repeat")}
                            disabled={actionableArchiveEntries.length === 0 || busyBulkAction !== null}
                            aria-label={selectionMode === "repeat" ? "Cancel multi-repeat mode" : "Enable multi-repeat mode"}
                            title={selectionMode === "repeat" ? "Cancel multi-repeat mode" : "Enable multi-repeat mode"}
                        >
                            {selectionMode === "repeat" ? <Icons.Close /> : <Icons.Repeat />}
                        </button>
                        <button
                            type="button"
                            className={`icon-btn-square btn-danger-rect task-archive-bulk-btn task-archive-bulk-delete-btn ${selectionMode === "delete" ? "active" : ""}`}
                            onClick={() => toggleSelectionMode("delete")}
                            disabled={actionableArchiveEntries.length === 0 || busyBulkAction !== null}
                            aria-label={selectionMode === "delete" ? "Cancel multi-delete mode" : "Enable multi-delete mode"}
                            title={selectionMode === "delete" ? "Cancel multi-delete mode" : "Enable multi-delete mode"}
                        >
                            {selectionMode === "delete" ? <Icons.Close /> : <Icons.Delete />}
                        </button>
                    </div>
                </div>

                <div className="task-archive-list-wrapper task-management-modal-panel">
                    <div className={`task-archive-list ${layoutMode === "grid" ? "grid-layout" : "list-layout"}`}>
                        {loading && <div className="task-archive-empty-state">Loading archive...</div>}
                        {!loading && error && <div className="task-archive-empty-state">{error}</div>}
                        {!loading && !error && filteredEntries.length === 0 && (
                            <div className="task-archive-empty-state">No archived tasks match the current filters.</div>
                        )}

                        {!loading && !error && filteredEntries.map((entry) => {
                            const CategoryIcon = Icons[getTaskCategoryIconKey(entry.category)];
                            const StatusIcon = Icons[getTaskStatusIconKey(entry.archiveType)];
                            const archiveAccent = entry.archiveType === "completed"
                                ? "var(--success-accent)"
                                : "var(--btn-danger)";
                            const isBusy = busyEntryId === entry._id;
                            const canUseArchiveActions = isArchiveEntry(entry);

                            return (
                                <div
                                    key={`${entry.source ?? "archive"}-${entry._id}`}
                                    className={`task-archive-item ${entry.archiveType} ${layoutMode === "grid" ? "grid-layout" : "list-layout"}`}
                                    onClick={() => handleViewEntry(entry)}
                                >
                                    {selectionMode !== "none" && canUseArchiveActions && (
                                        <div
                                            className="task-archive-select"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleArchiveSelection(entry._id);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedArchiveIds.has(entry._id)}
                                                readOnly
                                            />
                                        </div>
                                    )}

                                    <div className="task-archive-item-main">
                                        <span className="task-archive-title">{entry.title}</span>
                                        <span
                                            className="task-archive-color-line"
                                            style={{ backgroundColor: entry.containerColor || archiveAccent }}
                                            aria-hidden="true"
                                        />
                                        <div className="task-archive-subinfo-right">
                                            <span className="task-archive-meta-label">
                                                {safeCategoryLabel(entry.category)}
                                            </span>
                                            <CategoryIcon className="task-archive-meta-icon" />
                                            <span className={`task-archive-meta-label task-archive-status-label ${entry.archiveType}`}>
                                                {safeStatusLabel(entry.archiveType)}
                                            </span>
                                            <StatusIcon className={`task-archive-meta-icon task-archive-status-icon ${entry.archiveType}`} />
                                            <span className="task-archive-retention-label">
                                                {canUseArchiveActions ? getDaysLeftLabel(entry.retentionDeleteAt) : "Review pending"}
                                            </span>
                                        </div>
                                    </div>

                                    {selectionMode === "none" && (
                                        <div className="task-archive-item-actions">
                                            {canUseArchiveActions ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-green-rect task-archive-action-btn"
                                                        disabled={isBusy}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRepeatEntry(entry._id);
                                                        }}
                                                    >
                                                        <Icons.Repeat />
                                                        <span>{isBusy ? "Working..." : "Repeat"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-danger-rect task-archive-action-btn task-archive-delete-btn"
                                                        disabled={isBusy}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteEntry(entry._id);
                                                        }}
                                                    >
                                                        <Icons.Delete />
                                                        <span>Delete</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn-secondary-rect task-archive-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenReviewTasksYesterday();
                                                    }}
                                                >
                                                    <Icons.ListDashes />
                                                    <span>Open RTY</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="task-archive-footer-actions">
                    {selectionMode === "repeat" && (
                        <button
                            type="button"
                            className="btn-green-rect task-archive-mode-action-btn"
                            onMouseDown={(e) => e.stopPropagation()}
                            disabled={selectedArchiveIds.size === 0 || busyBulkAction !== null}
                            onClick={handleBulkRepeat}
                        >
                            <Icons.Repeat />
                            <span>{busyBulkAction === "repeat" ? "Working..." : `Repeat Selected (${selectedArchiveIds.size})`}</span>
                        </button>
                    )}

                    {selectionMode === "delete" && (
                        <button
                            type="button"
                            className="btn-danger-rect task-archive-mode-action-btn task-archive-mode-delete-btn"
                            onMouseDown={(e) => e.stopPropagation()}
                            disabled={selectedArchiveIds.size === 0 || busyBulkAction !== null}
                            onClick={handleBulkDelete}
                        >
                            <Icons.Delete />
                            <span>{busyBulkAction === "delete" ? "Working..." : `Delete Selected (${selectedArchiveIds.size})`}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskArchiveModal;
