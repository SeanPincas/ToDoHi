import React, { useState } from "react";
import "./switchStyles.css";

interface SwitchProps {
    checked: boolean;                   // true = completed, false = pending
    disabled?: boolean;                 // disabled when task.status === "failed"
    disabledReason?: string;            // Task Status "failed" switch notification
    onToggle: () => void;               // callback
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    disabled = false,
    disabledReason,
    onToggle,
}) => {
    // message visibiliy
    const [showReason, setShowReason] = useState(false);

    const timeoutRef = React.useRef<number | null>(null);

    const handleClick = () => {
        if (disabled) {
            setShowReason(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Auto-hidde after 10 seconds
            timeoutRef.current = window.setTimeout(() => {
                setShowReason(false);
                timeoutRef.current = null;
            }, 10000);

            return
        }
            // Enabled -> normal Toggle
        onToggle();
    };

    return (
        <div className="switch-wrapper">
            <div
                className={`switch-container ${checked ? "active" : ""} ${disabled ? "disabled danger" : ""}
                `}
                onClick={handleClick}
            >
                {/* TRACK */}
                <div className="switch-track" />
                {/* HANDLE */}
                <div className="switch-handle" />
            </div>

            {/* DISABLED MESSAGE */}
            {disabled && showReason && disabledReason && (
                <div className="switch-tooltip">
                    {disabledReason}
                </div>
            )}
        </div>
    );
};