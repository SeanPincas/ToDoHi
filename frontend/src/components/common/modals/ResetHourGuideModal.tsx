// ============================================================================
// ResetHourGuideModal.tsx
// Explains how Reset Hour works (educational only)
// ============================================================================

import React from "react";
import {
    modalOverlayStyle,
    modalCardBaseStyle,
} from "../../../styles/modalStyles";

import "../../common/modals/ResetHourGuideModal.css";

interface Props {
    onClose: () => void;
}

const ResetHourGuideModal: React.FC<Props> = ({ onClose }) => {
    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div
                style={modalCardBaseStyle}
                className="reset-hour-guide"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>How Reset Hour Works</h3>
                <p>
                    <strong>Reset Hour</strong> defines when your day ends
                    and a new day begins.
                </p>
                <ul>
                    <li>It is <strong>not</strong> a task timer</li>
                    <li>It does <strong>not</strong> auto-delete tasks</li>
                    <li>It controls daily boundaries and statistics</li>
                </ul>
                <hr />
                <p>
                    <strong>Example:</strong><br />
                    If Reset Hour is set to <strong>10:00 PM</strong>:
                </p>
                <ul>
                    <li>Tasks create <strong>BEFORE</strong> 10:00 PM || 22:00 belong to today</li>
                    <li>Tasks create <strong>AFTER</strong> 10:00 PM || 22:00 belong to tomorrow</li>
                    <li>At 10:00 PM, the day resets; and</li>
                    <li>All Uncompleted Tasks will be <strong>marked as FAILED</strong></li>
                </ul>

                <p className="note">
                    💡 Changing Reset Hour will not retroactively fail tasks.
                </p>

                <div className="actions">
                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetHourGuideModal;
