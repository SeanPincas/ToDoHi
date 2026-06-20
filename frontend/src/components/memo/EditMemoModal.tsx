// ============================================================================
// EditMemoModal.tsx
// ============================================================================

import { useEffect, useState } from "react";
import { useMemoContext } from "../../context/MemoContext";
import { Icons } from "../../styles/iconLibrary";
import MemoCardBaseOverlay from "../../styles/MemoCardBaseOverlay";

import {
    MEMO_CONTENT_MAX_LENGTH,
    MEMO_TITLE_MAX_LENGTH,
    formatMemoPreviewTextByWidth,
    getMemoCategoryIconKey,
    memoCategoryIconMap,
    MEMO_CONTAINER_COLORS,
    memoPinColors,
    getDefaultMemoPinColor
} from "../../utils/memoUtils/memoUtils";

import {
    modalOverlayStyle,
} from "../../styles/modalStyles";
import "../common/modals/modalBaseTheme.css";
import "../common/modals/taskManagementModalTheme.css";
import "../../styles/ButtonStyles.css";

import "./EditMemoModal.css";

// ============================================================================

const EditMemoModal = () => {
    const {
        activeModal,
        activeMemoId,
        closeModal,
        memos,
        updateMemoContent,
    } = useMemoContext();

    // ---------------------------------------------------------------------
    // ALWAYS RUN HOOKS FIRST — NO CONDITIONALS ABOVE THESE
    // ---------------------------------------------------------------------

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<string>("others");
    const [pinColor, setPinColor] = useState<string>(
        getDefaultMemoPinColor()
    );
    const [containerColor, setContainerColor] = useState<string>(
        MEMO_CONTAINER_COLORS.yellow
    );
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const memo = memos.find(m => m._id === activeMemoId);

    // ---------------------------------------------------------------------
    // Sync local state when memo changes
    // ---------------------------------------------------------------------

    useEffect(() => {
        if (!memo) return;

        setTitle(memo.title);
        setContent(memo.content ?? "");
        setCategory(memo.category ?? "others");
        setPinColor(memo.pinColor ?? getDefaultMemoPinColor());
        setContainerColor(
            memo.containerColor ??
            MEMO_CONTAINER_COLORS.yellow
        );
        setIsPreviewOpen(false);
    }, [memo]);

    // ---------------------------------------------------------------------
    // NOW we are allowed to guard render
    // ---------------------------------------------------------------------

    if (activeModal !== "edit" || !memo) return null;

    // ---------------------------------------------------------------------

    const handleSave = async () => {
        await updateMemoContent(memo._id, {
            title,
            content,
            category,
            pinColor,
            containerColor,
        });

        closeModal();
    };

    // ---------------------------------------------------------------------

    const memoCategoryIconKey = getMemoCategoryIconKey(category);
    const MemoCategoryIcon = Icons[memoCategoryIconKey];
    const previewTitle = title.trim() || "Untitled Memo";
    const previewContent = formatMemoPreviewTextByWidth(
        content.trim() || "No content",
        196,
        '400 13.6px "Kalam", cursive'
    );

    return (
        <div style={modalOverlayStyle} onMouseDown={closeModal}>
            <div
                className="modal-card-base memo-modal-card edit-memo-modal-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className={`edit-memo-modal-notch ${isPreviewOpen ? "open" : ""}`}
                    aria-label={isPreviewOpen ? "Hide live memo preview" : "Show live memo preview"}
                    aria-pressed={isPreviewOpen}
                    onClick={() => setIsPreviewOpen((prev) => !prev)}
                >
                    <Icons.Note />
                </button>

                <aside
                    className={`edit-memo-live-preview ${isPreviewOpen ? "open" : ""}`}
                    aria-hidden={!isPreviewOpen}
                >
                    <div className="edit-memo-live-preview-shell task-management-modal-panel">
                        <div className="edit-memo-live-preview-header">
                            <span className="edit-memo-live-preview-title">Memo Preview</span>
                            <span className="edit-memo-live-preview-meta">{category}</span>
                        </div>

                        <div className="edit-memo-live-preview-card-wrap">
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
                        <h3>Edit Memo</h3>
                    </div>

                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={closeModal}
                    >
                        <Icons.Close />
                    </button>
                </div>

                <p className="task-management-modal-subtitle memo-modal-subtitle">
                    Update the memo card details, note content, pin color, category, and paper color.
                </p>

                {/* ================= TITLE ================= */}
                <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                    <label>Title</label>
                    <input
                        value={title}
                        maxLength={MEMO_TITLE_MAX_LENGTH}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <span className="memo-modal-char-count">
                        {title.length}/{MEMO_TITLE_MAX_LENGTH}
                    </span>
                </div>

                {/* ================= CONTENT ================= */}
                <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                    <label>Content</label>
                    <textarea
                        rows={4}
                        value={content}
                        maxLength={MEMO_CONTENT_MAX_LENGTH}
                        onChange={e => setContent(e.target.value)}
                    />
                    <span className="memo-modal-char-count">
                        {content.length}/{MEMO_CONTENT_MAX_LENGTH}
                    </span>
                </div>

                {/* ================= CATEGORY ================= */}
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
                                    className={`memo-category-item ${
                                        category === key ? "active" : ""
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

                {/* ================= PIN COLOR ================= */}
                <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                    <label>Pin Color</label>
                    <div className="memo-pin-grid">
                        {memoPinColors.map(color => (
                            <button
                                key={color}
                                type="button"
                                className={`memo-pin-dot ${
                                    pinColor === color ? "active" : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setPinColor(color)}
                            />
                        ))}
                    </div>
                </div>

                {/* ================= MEMO COLOR ================= */}
                <div className="memo-modal-field task-management-modal-panel memo-modal-field-panel">
                    <label>Memo Color</label>
                    <div className="memo-container-color-grid">
                        {Object.values(MEMO_CONTAINER_COLORS).map(color => (
                            <button
                                key={color}
                                type="button"
                                className={`memo-container-color-item ${
                                    containerColor === color ? "active" : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setContainerColor(color)}
                            />
                        ))}
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="memo-modal-actions task-management-modal-actions">
                    <button
                        className="btn-secondary-rect"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn-green-rect"
                        onClick={handleSave}
                    >
                        <Icons.Confirm />
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditMemoModal;
