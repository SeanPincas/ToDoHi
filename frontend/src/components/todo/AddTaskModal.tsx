// ============================================================================
// AddTaskModal.tsx
// Modal for creating a new Task in the Todo system.
//
// PURPOSE:
// - Opens when TodoContext.modal.type === "add"
// - Allows the user to input Title, Description, Category, and Task Color
// - Uses a **custom dropdown menu** instead of <select>
// - No "deadline" because your system uses user's resetHour instead
// - Calls addTask() from TodoContext to create the task in backend
// ============================================================================

import React, { useState, useEffect } from "react";
import { useTodo } from "../../context/TodoContext";

import {
    TASK_CATEGORIES,
    CATEGORY_LABELS,
    TASK_COLOR_OPTIONS,
} from "../../utils/taskUtils";

import "./AddTaskModal.css";

const AddTaskModal: React.FC = () => {

    // ----------------------------------------------------------------------
    // ACCESS GLOBAL MODAL + TODO ACTIONS
    // modal  → tells which modal is open
    // closeModal → hides modal
    // addTask → creates task + updates state
    // ----------------------------------------------------------------------
    const { modal, closeModal, addTask } = useTodo();

    // FORM FIELDS
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("others");
    const [containerColor, setContainerColor] = useState("#ffffff");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

    // ----------------------------------------------------------------------
    // RESET FORM EVERY TIME the modal opens
    // Ensures old values from last task do not persist.
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (modal.isOpen) {
            setTitle("");
            setDescription("");
            setCategory("others");
            setContainerColor("#ffffff");
            setIsCatDropdownOpen(false);
            setErrorMsg(null);
        }
    }, [modal.isOpen]);

    
    // Render NOTHING if this modal is not the "add task" modal
    if (!modal.isOpen || modal.type !== "add") return null;

    // ----------------------------------------------------------------------
    // CLOSE MODAL (disabled while loading)
    // ----------------------------------------------------------------------
    const handleClose = () => {
        if (!loading) closeModal();
    };

    // ----------------------------------------------------------------------
    // SUBMIT HANDLER — Called when user clicks Create Task
    //
    // VALIDATES title
    // CREATES payload object matching backend model
    // CALLS addTask() from TodoContext
    // CLOSES modal afterward
    // ----------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ❗ Title is required
        if (!title.trim()) {
            setErrorMsg("Task Title is required.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        // Payload must match backend TaskController fields
        const payload = {
            title: title.trim(),
            description: description.trim(),
            category,
            containerColor,
        };

        try {
            await addTask(payload);     // create in backend
            closeModal();               // close modal afterwards
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Failed to create task.");
        }

        setLoading(false);
    };

    // ======================================================================
    //                              UI RENDER
    // ======================================================================
    return (
        <div className="todo-modal-overlay" onMouseDown={handleClose}>
            {/* Prevent clicking inside modal from closing it */}
            <div
                className="todo-modal-card"
                onMouseDown={(e) => e.stopPropagation()}
            >

                {/* --------------------------------------------------------- */}
                {/* HEADER */}
                {/* --------------------------------------------------------- */}
                <div className="todo-modal-header">
                    <h3>Create Task</h3>

                    {/* X Button to close modal */}
                    <button className="modal-x-btn" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                {/* --------------------------------------------------------- */}
                {/* ERROR MESSAGE */}
                {/* --------------------------------------------------------- */}
                {errorMsg && <div className="todo-modal-error">{errorMsg}</div>}

                {/* --------------------------------------------------------- */}
                {/* FORM START */}
                {/* --------------------------------------------------------- */}
                <form className="todo-modal-form" onSubmit={handleSubmit}>

                    {/* TITLE FIELD */}
                    <label className="todo-field">
                        <span className="todo-label">Title *</span>

                        <input
                            className="todo-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task name"
                        />
                    </label>

                    {/* DESCRIPTION FIELD */}
                    <label className="todo-field">
                        <span className="todo-label">Description</span>

                        <textarea
                            className="todo-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description details (optional)"
                        />
                    </label>

                    {/* ----------------------------------------------------- */}
                    {/* CUSTOM CATEGORY DROPDOWN (instead of <select>)        */}
                    {/* ----------------------------------------------------- */}
                    <label className="todo-field">
                        <span className="todo-label">Category</span>

                        {/* Dropdown container */}
                        <div
                            className={`todo-dropdown ${isCatDropdownOpen ? "open" : ""}`}
                            onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        >
                            {/* Current selected category label */}
                            <span className="todo-dropdown-selected">
                                {CATEGORY_LABELS[category]}
                            </span>

                            {/* Arrow indicator */}
                            <span className="todo-dropdown-arrow">▼</span>

                            {/* Dropdown menu list */}
                            {isCatDropdownOpen && (
                                <div className="todo-dropdown-menu">
                                    {TASK_CATEGORIES.map((cat) => (
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

                    {/* ----------------------------------------------------- */}
                    {/* COLOR PICKER GRID                                     */}
                    {/* ----------------------------------------------------- */}
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

                    {/* ----------------------------------------------------- */}
                    {/* FOOTER BUTTONS (Cancel + Create Task)                 */}
                    {/* ----------------------------------------------------- */}
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
