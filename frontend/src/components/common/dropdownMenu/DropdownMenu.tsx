// ============================================================================
// DropdownMenu.tsx
// Reusable custom dropdown with scrollable menu (no layout push)
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Icons } from "../../../styles/iconLibrary";
import "./DropdownMenu.css";
import type { ReactNode } from "react";

// --------------------------- TYPES ---------------------------

export interface DropdownOption {
    value: string;
    label: string;
    iconKey?: keyof typeof Icons;
    swatch?: string;
}

interface DropdownMenuProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    maxHeight?: number; // px
    selectedValue?: string;
    menuClassName?: string;
    itemClassName?: string;
    renderValue?: (selected: DropdownOption | null) => ReactNode;
    renderOption?: (option: DropdownOption, isActive: boolean) => ReactNode;
}

// --------------------------- COMPONENT ---------------------------

const DropdownMenu = ({
    label,
    value,
    options,
    onChange,
    maxHeight = 140,
    selectedValue,
    menuClassName = "",
    itemClassName = "",
    renderValue,
    renderOption,
}: DropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const activeValue = selectedValue ?? value;
    const selectedOption = options.find((opt) => opt.value === activeValue) ?? null;

    // ------------------ CLOSE ON OUTSIDE CLICK ------------------
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --------------------------- RENDER ---------------------------
    return (
        <div className="dropdown-wrapper" ref={wrapperRef}>
            {label ? <label className="dropdown-label">{label}</label> : null}

            {/* ---------- CLOSED VIEW ---------- */}
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setOpen(!open)}
            >
                <span className="dropdown-trigger-value-wrap">
                    {renderValue ? renderValue(selectedOption) : <span className="dropdown-trigger-text">{value}</span>}
                </span>
                <Icons.DropdownArrow
                    className={`dropdown-arrow ${open ? "open" : ""}`}
                />
            </button>

            {/* ---------- OPEN MENU ---------- */}
            {open && (
                <div
                    className={`dropdown-menu ${menuClassName}`.trim()}
                    style={{ maxHeight: `${maxHeight}px` }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`dropdown-item ${
                                opt.value === activeValue ? "active" : ""
                            } ${itemClassName}`.trim()}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {renderOption ? renderOption(opt, opt.value === activeValue) : opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
