// ============================================================================
// DraggableMemoItem.tsx
// Single draggable memo card (frontend-only, pin-centered positioning)
// ============================================================================

import React from "react";
import { useDraggable } from "@dnd-kit/core";

import type { Memo } from "../../api/memoApi";
import { getMemoCategoryIconKey } from "../../utils/memoUtils/memoUtils";
import MemoCardBaseOverlay from "../../styles/MemoCardBaseOverlay";
import { useMemoContext } from "../../context/MemoContext";
import { clampPinTransform } from "../../utils/memoUtils/clampPinTransform";
import { Icons } from "../../styles/iconLibrary";

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
    const {
        activeMemoId,
        setActiveMemoId,
        setIsMemoAtEdge,
        boardMode,
        openModal
    } = useMemoContext();

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
    // LIVE DRAG CLAMP (PIN-BASED, FRONTEND ONLY)
    // ------------------------------------------------------------------------
    let clampedTransform = transform;
    let isAtEdge = false;

    if (transform) {
        const result = clampPinTransform({
            transformX: transform.x,
            transformY: transform.y,
            pinX,
            pinY,
            boardWidth,
            boardHeight,
        });

        clampedTransform = result.transform;
        isAtEdge = result.isClamped;
    }

    React.useEffect(() => {
        if (!isEditMode) return;
        setIsMemoAtEdge(isAtEdge);
    }, [isAtEdge, isEditMode, setIsMemoAtEdge]);

    // ------------------------------------------------------------------------
    // STYLE
    // ------------------------------------------------------------------------
    const style: React.CSSProperties = {
        position: "absolute",
        left: leftPx,
        top: topPx,
        zIndex,
        transform: clampedTransform
            ? `translate3d(${clampedTransform.x}px, ${clampedTransform.y}px, 0)`
            : undefined,
    };

    // -----------------------------------------------------------------------------
    // CLICK → OPEN VIEW MEMO MODAL (VIEW MODE ONLY)
    // -----------------------------------------------------------------------------
    const handleMemoClick = () => {
        // Edit mode is reserved for dragging / repositioning.
        if (boardMode !== "view") return;

        openModal("view", memo._id);
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------
    const CategoryIcon = Icons[getMemoCategoryIconKey(memo.category)];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditMode ? listeners : {})}
            {...(isEditMode ? attributes : {})}
            onClick={handleMemoClick}
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
                categoryIcon={<CategoryIcon />}
                containerColor={memo.containerColor}
                pinColor={memo.pinColor}
                isActive={activeMemoId === memo._id}
                isAtEdge={isEditMode && isAtEdge}
            />
        </div>
    );
};

export default DraggableMemoItem;
