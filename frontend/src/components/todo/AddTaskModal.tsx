import React, { useState, useEffect } from "react";
import { useTodo } from "../../context/TodoContext";

import {
    TASK_CATEGORIES,
    CATEGORY_LABELS,
    TASK_COLOR_OPTIONS,
} from "../../utils/taskUtils";

import "./AddTaskModal.css";

const AddTaskModal: React.FC = () => {
    const { modal, closeModal, addTask } = useTodo();

    // Only show if modal is open AND type is "add"
    if (!modal.isOpen || modal.type !== "add") return null;

    // ---------------- FORM STATES ----------------
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("others");
    const [containerColor, setContainerColor] = useState("#ffffff");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Custom dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (modal.isOpen) {
            setTitle("");
            setDescription("");
            setCategory("others");
            setContainerColor("#ffffff");
            setErrorMsg(null);
            setIsDropdownOpen(false);
        }
    }, [modal.isOpen]);

    // ---------------- HANDLERS ----------------
    const handleClose = () => {
        if (!loading) closeModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setErrorMsg("Task title is required.");
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

    // ---------------- UI ----------------
    return (
        <div className="todo-modal-overlay" onMouseDown={handleClose}>
            <div
                className="todo-modal-card"
                onMouseDown={(e) => e.stopPropagation()}
            >

                {/* HEADER */}
                <div className="todo-modal-header">
                    <h3>Create Task</h3>
                    <button className="modal-x-btn" onClick={handleClose}>✕</button>
                </div>

                {/* ERROR */}
                {errorMsg && (
                    <div className="todo-modal-error">{errorMsg}</div>
                )}

                {/* FORM */}
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
                            placeholder="Add task details..."
                        />
                    </label>

                    {/* CATEGORY (CUSTOM DROPDOWN) */}
                    <div className="todo-field">
                        <span className="todo-label">Category</span>

                        <div
                            className={`todo-dropdown ${isDropdownOpen ? "open" : ""}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="todo-dropdown-selected">
                                {CATEGORY_LABELS[category]}
                            </span>
                            <div className="todo-dropdown-arrow">▾</div>

                            {isDropdownOpen && (
                                <div className="todo-dropdown-menu">
                                    {TASK_CATEGORIES.map((cat) => (
                                        <div
                                            key={cat}
                                            className="todo-dropdown-item"
                                            onClick={() => {
                                                setCategory(cat);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {CATEGORY_LABELS[cat]}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLOR PICKER */}
                    <label className="todo-field">
                        <span className="todo-label">Task Color</span>

                        <div className="todo-color-grid">
                            {TASK_COLOR_OPTIONS.map((c) => (
                                <div
                                    key={c.hex}
                                    className={`todo-color-option ${
                                        containerColor === c.hex ? "selected" : ""
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    onClick={() => setContainerColor(c.hex)}
                                />
                            ))}
                        </div>
                    </label>

                    {/* FOOTER */}
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
