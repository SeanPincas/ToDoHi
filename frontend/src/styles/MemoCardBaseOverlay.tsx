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
    isAtEdge?: boolean,
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
    scrollableContent = false,
}) => {
    const resolvedContent = content || "No content";

    return (
        <div
            className={`memo-card-overlay 
                ${isActive ? "active" : ""}
                ${isAtEdge ? "edge-warning" : ""}
            `}
            style={{ backgroundColor: containerColor }}
        >

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
