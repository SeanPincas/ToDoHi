// ============================================================================
// AddMemoModal.tsx
// ============================================================================

import React, { useEffect, useState } from "react";
import { useMemoContext } from "../../context/MemoContext";
import MemoCardBaseOverlay from "../../styles/MemoCardBaseOverlay";

import { modalOverlayStyle } from "../../styles/modalStyles";
import "../../styles/ButtonStyles.css"
import "../common/modals/modalBaseTheme.css";
import "../common/modals/taskManagementModalTheme.css";

import {
    MEMO_CONTENT_MAX_LENGTH,
    MEMO_TITLE_MAX_LENGTH,
    formatMemoPreviewTextByWidth,
    memoPinColors,
    getDefaultMemoPinColor,
    memoCategoryIconMap,
    getMemoCategoryIconKey,
    resolveMemoContainerColor,
    MEMO_CONTAINER_COLORS
} from "../../utils/memoUtils/memoUtils";

import { Icons } from "../../styles/iconLibrary";

import "./AddMemoModal.css"

// ----------------------------- COMPONENT -----------------------------------
const AddMemoModal: React.FC = () => {
    const {
        activeModal,
        closeModal,
        addMemo
    } = useMemoContext();

    // ------------------ LOCAL FORM STATE ------------------
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<string>("others");
    const [containerColor, setContainerColor] = useState<string>(resolveMemoContainerColor());
    const [pinColor, setPinColor] = useState<string>(getDefaultMemoPinColor());
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // ------------------ USE EFFECTS ------------------
    useEffect(() => {
        if (activeModal === "add") {
            setTitle(""),
            setContent(""),
            setCategory("others"),
            setContainerColor(resolveMemoContainerColor());
            setPinColor(getDefaultMemoPinColor());
            setIsPreviewOpen(false);
            setErrorMsg(null);
            setLoading(false);
        }
    }, [activeModal])

    // ------------------ HOOKS ------------------
    if (activeModal !== "add") return null;

    const handleClose = () => {
        if (!loading) closeModal();
    };

    // ------------------ HANDLER ------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setErrorMsg("Memo title is required.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            await addMemo({
                title: title.trim(),
                content: content.trim(),
                category,
                pinColor,
                containerColor
            });

            closeModal();
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Failed to create task.");
        }

        setLoading(false);
    }

    const memoCategoryIconKey = getMemoCategoryIconKey(category);
    const MemoCategoryIcon = Icons[memoCategoryIconKey];
    const previewTitle = title.trim() || "Untitled Memo";
    const previewContent = formatMemoPreviewTextByWidth(
        content.trim() || "No content",
        196,
        '400 13.6px "Kalam", cursive'
    );

    // --------------------- RENDER ------------------------------
    return (
        <div style={modalOverlayStyle} onMouseDown={handleClose}>
            <div
                className="modal-card-base memo-modal-card add-memo-modal-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className={`add-memo-modal-notch ${isPreviewOpen ? "open" : ""}`}
                    aria-label={isPreviewOpen ? "Hide live memo preview" : "Show live memo preview"}
                    aria-pressed={isPreviewOpen}
                    onClick={() => setIsPreviewOpen((prev) => !prev)}
                >
                    <Icons.Note />
                </button>

                <aside
                    className={`add-memo-live-preview ${isPreviewOpen ? "open" : ""}`}
                    aria-hidden={!isPreviewOpen}
                >
                    <div className="add-memo-live-preview-shell task-management-modal-panel">
                        <div className="add-memo-live-preview-header">
                            <span className="add-memo-live-preview-title">Memo Preview</span>
                            <span className="add-memo-live-preview-meta">{category}</span>
                        </div>

                        <div className="add-memo-live-preview-card-wrap">
                            <MemoCardBaseOverlay
                                title={previewTitle}
                                content={previewContent}
                                categoryIcon={<MemoCategoryIcon />}
                                containerColor={containerColor}
                                pinColor={pinColor}
                                scrollableContent={true}
                            />
                        </div>
                    </div>
                </aside>

                {/* ================= HEADER ================= */}
                <div className="memo-header task-management-modal-header">
                    <div className="task-management-modal-title-group memo-modal-title-group">
                        <Icons.Note />
                        <h3>Add Memo</h3>
                    </div>

                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <Icons.Close />
                    </button>
                </div>

                <p className="task-management-modal-subtitle memo-modal-subtitle">
                    Create a memo card with its note content, pin color, category, and paper color.
                </p>

                {/* ================= ERROR ================= */}
                {errorMsg && (
                    <div className="memo-modal-error">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ---------------- TITLE ---------------- */}
                    <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                        <label>Title</label>
                        <input
                            type="text"
                            placeholder="Memo title"
                            value={title}
                            maxLength={MEMO_TITLE_MAX_LENGTH}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <span className="memo-modal-char-count">
                            {title.length}/{MEMO_TITLE_MAX_LENGTH}
                        </span>
                    </div>

                    {/* ---------------- CONTENT ---------------- */}
                    <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                        <label>Content</label>
                        <textarea
                            placeholder="Write Something..."
                            rows={4}
                            value={content}
                            maxLength={MEMO_CONTENT_MAX_LENGTH}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <span className="memo-modal-char-count">
                            {content.length}/{MEMO_CONTENT_MAX_LENGTH}
                        </span>
                    </div>

                    {/* ---------------- CONTENT ---------------- */}
                    <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                        <label>Category</label>

                        <div className="memo-category-grid">
                            {Object.entries(memoCategoryIconMap).map(
                                ([key, iconKey]) => {
                                    const CategoryIcon = Icons[iconKey];
                                    return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`memo-category-item ${category === key ? "active" : ""
                                            }`}
                                        onClick={() => setCategory(key)}
                                    >
                                        <span className="emoji"><CategoryIcon /></span>
                                    </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* ================= PIN COLOR PICKER ================= */}
                    <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                        <label>Pin Color</label>

                        <div className="memo-pin-grid">
                            {memoPinColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`memo-pin-dot ${pinColor === color ? "active" : ""
                                        }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setPinColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ================= CONTAINER COLOR PICKER ================= */}
                    <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                        <label>Memo Color</label>

                        <div className="memo-container-color-grid">
                            {Object.entries(MEMO_CONTAINER_COLORS).map(
                                ([key, color]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`memo-container-color-item ${containerColor === color ? "active" : ""
                                            }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setContainerColor(color)}
                                    />
                                )
                            )}
                        </div>
                    </div>

                    {/* ================= ACTIONS ================= */}
                    <div className="memo-modal-actions task-management-modal-actions">
                        <button
                            type="button"
                            className="btn-secondary-rect"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-green-rect"
                            disabled={loading}
                        >
                            <Icons.Add />
                            {loading ? "Creating…" : "Create Memo"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddMemoModal;





