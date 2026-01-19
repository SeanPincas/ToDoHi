// ============================================================================
// DraggableMemoItem.tsx
// Single draggable memo card (frontend-only, pin-centered positioning)
// ============================================================================

import React from "react";
import { useDraggable } from "@dnd-kit/core";

import type { Memo } from "../../api/memoApi";
import { getMemoCategoryEmoji } from "../../utils/memoUtils";
import MemoCardBaseOverlay from "../../styles/MemoCardBaseOverlay";
import { useMemoContext } from "../../context/MemoContext";

// ------------------------------ TYPES ---------------------------------------
interface DraggableMemoItemProps {
    memo: Memo;
    zIndex: number;
    isEditMode: boolean;
    boardWidth: number;
    boardHeight: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const DraggableMemoItem: React.FC<DraggableMemoItemProps> = ({
    memo,
    zIndex,
    isEditMode,
    boardWidth,
    boardHeight,
}) => {
    const { activeMemoId, setActiveMemoId } = useMemoContext();

    // ------------------------------------------------------------------------
    // DND-KIT HOOK
    // ------------------------------------------------------------------------
    const {
        setNodeRef,
        listeners,
        attributes,
        transform,
    } = useDraggable({
        id: memo._id,
    });

    // ------------------------------------------------------------------------
    // PIN-CENTER OFFSETS (MUST MATCH CSS)
    // ------------------------------------------------------------------------
    // Memo card width from CSS
    const CARD_WIDTH = 220;

    // Pin styles from `.memo-pin`
    const PIN_RADIUS = 7;      // 14px / 2
    const PIN_TOP_OFFSET = 5;  // top: 5px

    // Pin center relative to card top-left
    const PIN_OFFSET_X = CARD_WIDTH / 2;
    const PIN_OFFSET_Y = PIN_TOP_OFFSET + PIN_RADIUS;

    // ------------------------------------------------------------------------
    // POSITION CALCULATION (PIN IS SOURCE OF TRUTH)
    // ------------------------------------------------------------------------
    // Stored xPct / yPct represent the PIN CENTER on the board
    const pinX = (memo.position.xPct / 100) * boardWidth;
    const pinY = (memo.position.yPct / 100) * boardHeight;

    // Convert pin-center → card top-left
    const leftPx = pinX - PIN_OFFSET_X;
    const topPx = pinY - PIN_OFFSET_Y;

    // ------------------------------------------------------------------------
    // STYLE
    // ------------------------------------------------------------------------
    const style: React.CSSProperties = {
        position: "absolute",
        left: leftPx,
        top: topPx,
        zIndex,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditMode ? listeners : {})}
            {...(isEditMode ? attributes : {})}
            onMouseDown={(e) => {
                // UI-only selection (no backend intent)
                if (!isEditMode) return;
                if (e.button !== 0) return; // left-click only
                setActiveMemoId(memo._id);
            }}
        >
            <MemoCardBaseOverlay
                title={memo.title}
                content={memo.content}
                categoryEmoji={getMemoCategoryEmoji(memo.category)}
                containerColor={memo.containerColor}
                pinColor={memo.pinColor}
                isActive={activeMemoId === memo._id}
            />
        </div>
    );
};

export default DraggableMemoItem;
