//                                         TODO CONTEXT (GLOBAL STORE)
// =====================================================================================================
// This file controls ALL logic for Tasks/Todo feature:
// - Fetch tasks from backend
// - Add/update/delete tasks
// - Drag & Drop reordering
// - Filtering (All, Today, Completed, Failed)
// - MODALS (Add / Edit / View / DeleteConfirm)
// =====================================================================================================

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Task } from "../api/taskApi.ts";

import {
    getAllTasks,
    createTask,
    updateTask as apiUpdateTask,
    deleteTask as apiDeleteTask,
    reorderTaskPositions
} from "../api/taskApi.ts";

// ------------------------------ MODAL TYPES --------------------------------------
export type ModalType = "add" | "edit" | "view" | "deleteConfirm";

// What the modal state looks like
interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    data?: any; // can hold task object for view/edit/delete
}

// ------------------------------ CONTEXT TYPE --------------------------------------
interface TodoContextType {
    tasks: Task[];
    todayTasks: Task[];
    loading: boolean;

    // CRUD
    fetchTasks: () => Promise<void>;
    addTask: (data: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;

    // Drag & Drop reorder
    reorderTasks: (orderedList: Task[]) => Promise<void>;

    // Filters
    filterAll: Task[];
    filterPending: Task[];
    filterCompleted: Task[];
    filterFailed: Task[];

    // MODALS
    modal: ModalState;
    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;
}

// ------------------------------ CREATE CONTEXT -------------------------------------
const TodoContext = createContext<TodoContextType | null>(null);

// ------------------------------ CUSTOM HOOK ----------------------------------------
export const useTodo = () => {
    const ctx = useContext(TodoContext);
    if (!ctx) throw new Error("useTodo must be used inside <TodoProvider>");
    return ctx;
};

// ====================================================================================
//                                   PROVIDER START                                    
// ====================================================================================
export const TodoProvider = ({ children }: { children: ReactNode }) => {

    // =================================================================================================
    //                                       REACT STATES
    // =================================================================================================
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // -------------------------- MODAL STATE --------------------------
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        type: null,
        data: null
    });

    // =================================================================================================
    //                                       MODAL CONTROL
    // =================================================================================================

    const openModal = (type: ModalType, data: any = null) => {
        setModal({
            isOpen: true,
            type,
            data
        });
    };

    const closeModal = () => {
        setModal({
            isOpen: false,
            type: null,
            data: null
        });
    };

    // =================================================================================================
    //                                      FETCH TASKS FROM BACKEND
    // =================================================================================================
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await getAllTasks();

            const sorted = data.sort((a, b) => a.orderIndex - b.orderIndex);

            setTasks(sorted);
        } catch (error) {
            console.error("[TodoContext] Error Fetching Tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // =================================================================================================
    //                                   FILTERING LOGIC
    // =================================================================================================
    const todayString = new Date().toISOString().split("T")[0];

    const todayTasks = tasks.filter(t => {
        const deadline = t.deadline ? t.deadline.split("T")[0] : null;
        return deadline === todayString || t.status === "pending";
    });

    const filterAll = tasks;
    const filterPending = tasks.filter(t => t.status === "pending");
    const filterCompleted = tasks.filter(t => t.status === "completed");
    const filterFailed = tasks.filter(t => t.status === "failed" || t.isExpired);

    // =================================================================================================
    //                                   ADD NEW TASK
    // =================================================================================================
    const addTask = async (data: Partial<Task>) => {
        try {
            const newTask = await createTask(data);

            setTasks(prev =>
                [...prev, newTask].sort((a, b) => a.orderIndex - b.orderIndex)
            );
        } catch (error) {
            console.error("[TodoContext] Error Creating Task:", error);
        }
    };

    // =================================================================================================
    //                                   UPDATE TASK
    // =================================================================================================
    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const updated = await apiUpdateTask(taskId, updates);

            setTasks(prev =>
                prev.map(t => (t._id === taskId ? { ...t, ...updated } : t))
            );



        } catch (error) {
            console.error("[TodoContext] Error Updating Task:", error);
        }
    };

    // =================================================================================================
    //                                   DELETE TASK
    // =================================================================================================
    const deleteTask = async (taskId: string) => {
        try {
            await apiDeleteTask(taskId);

            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (error) {
            console.error("[TodoContext] Error deleting task:", error);
        }
    };

    // =================================================================================================
    //                                   REORDER TASKS
    // =================================================================================================
    const reorderTasks = async (orderedList: Task[]) => {
        try {
            const updatedOrder = orderedList.map((task, index) => ({
                ...task,
                orderIndex: index,
            }));

            await reorderTaskPositions(updatedOrder);

            setTasks(updatedOrder);
        } catch (error) {
            console.error("[TodoContext] Error Reordering Tasks:", error);
        }
    };

    // =================================================================================================
    //                                PROVIDER VALUE
    // =================================================================================================
    return (
        <TodoContext.Provider
            value={{
                tasks,
                todayTasks,
                loading,
                fetchTasks,
                addTask,
                updateTask,
                deleteTask,
                reorderTasks,

                filterAll,
                filterPending,
                filterCompleted,
                filterFailed,

                modal,
                openModal,
                closeModal,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};
