// ============================================================================
// MemoCardBaseOverlay.tsx
// ============================================================================

import "./MemoCardBaseOverlay.css";

interface MemoCardBaseOverlayProps {
    title: string;
    content?: string;
    categoryEmoji?: string;
    containerColor: string;
    pinColor: string;
    isActive?: boolean;
}

const MemoCardBaseOverlay: React.FC<MemoCardBaseOverlayProps> = ({
    title,
    content,
    categoryEmoji,
    containerColor,
    pinColor,
    isActive = false,
}) => {
    return (
        <div
            className={`memo-card-overlay ${isActive ? "active" : ""}`}
            style={{ backgroundColor: containerColor }}
        >

            {/* ---------------- PIN ---------------- */}
            <div
                className="memo-pin"
                style={{ backgroundColor: pinColor }}
            />

            {/* ---------------- CONTENT ---------------- */}
            <div className="memo-card-paper">
                <div className="memo-header">
                    <h4 className="memo-title">
                        {title}
                    </h4>
                    {categoryEmoji && (
                        <span className="memo-category">
                            {categoryEmoji}
                        </span>
                    )}
                </div>
                <p className="memo-content">
                    {content || "No content"}
                </p>

            </div>
        </div>
    );
};

export default MemoCardBaseOverlay;