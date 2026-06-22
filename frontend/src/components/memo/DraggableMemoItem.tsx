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
    isDeleteMode?: boolean;
    isDeleteSelected?: boolean;
    onDeleteModeSelect?: (memoId: string) => void;
    boardWidth: number;
    boardHeight: number;
    boundaryPadding: number;
}

// ============================================================================
// COMPONENT
// ============================================================================
const DraggableMemoItem: React.FC<DraggableMemoItemProps> = ({
    memo,
    zIndex,
    isEditMode,
    isDeleteMode = false,
    isDeleteSelected = false,
    onDeleteModeSelect,
    boardWidth,
    boardHeight,
    boundaryPadding,
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

    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const [pinOffsets, setPinOffsets] = React.useState({
        x: 110,
        y: 12,
    });

    // ------------------------------------------------------------------------
    // PIN-CENTER OFFSETS (MUST MATCH CSS)
    // ------------------------------------------------------------------------
    React.useLayoutEffect(() => {
        if (!wrapperRef.current) return;

        const measureOffsets = () => {
            const overlay = wrapperRef.current?.querySelector(".memo-card-overlay") as HTMLElement | null;
            const pin = wrapperRef.current?.querySelector(".memo-pin") as HTMLElement | null;

            if (!overlay || !pin) return;

            const overlayRect = overlay.getBoundingClientRect();
            const pinRect = pin.getBoundingClientRect();

            setPinOffsets({
                x: (pinRect.left - overlayRect.left) + (pinRect.width / 2),
                y: (pinRect.top - overlayRect.top) + (pinRect.height / 2),
            });
        };

        measureOffsets();

        const overlay = wrapperRef.current.querySelector(".memo-card-overlay") as HTMLElement | null;
        if (!overlay) return;

        const resizeObserver = new ResizeObserver(measureOffsets);
        resizeObserver.observe(overlay);
        window.addEventListener("resize", measureOffsets);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", measureOffsets);
        };
    }, []);

    // ------------------------------------------------------------------------
    // POSITION CALCULATION (PIN IS SOURCE OF TRUTH)
    // ------------------------------------------------------------------------
    // Stored xPct / yPct represent the PIN CENTER on the board
    const pinX = (memo.position.xPct / 100) * boardWidth;
    const pinY = (memo.position.yPct / 100) * boardHeight;

    // Convert pin-center → card top-left
    const leftPx = pinX - pinOffsets.x;
    const topPx = pinY - pinOffsets.y;

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
            boundaryPadding,
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
        if (isDeleteMode) {
            onDeleteModeSelect?.(memo._id);
            return;
        }

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
            ref={(node) => {
                wrapperRef.current = node;
                setNodeRef(node);
            }}
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
                isActive={!isDeleteMode && activeMemoId === memo._id}
                isDeleteSelected={isDeleteSelected}
                isAtEdge={isEditMode && isAtEdge}
            />
        </div>
    );
};

export default DraggableMemoItem;
