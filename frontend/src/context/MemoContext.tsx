// ============================================================================
// MemoContext.tsx
// State authority for Memo Board feature
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
    updateMemoPosition,
    bringMemoToFront,
    sendMemoToBack,
    deleteMemo,
    type Memo
} from "../api/memoApi";


// ------------------------------------ TYPES ------------------------------------
type BoardMode = "view" | "edit";

interface MemoContextType {
    memos: Memo[];
    loading: boolean;
    boardMode: BoardMode;

    // actions
    loadMemos: () => Promise<void>;
    addMemo: (data: Partial<Memo>) => Promise<void>;
    addMemoFromTask: (taskId: string, pinColor?: string) => Promise<void>;
    updateMemoContent: (id: string, data: Partial<Memo>) => Promise<void>;
    moveMemo: (id: string, x: number, y: number) => Promise<void>;
    bringMemoForward: (id: string) => Promise<void>;
    sendMemoBackward: (id: string) => Promise<void>;
    removeMemo: (id: string) => Promise<void>;

    setBoardMode: (mode: BoardMode) => void;
}

// -------------------------------- CONTEXT CREATION -------------------------------
const MemoContext = createContext<MemoContextType | null>(null);

// ------------------------------ CUSTOM HOOK ----------------------------------------
export const useMemoContext = () => {
    const ctx = useContext(MemoContext);
    if (!ctx) {
        throw new Error("useMemoContext must be used within a MemoProvider");
    }
    return ctx;
};

// ====================================================================================
//                                   PROVIDER START                                    
// ====================================================================================
export const MemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [boardMode, setBoardMode] = useState<BoardMode>("view");

    // -------------------------------------------------------------------------
    //                              LOAD ALL MEMOS
    // -------------------------------------------------------------------------
    const loadMemos = async () => {
        setLoading(true);
        try {
            const data = await getAllMemos();
            setMemos(data);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    //                            CREATE MEMO (MANUAL)
    // -------------------------------------------------------------------------
    const addMemo = async (data: Partial<Memo>) => {
        const memo = await createMemo(data);
        setMemos(prev => [...prev, memo]);
    };

    // -------------------------------------------------------------------------
    //                           CREATE MEMO FROM TASK
    // -------------------------------------------------------------------------
    const addMemoFromTask = async (taskId: string, pinColor?: string) => {
        const memo = await createMemoFromTask({ taskId, pinColor });
        setMemos(prev => [...prev, memo]);
    };

    // -------------------------------------------------------------------------
    //                             UPDATE MEMO CONTENT
    // -------------------------------------------------------------------------
    const updateMemoContent = async (id: string, data: Partial<Memo>) => {
        const updated = await updateMemo(id, data);
        setMemos(prev =>
            prev.map(m => (m._id === id ? updated : m))
        );
    };

    // -------------------------------------------------------------------------
    //                       MOVE MEMO (DRAGGING X/Y ONLY)
    // -------------------------------------------------------------------------
    const moveMemo = async (id: string, x: number, y: number) => {
        const updated = await updateMemoPosition(id, { x, y });
        setMemos(prev =>
            prev.map(m => (m._id === id ? updated : m))
        );
    };

    // -------------------------------------------------------------------------
    //                              STACKING INTENT
    // -------------------------------------------------------------------------
    const bringMemoForward = async (id: string) => {
        const updated = await bringMemoToFront(id);
        setMemos(prev =>
            prev.map(m => (m._id === id ? updated : m))
        );
    };

    const sendMemoBackward = async (id: string) => {
        const updated = await sendMemoToBack(id);
        setMemos(prev =>
            prev.map(m => (m._id === id ? updated : m))
        );
    };

    // -------------------------------------------------------------------------
    //                                DELETE MEMO
    // -------------------------------------------------------------------------
    const removeMemo = async (id: string) => {
        await deleteMemo(id);
        setMemos(prev => prev.filter(m => m._id !== id));
    };

    // -------------------------------------------------------------------------
    //                               INITIAL LOAD
    // -------------------------------------------------------------------------
    useEffect(() => {
        loadMemos();
    }, []);

    // -------------------------------------------------------------------------
    //                              PROVIDER VALUE
    // -------------------------------------------------------------------------
    return (
        <MemoContext.Provider
            value={{
                memos,
                loading,
                boardMode,

                loadMemos,
                addMemo,
                addMemoFromTask,
                updateMemoContent,
                moveMemo,
                bringMemoForward,
                sendMemoBackward,
                removeMemo,

                setBoardMode
            }}
        >
            {children}
        </MemoContext.Provider>
    );
};