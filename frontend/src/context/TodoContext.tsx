//                                         TODO CONTEXT (GLOBAL STORE)
// =====================================================================================================
// This file controls ALL logic for Tasks/Todo feature:
// - Fetch tasks from backend
// - Add/update/delete tasks
// - Drag & Drop reordering
// - Filtering (All, Today, Completed, Failed)
// Everything is stored here and shared across the entire app.

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Task } from "../api/taskApi.ts"
import {
    getAllTasks,
    createTask,
    updateTask as apiUpdateTask,
    deleteTask as apiDeleteTask,
    reorderTaskPositions
} from "../api/taskApi.ts";

// ------------------------------ CONTEXT TYPE --------------------------------------
// We define WHAT values and functions the TodoContext will give to the entire app.
interface TodoContextType {
    tasks: Task[];               // all tasks (raw list from backend)
    todayTasks: Task[];          // tasks relevant today (for dashboard preview)
    loading: boolean;            // loading state for UI feedback

    // CRUD functions
    fetchTasks: () => Promise<void>;                                        // get all tasks from backend
    addTask: (data: Partial<Task>) => Promise<void>;                        // create a new task
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;  // update an existing task
    deleteTask: (taskId: string) => Promise<void>;                          // remove task

    // Drag & Drop reorder
    reorderTasks: (orderedList: Task[]) => Promise<void>;

    // Task Filters
    filterAll: Task[];         // every task
    filterOngoing: Task[];     // status === "ongoing"
    filterCompleted: Task[];   // status === "completed"
    filterFailed: Task[];      // failed or expired tasks

}

// ------------------------------ CREATE CONTEXT -------------------------------------
const TodoContext = createContext<TodoContextType | null>(null);

// ------------------------------ CUSTOM HOOK -----------------------------------
export const useTodo = () => {
    const ctx = useContext(TodoContext);
    if (!ctx) throw new Error("useTodo must be used inside <TodoProvider>");
    return ctx;
};

// ------------------------------ PROVIDER START ---------------------------------
export const TodoProvider = ({ children }: { children: ReactNode }) => {

    // =================================================================================================
    //                                      REACT STATES
    // =================================================================================================
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // =================================================================================================
    //                                      FETCH TASKS FROM BACKEND
    // =================================================================================================
    // Runs 1 time on mount (Dashboard loads)
    // Fetches all tasks of the logged-in user
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await getAllTasks();

            // Sort tasks by orderIndex for proper display
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
    //               FILTERING LOGIC (ALL / ONGOING / COMPLETED / FAILED)
    // =================================================================================================

    // Helper: get today's date yyyy-mm-dd
    const todayString = new Date().toISOString().split("T")[0];

    // Show only tasks with today's deadline OR status ongoing
    const todayTasks = tasks.filter(t => {
        const deadline = t.deadline ? t.deadline.split("T")[0] : null;
        return deadline === todayString || t.status === "ongoing";
    });

    // All tasks (just return tasks array)
    const filterAll = tasks;

    // Ongoing tasks only
    const filterOngoing = tasks.filter(t => t.status === "ongoing")

    // Completed tasks only
    const filterCompleted = tasks.filter(t => t.status === "completed");

    // Failed tasks only
    const filterFailed = tasks.filter(t => t.status === "failed" || t.isExpired);

    // =================================================================================================
    //                                 ADD A NEW TASK
    // =================================================================================================
    const addTask = async (data: Partial<Task>) => {
        try {
            const newTask = await createTask(data);

            setTasks(prev => {
                // insert new task at bottom with proper orderIndex
                return [...prev, newTask].sort((a, b) => a.orderIndex - b.orderIndex);
            });
        } catch (error) {
            console.error("[TodoContext] Error Creating Task:", error);
        }
    };

    // =================================================================================================
    //                                 UPDATE EXISTING TASK
    // =================================================================================================
    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const updated = await apiUpdateTask(taskId, updates);
            setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, ...updated } : t)))
        } catch (error) {

            console.error("[TodoContext] Error Updating Task", error)
        }
    };

    // =================================================================================================
    //                                 DELETE A TASK
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
    //                        DRAG & DROP — SAVE NEW ORDER TO BACKEND
    // =================================================================================================
    const reorderTasks = async (orderedList: Task[]) => {
        try {
            // Add new orderIndex to each item
            const updatedOrder = orderedList.map((task, index) => ({
                ...task,
                orderIndex: index,
            }))

            // Save to server
            await reorderTaskPositions(updatedOrder);

            // Save to State
            setTasks(updatedOrder);
        } catch (error) {
            console.error("[TodoContext] Error Reordering Tasks:", error);
        }
    };

    // =================================================================================================
    //                                 PROVIDER VALUE
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
                filterOngoing,
                filterCompleted,
                filterFailed,
            }}
        >
            {children}
        </TodoContext.Provider>
    )
}