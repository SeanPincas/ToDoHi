// ============================================================================
// AddMemoModal.tsx
// ============================================================================

import React, { useEffect, useState } from "react";
import { useMemoContext } from "../../context/MemoContext";

import { modalOverlayStyle, modalCardBaseStyle } from "../../styles/modalStyles";
import "../../styles/ButtonStyles.css"

import {
    memoPinColors,
    getRandomMemoPinColor,
    memoCategoryEmojiMap,
    resolveMemoContainerColor,
    MEMO_CONTAINER_COLORS
} from "../../utils/memoUtils";

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
    const [pinColor, setPinColor] = useState<string>(getRandomMemoPinColor());

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // ------------------ USE EFFECTS ------------------
    useEffect(() => {
        if (activeModal === "add") {
            setTitle(""),
                setContent(""),
                setCategory("others"),
                setContainerColor(resolveMemoContainerColor());
            setPinColor(getRandomMemoPinColor());
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
            setErrorMsg("Task Title is required.");
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

    // --------------------- RENDER ------------------------------
    return (
        <div style={modalOverlayStyle} onClick={handleClose}>
            <div style={modalCardBaseStyle} onClick={(e) => e.stopPropagation()}>

                {/* ================= HEADER ================= */}
                <div className="memo-header">
                    <h2>Add Memo</h2>

                    <button
                        className="icon-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* ================= ERROR ================= */}
                {errorMsg && (
                    <div className="memo-modal-error">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ---------------- TITLE ---------------- */}
                    <div className="memo-modal-field">
                        <label>Title</label>
                        <input
                            type="text"
                            placeholder="Memo title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* ---------------- CONTENT ---------------- */}
                    <div className="memo-modal-field">
                        <label>Content</label>
                        <textarea
                            placeholder="Write Something..."
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* ---------------- CONTENT ---------------- */}
                    <div className="memo-modal-field">
                        <label>Category</label>

                        <div className="memo-category-grid">
                            {Object.entries(memoCategoryEmojiMap).map(
                                ([key, emoji]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`memo-category-item ${category === key ? "active" : ""
                                            }`}
                                        onClick={() => setCategory(key)}
                                    >
                                        <span className="emoji">{emoji}</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* ================= PIN COLOR PICKER ================= */}
                    <div className="memo-modal-field">
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
                    <div className="memo-modal-field">
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
                    <div className="memo-modal-actions">
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
                            className="btn-primary-rect"
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





