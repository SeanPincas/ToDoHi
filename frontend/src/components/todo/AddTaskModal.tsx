// ============================================================================
// AddTaskModal.tsx — Refactored with iconLibrary + modalStyles + taskUtils
// ============================================================================

import React, { useState, useEffect } from "react";
import { useTodo } from "../../context/TodoContext";
import {
    TASK_CATEGORIES,
    CATEGORY_LABELS,
    TASK_COLOR_OPTIONS,
    type TaskCategory,
} from "../../utils/taskUtils";

import { Icons } from "../../styles/iconLibrary";
import { modalOverlayStyle, modalCardBaseStyle } from "../../styles/modalStyles";

import "./AddTaskModal.css";

const AddTaskModal: React.FC = () => {
    const { modal, closeModal, addTask } = useTodo();

    // ------------------ FORM FIELDS ------------------
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TaskCategory>("others");
    const [containerColor, setContainerColor] = useState("#ffffff");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Dropdown state
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

    // ------------------ RESET FORM WHEN OPEN ------------------
    useEffect(() => {
        if (modal.isOpen && modal.type === "add") {
            setTitle("");
            setDescription("");
            setCategory("others");
            setContainerColor("#ffffff");
            setIsCatDropdownOpen(false);
            setErrorMsg(null);
        }
    }, [modal.isOpen, modal.type]);

    // ------------------ DO NOT RENDER IF NOT OPEN ------------------
    if (!modal.isOpen || modal.type !== "add") return null;

    const handleClose = () => {
        if (!loading) closeModal();
    };

    // ------------------ FORM SUBMIT ------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setErrorMsg("Task Title is required.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        const payload = {
            title: title.trim(),
            description: description.trim(),
            category,
            containerColor,
        };

        try {
            await addTask(payload);
            closeModal();
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Failed to create task.");
        }

        setLoading(false);
    };

    // ======================================================================
    //                              UI RENDER
    // ======================================================================
    return (
        <div
            className="todo-modal-overlay"
            style={modalOverlayStyle}
            onMouseDown={handleClose}
        >
            <div
                className="todo-modal-card"
                style={modalCardBaseStyle}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ------------------ HEADER ------------------ */}
                <div className="todo-modal-header">
                    <h3>Create Task</h3>

                    <button className="modal-x-btn" onClick={handleClose}>
                        <Icons.Close />
                    </button>
                </div>

                {/* ------------------ ERROR ------------------ */}
                {errorMsg && (
                    <div className="todo-modal-error">{errorMsg}</div>
                )}

                {/* ------------------ FORM ------------------ */}
                <form className="todo-modal-form" onSubmit={handleSubmit}>
                    {/* TITLE */}
                    <label className="todo-field">
                        <span className="todo-label">Title *</span>
                        <input
                            className="todo-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task name"
                        />
                    </label>

                    {/* DESCRIPTION */}
                    <label className="todo-field">
                        <span className="todo-label">Description</span>
                        <textarea
                            className="todo-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description details (optional)"
                        />
                    </label>

                    {/* ------------------ CATEGORY DROPDOWN ------------------ */}
                    <label className="todo-field">
                        <span className="todo-label">Category</span>

                        <div
                            className={`todo-dropdown ${
                                isCatDropdownOpen ? "open" : ""
                            }`}
                            onClick={() =>
                                setIsCatDropdownOpen(!isCatDropdownOpen)
                            }
                        >
                            <span className="todo-dropdown-selected">
                                {CATEGORY_LABELS[category]}
                            </span>

                            <span className="todo-dropdown-arrow">▼</span>

                            {isCatDropdownOpen && (
                                <div className="todo-dropdown-menu">
                                    {TASK_CATEGORIES.map((cat: TaskCategory) => (
                                        <div
                                            key={cat}
                                            className="todo-dropdown-item"
                                            onClick={() => {
                                                setCategory(cat);
                                                setIsCatDropdownOpen(false);
                                            }}
                                        >
                                            {CATEGORY_LABELS[cat]}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </label>

                    {/* ------------------ COLOR PICKER GRID ------------------ */}
                    <label className="todo-field">
                        <span className="todo-label">Task Color</span>

                        <div className="todo-color-grid">
                            {TASK_COLOR_OPTIONS.map((c) => (
                                <div
                                    key={c.hex}
                                    className={`todo-color-option ${
                                        containerColor === c.hex
                                            ? "selected"
                                            : ""
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    onClick={() =>
                                        setContainerColor(c.hex)
                                    }
                                />
                            ))}
                        </div>
                    </label>

                    {/* ------------------ FOOTER ------------------ */}
                    <div className="todo-modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
