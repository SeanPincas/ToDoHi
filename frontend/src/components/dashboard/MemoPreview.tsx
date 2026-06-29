import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMemoContext } from "../../context/MemoContext";
import { getMemoCategoryIconKey } from "../../utils/memoUtils/memoUtils";
import { Icons } from "../../styles/iconLibrary";
import sampaguitaImage from "../../assets/sampaguita.webp";
import mayaBirdImage from "../../assets/maya.webp";

import "./MemoPreview.css";
import "../../styles/ButtonStyles.css";

const MemoPreview: React.FC = () => {
    const { memos, loading, openModal } = useMemoContext();
    const navigate = useNavigate();
    const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
    const [alphabetSort, setAlphabetSort] = useState<"none" | "asc" | "desc">("none");
    const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false);
    const [selectedMemoIds, setSelectedMemoIds] = useState<Set<string>>(new Set());
    const [busyDelete] = useState(false);

    const selectedCount = selectedMemoIds.size;
    const hasMemos = memos.length > 0;

    const visibleMemos = useMemo(() => {
        if (alphabetSort === "none") {
            return memos;
        }

        const sorted = [...memos].sort((a, b) =>
            a.title.localeCompare(b.title, undefined, {
                sensitivity: "base",
            })
        );

        return alphabetSort === "asc" ? sorted : sorted.reverse();
    }, [alphabetSort, memos]);

    const formatMemoDate = (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const toggleLayoutMode = () => {
        setLayoutMode((prev) => (prev === "grid" ? "list" : "grid"));
        setSelectedMemoIds(new Set());
    };

    const toggleAlphabetSort = () => {
        setAlphabetSort((prev) => {
            if (prev === "none") return "asc";
            if (prev === "asc") return "desc";
            return "none";
        });
    };

    const toggleMultiDeleteMode = () => {
        setIsMultiDeleteMode((prev) => !prev);
        setSelectedMemoIds(new Set());
    };

    const toggleMemoSelection = (memoId: string) => {
        if (!isMultiDeleteMode) return;

        setSelectedMemoIds((prev) => {
            const next = new Set(prev);
            if (next.has(memoId)) {
                next.delete(memoId);
            } else {
                next.add(memoId);
            }
            return next;
        });
    };

    const handleDeleteSelected = () => {
        if (selectedMemoIds.size === 0 || busyDelete) return;

        openModal("deleteConfirm", {
            memoIds: Array.from(selectedMemoIds),
            onConfirmSuccess: () => {
                setSelectedMemoIds(new Set());
                setIsMultiDeleteMode(false);
            },
        });
    };

    return (
        <div className={`memo-preview-card ${isMultiDeleteMode ? "multi-delete-mode" : ""}`}>
            <div className="memo-preview-header">
                <div className="memo-preview-header-left">
                    <button
                        type="button"
                        className="btn-secondary-rect memo-preview-action-btn memo-preview-link-btn"
                        onClick={() => navigate("/memoboard")}
                    >
                        <Icons.Memo />
                        <span>Go to Memoboard</span>
                    </button>
                </div>

                <div
                    aria-hidden="true"
                    className="memo-preview-header-flower"
                    style={{ backgroundImage: `url(${sampaguitaImage})` }}
                />

                <div className="memo-preview-title">
                    <Icons.Note className="memo-preview-title-icon" />
                    <span>Memos</span>
                </div>

                <div className="memo-preview-actions">
                    <button
                        type="button"
                        className={`icon-btn-square memo-preview-icon-btn memo-preview-layout-btn ${layoutMode === "list" ? "active" : ""}`}
                        onClick={toggleLayoutMode}
                        aria-label={layoutMode === "grid" ? "Switch memo preview to list layout" : "Switch memo preview to grid layout"}
                        title={layoutMode === "grid" ? "List layout" : "Grid layout"}
                    >
                        {layoutMode === "grid" ? <Icons.ListDashes /> : <Icons.SquaresFour />}
                    </button>

                    <button
                        type="button"
                        className={`icon-btn-square memo-preview-icon-btn memo-preview-alpha-btn ${alphabetSort !== "none" ? "active" : ""} ${alphabetSort === "desc" ? "desc" : ""}`}
                        onClick={toggleAlphabetSort}
                        aria-label={
                            alphabetSort === "none"
                                ? "Sort memos alphabetically ascending"
                                : alphabetSort === "asc"
                                    ? "Sort memos alphabetically descending"
                                    : "Clear alphabetical memo sorting"
                        }
                        title={
                            alphabetSort === "none"
                                ? "A-Z"
                                : alphabetSort === "asc"
                                    ? "Z-A"
                                    : "Clear alphabetical sort"
                        }
                    >
                        <span className={`memo-preview-sort-stack ${alphabetSort === "desc" ? "desc" : ""}`} aria-hidden="true">
                            {alphabetSort === "none" ? (
                                <Icons.ArrowsDownUp className="memo-preview-sort-arrow memo-preview-sort-arrow-neutral" />
                            ) : (
                                <Icons.ArrowUp className="memo-preview-sort-arrow" />
                            )}
                            <span className="memo-preview-sort-glyph">
                                {alphabetSort === "none" ? "A-Z" : alphabetSort === "asc" ? "A-Z" : "Z-A"}
                            </span>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`icon-btn-square delete memo-preview-icon-btn memo-preview-delete-btn memo-preview-delete-toggle ${isMultiDeleteMode ? "active" : ""}`}
                        onClick={toggleMultiDeleteMode}
                        disabled={!hasMemos || busyDelete}
                        aria-label={isMultiDeleteMode ? "Cancel multi delete mode" : "Enable multi delete mode"}
                        title={isMultiDeleteMode ? "Cancel multi delete mode" : "Enable multi delete mode"}
                    >
                        {isMultiDeleteMode ? <Icons.Close /> : <Icons.Delete />}
                    </button>

                    <button
                        type="button"
                        className="btn-green-rect icon-btn-square memo-preview-icon-btn memo-preview-action-btn memo-preview-add-btn"
                        onClick={() => navigate("/memoboard", {
                            state: {
                                openAddMemo: true,
                            },
                        })}
                    >
                        <Icons.Add />
                        <span>Add Memo</span>
                    </button>
                </div>
            </div>

            <div className="memo-preview-list-container">
                <div
                    aria-hidden="true"
                    className="memo-preview-maya-bird"
                    style={{ backgroundImage: `url(${mayaBirdImage})` }}
                />

                <div className="memo-preview-list-wrapper">
                    {loading && (
                        <div className="memo-preview-empty">
                            Loading memos...
                        </div>
                    )}

                    {!loading && memos.length === 0 && (
                        <div className="memo-preview-empty">
                            No memos yet.
                        </div>
                    )}

                    {!loading && memos.length > 0 && (
                        <div className={`memo-preview-list ${layoutMode === "list" ? "list-layout" : "grid-layout"}`}>
                            {visibleMemos.map((memo) => {
                                const CategoryIcon = Icons[getMemoCategoryIconKey(memo.category)];
                                const isSelected = selectedMemoIds.has(memo._id);
                                const formattedCreatedAt = formatMemoDate(memo.createdAt);
                                return (
                                    <div
                                        key={memo._id}
                                        className={`memo-preview-item ${layoutMode === "list" ? "list-layout" : "grid-layout"} ${isMultiDeleteMode ? "delete-mode" : ""} ${isSelected ? "selected" : ""}`}
                                        style={{ backgroundColor: memo.containerColor }}
                                        onClick={() => {
                                            if (isMultiDeleteMode) {
                                                toggleMemoSelection(memo._id);
                                                return;
                                            }

                                            navigate("/memoboard", {
                                                state: {
                                                    openMemoId: memo._id,
                                                },
                                            });
                                        }}
                                    >
                                        {isMultiDeleteMode && layoutMode === "list" && (
                                            <label
                                                className="memo-preview-checkbox-hitbox"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMemoSelection(memo._id)}
                                                />
                                            </label>
                                        )}

                                        {isMultiDeleteMode && isSelected && (
                                            <div className="memo-preview-delete-overlay" aria-hidden="true">
                                                <Icons.Close className="memo-preview-delete-overlay-icon" />
                                            </div>
                                        )}

                                        <span
                                            className="memo-preview-pin"
                                            style={{ backgroundColor: memo.pinColor }}
                                        />

                                        <div className="memo-preview-text">
                                            <div className="memo-preview-item-title">
                                                {memo.title}
                                            </div>

                                            <div className="memo-preview-category">
                                                <CategoryIcon /> {memo.category}
                                            </div>
                                        </div>

                                        <span className="memo-preview-created-at">
                                            {formattedCreatedAt}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {isMultiDeleteMode && (
                    <div className="memo-preview-mode-actions">
                        <button
                            type="button"
                            className="btn-danger-rect primary-btn memo-preview-mode-action-btn"
                            disabled={selectedCount === 0 || busyDelete}
                            onClick={handleDeleteSelected}
                        >
                            <Icons.Delete />
                            <span className="memo-main-action-text">{busyDelete ? "Deleting..." : `Delete Selected (${selectedCount})`}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoPreview;

