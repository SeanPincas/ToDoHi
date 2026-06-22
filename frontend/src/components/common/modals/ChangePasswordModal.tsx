import { useState } from "react";
import { Icons } from "../../../styles/iconLibrary";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { changeUserPassword } from "../../../api/userApi";

import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "./ChangePasswordModal.css";

interface Props {
    onClose: () => void;
    onSuccess?: (message: string) => void;
}

const ChangePasswordModal = ({ onClose, onSuccess }: Props) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setError("");
        setMessage("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please complete all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        setIsSaving(true);

        try {
            await changeUserPassword({ currentPassword, newPassword });
            const successMessage = "Password updated successfully.";
            setMessage(successMessage);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onSuccess?.(successMessage);
            window.setTimeout(() => {
                onClose();
            }, 250);
        } catch (error) {
            const nextMessage =
                error instanceof Error ? error.message : "Failed changing password.";
            setError(nextMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            style={modalOverlayStyle}
            className="change-password-overlay"
            onMouseDown={onClose}
        >
            <div
                className="modal-card-base task-management-modal paper-sheet-lines change-password-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="task-management-modal-header change-password-header">
                    <div className="task-management-modal-title-group">
                        <Icons.Lock />
                        <h3>Change Password</h3>
                    </div>

                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={onClose}
                        aria-label="Close change password modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                <p className="task-management-modal-subtitle change-password-subtitle">
                    Update your password here without changing the current account and preferences layout.
                </p>

                <div className="task-management-modal-panel change-password-panel">
                    <div className="change-password-field-block">
                        <label htmlFor="change-password-current">Current Password</label>
                        <div className="change-password-input-shell">
                            <input
                                id="change-password-current"
                                type={showCurrentPassword ? "text" : "password"}
                                className="change-password-input"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                placeholder="Current password"
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                onClick={() => setShowCurrentPassword((value) => !value)}
                            >
                                {showCurrentPassword ? (
                                    <Icons.HidePassword className="change-password-toggle-icon" />
                                ) : (
                                    <Icons.ShowPassword className="change-password-toggle-icon" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="change-password-field-block">
                        <label htmlFor="change-password-new">New Password</label>
                        <div className="change-password-input-shell">
                            <input
                                id="change-password-new"
                                type={showNewPassword ? "text" : "password"}
                                className="change-password-input"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="New password"
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                onClick={() => setShowNewPassword((value) => !value)}
                            >
                                {showNewPassword ? (
                                    <Icons.HidePassword className="change-password-toggle-icon" />
                                ) : (
                                    <Icons.ShowPassword className="change-password-toggle-icon" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="change-password-field-block">
                        <label htmlFor="change-password-confirm">Confirm Password</label>
                        <div className="change-password-input-shell">
                            <input
                                id="change-password-confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                className="change-password-input"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                onClick={() => setShowConfirmPassword((value) => !value)}
                            >
                                {showConfirmPassword ? (
                                    <Icons.HidePassword className="change-password-toggle-icon" />
                                ) : (
                                    <Icons.ShowPassword className="change-password-toggle-icon" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="user-settings-primary-btn user-settings-block-btn change-password-submit-btn"
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    <Icons.Confirm />
                    <span>{isSaving ? "Saving..." : "Confirm Change Password"}</span>
                </button>

                {error ? (
                    <p className="user-settings-feedback error">{error}</p>
                ) : null}
                {message ? (
                    <p className="user-settings-feedback success">{message}</p>
                ) : null}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
