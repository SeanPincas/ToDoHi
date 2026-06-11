import React from "react";
import {
    modalOverlayStyle,
} from "../../../styles/modalStyles";

import "./UserSettingsModal.css";
import "./modalBaseTheme.css";

interface Props {
    onClose: () => void;
}

const UserSettingsModal: React.FC<Props> = ({ onClose }) => {
    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div
                className="modal-card-base user-settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="user-settings-modal-header">
                    <h3>User Settings</h3>
                    <button
                        type="button"
                        className="user-settings-close-btn"
                        onClick={onClose}
                        aria-label="Close user settings"
                    >
                        Close
                    </button>
                </div>

                <p className="user-settings-modal-subtitle">
                    Static placeholder content for the upcoming user settings flow.
                </p>

                <div className="user-settings-modal-grid">
                    <div className="user-settings-modal-card">
                        <span className="user-settings-modal-label">Profile</span>
                        <p>Username, avatar, and account identity settings will live here.</p>
                    </div>

                    <div className="user-settings-modal-card">
                        <span className="user-settings-modal-label">Preferences</span>
                        <p>Theme, dashboard behavior, and personal display preferences will go here.</p>
                    </div>

                    <div className="user-settings-modal-card">
                        <span className="user-settings-modal-label">Notifications</span>
                        <p>Reminder and prompt-related user controls can be placed here later.</p>
                    </div>

                    <div className="user-settings-modal-card">
                        <span className="user-settings-modal-label">Security</span>
                        <p>Password, session, and account safety actions can be added in this section.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;
