// ============================================================================
// DraggableMemoItem.tsx
// Single draggable memo card (2D free movement)
// ============================================================================

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Memo } from "../../api/memoApi";
import { getMemoCategoryEmoji } from "../../utils/memoUtils";
import MemoCardBaseOverlay from '../../styles/MemoCardBaseOverlay';
import { useMemoContext } from '../../context/MemoContext';

// ------------------------------ TYPES ---------------------------------------
interface DraggableMemoItemProps {
    memo: Memo;
    isEditMode: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const DraggableMemoItem: React.FC<DraggableMemoItemProps> = ({
    memo,
    isEditMode
}) => {

    const { activeMemoId, setActiveMemoId } = useMemoContext();

    // DND-KIT HOOK
    /**
     * useDraggable gives us:
     * - setNodeRef → attach to DOM
     * - listeners  → mouse / touch events
     * - attributes → accessibility props
     * - transform  → delta movement { x, y }
     */
    const {
        setNodeRef,
        listeners,
        attributes,
        transform,
    } = useDraggable({
        id: memo._id,
    });

    // ------------------------------------------------------------------------
    // POSITION CALCULATION
    // ------------------------------------------------------------------------
    /**
     * Memo position is stored persistently in DB as:
     * memo.position.x
     * memo.position.y
     *
     * During drag, DnD gives us a TEMPORARY delta.
     * Final render position = stored position + delta.
     */
    const style: React.CSSProperties = {
        position: "absolute",
        left: memo.position.x,
        top: memo.position.y,
        zIndex: memo.position.z,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div
            ref={setNodeRef}
            style={style}

            {...(isEditMode ? listeners : {})}
            {...(isEditMode ? attributes : {})}

            onMouseDown={() => setActiveMemoId(memo._id)}
        >
            {/* VISUAL CARD */}
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