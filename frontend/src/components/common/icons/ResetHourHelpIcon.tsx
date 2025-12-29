// ============================================================================
// ResetHourHelpIcon.tsx
// Small passive question icon for Reset Hour guide
// ============================================================================

import React from "react";
import "../../common/icons/ResetHourHelpIcon.css";

interface Props {
    onClick: () => void;
}

const ResetHourHelpIcon: React.FC<Props> = ({ onClick }) => {
    return (
        <button
            type="button"
            className="reset-hour-help-icon"
            aria-label="Reset Hour Guide"
            onClick={onClick}
        >
            ?
        </button>
    );
};

export default ResetHourHelpIcon;
