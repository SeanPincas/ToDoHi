// ============================================================================
// MemoContext.tsx
// State authority for Memo Board feature
//
// OPTION A ARCHITECTURE:
// - Edit mode = frontend-only mutations
// - Dragging updates memory only
// - Z-index is derived from array order
// - Backend sync happens ONLY on explicit "Done" (future step)
// ============================================================================

import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getAllMemos,
    createMemo,
    createMemoFromTask,
    updateMemo,
    deleteMemo,
    type Memo
} from "../api/memoApi";

import {
    bringForward,
    sendBackward,
    bringToTop,
} from "../utils/memoUtils/memoZOrder";

// ------------------------------------ TYPES ------------------------------------

type BoardMode = "view" | "edit";

export type MemoModalType =
    | "add"
    | "edit"
    | "view"
    | "deleteConfirm"
    | null;

// ---------------- LAYOUT PAYLOAD ----------------
export interface MemoLayoutPayload {
    id: string;
    xPct: number;
    yPct: number;
    z: number;
}

interface MemoContextType {
    memos: Memo[];
    loading: boolean;
    boardMode: BoardMode;

    // ---------------- MODAL STATE ----------------
    activeModal: MemoModalType;

    // ---------------- SELECTION ----------------
    activeMemoId: string | null;
    setActiveMemoId: (id: string | null) => void;

    isMemoAtEdge: boolean;
    setIsMemoAtEdge: (value: boolean) => void;


    // ---------------- ACTIONS ----------------
    loadMemos: () => Promise<void>;
    addMemo: (data: Partial<Memo>) => Promise<void>;
    addMemoFromTask: (taskId: string, pinColor?: string) => Promise<void>;
    updateMemoContent: (id: string, data: Partial<Memo>) => Promise<void>;
    moveMemo: (id: string, xPct: number, yPct: number) => void;
    bringMemoForward: (id: string) => void;
    sendMemoBackward: (id: string) => void;
    bringMemoToTop: (id: string) => void;
    removeMemo: (id: string) => Promise<void>;

    buildLayoutPayload: () => MemoLayoutPayload[];

    // ---------------- MODAL ACTIONS ----------------
    openModal: (type: MemoModalType, memoId?: string | null) => void;
    closeModal: () => void;

    setBoardMode: (mode: BoardMode) => void;
}

// -------------------------------- CONTEXT ------------------------------------

const MemoContext = createContext<MemoContextType | null>(null);

export const useMemoContext = () => {
    const ctx = useContext(MemoContext);
    if (!ctx) {
        throw new Error("useMemoContext must be used within a MemoProvider");
    }
    return ctx;
};

// ====================================================================================
//                                   PROVIDER
// ====================================================================================

export const MemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(false);
    const [boardMode, setBoardMode] = useState<BoardMode>("view");

    // ---------------- MODAL STATE ----------------
    const [activeModal, setActiveModal] = useState<MemoModalType>(null);

    // ---------------- SELECTION ----------------
    const [activeMemoId, setActiveMemoId] = useState<string | null>(null);

    // ---------------- BOUNDARY STATE ----------------
    const [isMemoAtEdge, setIsMemoAtEdge] = useState(false);

    // -------------------------------------------------------------------------
    // LOAD MEMOS (BACKEND → FRONTEND)
    // -------------------------------------------------------------------------
    const loadMemos = async () => {
        setLoading(true);
        try {
            const data = await getAllMemos();

            /**
             * IMPORTANT:
             * We trust backend ordering on initial load.
             * Z-index will be derived from array order.
             */
            setMemos(data);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // CREATE MEMO
    // -------------------------------------------------------------------------
    const addMemo = async (data: Partial<Memo>) => {
        const memo = await createMemo(data);

        /**
         * New memo goes to the TOP visually.
         * Array order = stacking order.
         */
        setMemos(prev => [...prev, memo]);
    };

    const addMemoFromTask = async (taskId: string, pinColor?: string) => {
        const memo = await createMemoFromTask({ taskId, pinColor });
        setMemos(prev => [...prev, memo]);
    };

    // -------------------------------------------------------------------------
    // UPDATE MEMO CONTENT (NOT POSITION)
    // -------------------------------------------------------------------------
    const updateMemoContent = async (id: string, data: Partial<Memo>) => {
        const updated = await updateMemo(id, data);
        setMemos(prev =>
            prev.map(m => (m._id === id ? updated : m))
        );
    };

    // -------------------------------------------------------------------------
    // MOVE MEMO (FRONTEND ONLY)
    // -------------------------------------------------------------------------
    const moveMemo = (id: string, xPct: number, yPct: number) => {
        /**
         * FRONTEND-ONLY POSITION UPDATE
         * No backend calls here.
         */
        setMemos(prev =>
            prev.map(m =>
                m._id === id
                    ? {
                        ...m,
                        position: {
                            ...m.position,
                            xPct,
                            yPct
                        }
                    }
                    : m
            )
        );
    };

    // -------------------------------------------------------------------------
    // Z-ORDER (FRONTEND ONLY)
    // -------------------------------------------------------------------------

    const bringMemoForward = (id: string) => {
        setMemos(prev => bringForward(prev, id));
    };

    const sendMemoBackward = (id: string) => {
        setMemos(prev => sendBackward(prev, id));
    };

    const bringMemoToTop = (id: string) => {
        setMemos(prev => bringToTop(prev, id));
    };

    // -------------------------------------------------------------------------
    // BUILD FINAL BOARD LAYOUT PAYLOAD
    // -------------------------------------------------------------------------
    const buildLayoutPayload = (): MemoLayoutPayload[] => {
        /**
         * Array order IS z-order.
         * index === z
         */
        return memos.map((memo, index) => ({
            id: memo._id,
            xPct: memo.position.xPct,
            yPct: memo.position.yPct,
            z: index,
        }));
    };

    // -------------------------------------------------------------------------
    // DELETE MEMO
    // -------------------------------------------------------------------------
    const removeMemo = async (id: string) => {
        await deleteMemo(id);
        setMemos(prev => prev.filter(m => m._id !== id));
    };

    // -------------------------------------------------------------------------
    // MODAL CONTROL
    // -------------------------------------------------------------------------
    const openModal = (type: MemoModalType, memoId?: string | null) => {
        setActiveModal(type);
        setActiveMemoId(memoId ?? null);
    };

    const closeModal = () => {
        setActiveModal(null);
        setActiveMemoId(null);
    };

    // -------------------------------------------------------------------------
    // INITIAL LOAD
    // -------------------------------------------------------------------------
    useEffect(() => {
        loadMemos();
    }, []);

    // -------------------------------------------------------------------------
    // PROVIDER VALUE
    // -------------------------------------------------------------------------
    return (
        <MemoContext.Provider
            value={{
                memos,
                loading,
                boardMode,

                activeModal,

                activeMemoId,
                setActiveMemoId,

                isMemoAtEdge,
                setIsMemoAtEdge,


                loadMemos,
                addMemo,
                addMemoFromTask,
                updateMemoContent,
                moveMemo,
                bringMemoForward,
                sendMemoBackward,
                bringMemoToTop,
                removeMemo,

                buildLayoutPayload,

                openModal,
                closeModal,

                setBoardMode
            }}
        >
            {children}
        </MemoContext.Provider>
    );
};
