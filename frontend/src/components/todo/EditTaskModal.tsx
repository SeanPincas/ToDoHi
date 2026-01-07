// ============================================================================
//                         EDIT TASK MODAL
// ============================================================================
import "./EditTaskModal.css";
import { useEffect, useState } from "react";
import { useTodo } from "../../context/TodoContext";

import { Icons } from "../../styles/iconLibrary";
import "../../styles/ButtonStyles.css";
import {
    modalOverlayStyle,
    modalCardBaseStyle,
} from "../../styles/modalStyles";

import { DropdownMenu } from "../common/dropdownMenu";

// Utilities
import {
    getCategoryOptions,
    getStatusOptions,
    getContainerColors,
    safeCategoryLabel,
    safeContainerColor,
    safeStatusLabel,

} from "../../utils/taskUtils";

const EditTaskModal = () => {
    const { modal, updateTask, openModal, closeModal } = useTodo();

    // ====================== EXTRACT DATA FIRST ======================
    const task = modal?.data?.task ?? null;
    const returnTo = modal?.data?.returnTo ?? null;

    // ====================== HOOKS LOCAL FORM STATE ======================
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("others");
    const [status, setStatus] = useState("pending");
    const [containerColor, setContainerColor] = useState("#ffffff")
    const [saving, setSaving] = useState(false);

    // ====================== HOOKS LOCAL FORM STATE ======================
    useEffect(() => {
        if (!task) return;

        setTitle(task.title ?? "");
        setDescription(task.description ?? "");
        setCategory(task.category ?? "others");
        setStatus(task.status ?? "pending");
        setContainerColor(safeContainerColor(task.containerColor))
    }, [task]);

    // ====================== GUARDS AFTER HOOK ======================
    if (!modal.isOpen || modal.type !== "edit") return null;

    // ====================== SAVE HANDLER ======================
    const handleSave = async () => {
        if (!title.trim()) return;

        setSaving(true);

        try {
            await updateTask(task._id, {
                title: title.trim(),
                description: description.trim(),
                category,
                status,
                containerColor,
            });

            // Return to View Modal with Updated Data
            if (returnTo === "view") {
                openModal("view", {
                    ...task,
                    title: title.trim(),
                    description,
                    category,
                    status,
                    containerColor,
                });
            } else {
                closeModal();
            }
        } catch (err) {
            console.error("[EditTaskModal] Failed to Update Task: ", err)
        } finally {
            setSaving(false)
        }
    };

    // ====================== CANCEL ======================
    const handleCancel = () => {
        if (returnTo === "view") {
            openModal("view", task);
        } else {
            closeModal();
        }
    };

    // ====================== RENDER ======================
    return (
        <div
            style={modalOverlayStyle}
            className="edit-modal-overlay"
            onMouseDown={handleCancel}
        >
            <div
                style={modalCardBaseStyle}
                className="edit-modal-card"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="edit-header">
                    <h2>Edit Task</h2>
                    <button className="icon-btn-square" onClick={handleCancel}>
                        <Icons.Close />
                    </button>
                </div>

                {/* TITLE */}
                <div className="edit-field">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task Title"
                    />
                </div>

                {/* DESCRIPTION */}
                <div className="edit-field">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Task Description..."
                        rows={4}
                    />
                </div>

                {/* CATEGORY */}
                <div className="edit-field">
                    <DropdownMenu
                        label="Category"
                        value={safeCategoryLabel(category)}
                        options={getCategoryOptions()}
                        onChange={setCategory}
                    />
                </div>

                {/* STATUS */}
                <div className="edit-field">
                    <DropdownMenu
                        label="Status"
                        value={safeStatusLabel(status)}
                        options={getStatusOptions()}
                        onChange={setStatus}
                    />
                </div>

                {/* CONTAINER COLOR */}
                <div className="todo-field">
                    <span className="todo-label">Task Color</span>
                    <div className="todo-color-grid">
                        {getContainerColors().map((c) => (
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
                </div>

                {/* ACTIONS */}
                <div className="edit-actions">
                    <button className="btn-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;