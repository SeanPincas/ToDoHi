// ============================================================================
// MemoCardBaseOverlay.tsx
// ============================================================================

import "./MemoCardBaseOverlay.css";
import type { ReactNode } from "react";

interface MemoCardBaseOverlayProps {
    title: string;
    content?: string;
    categoryIcon?: ReactNode;
    containerColor: string;
    pinColor: string;
    isActive?: boolean;
    isAtEdge?: boolean;
    isDeleteSelected?: boolean;
    scrollableContent?: boolean;
}

const MemoCardBaseOverlay: React.FC<MemoCardBaseOverlayProps> = ({
    title,
    content,
    categoryIcon,
    containerColor,
    pinColor,
    isActive = false,
    isAtEdge = false,
    isDeleteSelected = false,
    scrollableContent = false,
}) => {
    const resolvedContent = content || "No content";

    return (
        <div
            className={`memo-card-overlay 
                ${isActive ? "active" : ""}
                ${isDeleteSelected ? "delete-selected" : ""}
                ${isAtEdge ? "edge-warning" : ""}
            `}
            style={{ backgroundColor: containerColor }}
        >
            {isDeleteSelected && (
                <div className="memo-delete-overlay" aria-hidden="true">
                    <div className="memo-delete-overlay-icon">+</div>
                </div>
            )}

            {/* ---------------- PIN ---------------- */}
            <div
                className="memo-pin"
                style={{ backgroundColor: pinColor }}
            />

            {/* ---------------- CONTENT ---------------- */}
            <div className={`memo-card-paper ${scrollableContent ? "scrollable" : ""}`}>
                <div className="memo-header">
                    <h4 className="memo-title">
                        {title}
                    </h4>
                    {categoryIcon && (
                        <span className="memo-category">
                            {categoryIcon}
                        </span>
                    )}
                </div>
                <p className={`memo-content ${scrollableContent ? "scrollable" : ""}`}>
                    {resolvedContent}
                </p>

            </div>
        </div>
    );
};

export default MemoCardBaseOverlay;
