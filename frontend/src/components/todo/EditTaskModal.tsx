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
} from "../../styles/modalStyles";
import "../common/modals/modalBaseTheme.css";
import "../common/modals/taskManagementModalTheme.css";

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
                className="modal-card-base edit-modal-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="edit-header task-management-modal-header">
                    <div className="task-management-modal-title-group edit-title-group">
                        <Icons.Edit />
                        <h3>Edit Task</h3>
                    </div>
                    <button
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleCancel}
                        aria-label="Close edit task modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* TITLE */}
                <label className="edit-field edit-field-panel task-management-modal-panel">
                    <span className="edit-label">Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task Title"
                    />
                </label>

                {/* DESCRIPTION */}
                <label className="edit-field edit-field-panel task-management-modal-panel">
                    <span className="edit-label">Description</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Task Description..."
                        rows={4}
                    />
                </label>

                {/* CATEGORY */}
                <div className="edit-field edit-field-panel task-management-modal-panel">
                    <DropdownMenu
                        label="Category"
                        value={safeCategoryLabel(category)}
                        options={getCategoryOptions()}
                        onChange={setCategory}
                    />
                </div>

                {/* STATUS */}
                <div className="edit-field edit-field-panel task-management-modal-panel">
                    <DropdownMenu
                        label="Status"
                        value={safeStatusLabel(status)}
                        options={getStatusOptions({ excludeFailed: true })}
                        onChange={setStatus}
                    />
                </div>

                {/* CONTAINER COLOR */}
                <div className="edit-field edit-field-panel task-management-modal-panel">
                    <span className="edit-label">Task Color</span>
                    <div className="edit-color-grid">
                        {getContainerColors().map((c) => (
                            <div
                                key={c.hex}
                                className={`edit-color-option ${
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
                    <button className="btn-secondary-rect edit-action-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary-rect edit-action-btn edit-save-btn"
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
