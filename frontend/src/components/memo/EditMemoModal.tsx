// ============================================================================
// EditMemoModal.tsx
// ============================================================================

import { useEffect, useState } from "react";
import { useMemoContext } from "../../context/MemoContext";
import { Icons } from "../../styles/iconLibrary";

import {
    memoCategoryIconMap,
    MEMO_CONTAINER_COLORS,
    memoPinColors,
    getDefaultMemoPinColor
} from "../../utils/memoUtils/memoUtils";

import {
    modalOverlayStyle,
} from "../../styles/modalStyles";
import "../common/modals/modalBaseTheme.css";

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

    return (
        <div style={modalOverlayStyle}>
            <div className="modal-card-base memo-modal-card">

                {/* ================= HEADER ================= */}
                <div className="memo-header">
                    <h2>Edit Memo</h2>

                    <button
                        className="icon-btn"
                        onClick={closeModal}
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* ================= TITLE ================= */}
                <div className="memo-modal-field">
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                {/* ================= CONTENT ================= */}
                <div className="memo-modal-field">
                    <label>Content</label>
                    <textarea
                        rows={4}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                </div>

                {/* ================= CATEGORY ================= */}
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

                {/* ================= PIN COLOR ================= */}
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

                {/* ================= MEMO COLOR ================= */}
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

                {/* ================= ACTIONS ================= */}
                <div className="memo-modal-actions">
                    <button
                        className="btn-secondary-rect"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn-primary-rect"
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
