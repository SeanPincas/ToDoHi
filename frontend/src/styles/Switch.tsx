import React from "react";
import "./switchStyles.css";

interface SwitchProps {
    checked: boolean;                 // true = completed, false = pending
    disabled?: boolean;               // disabled when task.status === "failed"
    onToggle: () => void;             // callback
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    disabled = false,
    onToggle,
}) => {
    return (
        <div
            className={`switch-container ${checked ? "on" : ""} ${disabled ? "disabled" : ""}`}
            onClick={() => {
                if (!disabled) onToggle();
            }}
        >
            <div className="switch-handle" />
        </div>
    );
};