// ============================================================================
// MemoCardBaseOverlay.tsx
// Enforces standard memo card shape and preview rules
// ============================================================================

import React from "react";
import "../styles/memoCardBase.css";

interface Props {
    containerColor: string;
    textColor: string;
    categoryEmoji: string;
    pinColor: string;
    title: string;
    previewText: string;
    zIndex: number;
    x: number;
    y: number;
    onClick?: () => void;
}

const MemoCardBaseOverlay: React.FC<Props> = ({
    containerColor,
    textColor,
    categoryEmoji,
    pinColor,
    title,
    previewText,
    zIndex,
    x,
    y,
    onClick
}) => {
    return (
        <div
            className="memo-card"
            style={{
                backgroundColor: containerColor,
                color: textColor,
                zIndex,
                transform: `translate(${x}px, ${y}px)`
            }}
            onClick={onClick}
        >
            <div className="memo-card-header">
                <span className="memo-card-category">
                    {categoryEmoji}
                </span>
                <span
                    className="memo-card-pin"
                    style={{ backgroundColor: pinColor }}
                />
            </div>

            <div>
                <div className="memo-card-title">{title}</div>
                <div className="memo-card-content">
                    {previewText}
                </div>
            </div>

            <div className="memo-card-footer">
                Memo
            </div>
        </div>
    );
};

export default MemoCardBaseOverlay;
