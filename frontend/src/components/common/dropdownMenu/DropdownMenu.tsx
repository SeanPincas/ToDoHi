// ============================================================================
// DropdownMenu.tsx
// Reusable custom dropdown with scrollable menu (no layout push)
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Icons } from "../../../styles/iconLibrary";
import "./DropdownMenu.css";

// --------------------------- TYPES ---------------------------

export interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownMenuProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    maxHeight?: number; // px
}

// --------------------------- COMPONENT ---------------------------

const DropdownMenu = ({
    label,
    value,
    options,
    onChange,
    maxHeight = 140,
}: DropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

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
            <label className="dropdown-label">{label}</label>

            {/* ---------- CLOSED VIEW ---------- */}
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setOpen(!open)}
            >
                <span>{value}</span>
                <Icons.DropdownArrow
                    className={`dropdown-arrow ${open ? "open" : ""}`}
                />
            </button>

            {/* ---------- OPEN MENU ---------- */}
            {open && (
                <div
                    className="dropdown-menu"
                    style={{ maxHeight: `${maxHeight}px` }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`dropdown-item ${
                                opt.value === value ? "active" : ""
                            }`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
