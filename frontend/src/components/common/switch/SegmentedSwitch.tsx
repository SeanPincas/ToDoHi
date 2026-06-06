import React from "react";
import "./switchStyles.css";

export interface SegmentedSwitchOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedSwitchProps<T extends string> {
    value: T;
    options: SegmentedSwitchOption<T>[];
    onChange: (value: T) => void;
    className?: string;
}

export const SegmentedSwitch = <T extends string>({
    value,
    options,
    onChange,
    className = "",
}: SegmentedSwitchProps<T>) => {
    return (
        <div className={`segmented-switch ${className}`.trim()} role="tablist" aria-label="Segmented switch">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={value === opt.value}
                    className={`segmented-switch-btn ${value === opt.value ? "active" : ""}`}
                    onClick={() => onChange(opt.value)}
                >
                    <span className="segmented-switch-btn-label">{opt.label}</span>
                </button>
            ))}
        </div>
    );
};
