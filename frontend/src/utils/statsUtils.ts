import type { Task } from "../api/taskApi";
import { getResetWindow } from "./resetCycle";

interface User {
    preference?: {
        resetHour: number;
    };
}

export interface DailyDashboardStats {
    totalTasksCompletedToday: number;
    totalTasksToday: number;
    ongoingTasksToday: number;
}

export const computeDailyDashboardStats = (
    tasks: Task[],
    user: User
): DailyDashboardStats => {

    const resetHour =
        typeof user?.preference?.resetHour === "number"
            ? user.preference.resetHour
            : 0;

    const { start, end } = getResetWindow(resetHour);

    // ============================================================
    // COMPLETED TODAY
    // Use updatedAt IF present, otherwise fallback to createdAt
    // ============================================================
    const totalTasksCompletedToday = tasks.filter(task => {
        if (task.status !== "completed") return false;

        const completedAt = new Date(
            task.updatedAt ?? task.createdAt
        );

        return completedAt >= start && completedAt < end;
    }).length;

    // ============================================================
    // TASKS DUE THIS RESET WINDOW
    // END is inclusive
    // ============================================================
    const totalTasksToday = tasks.filter(task => {
        if (!task.deadline) return false;

        const deadline = new Date(task.deadline);

        return deadline >= start && deadline <= end;
    }).length;

    // ============================================================
    // ONGOING TODAY
    // ============================================================
    const ongoingTasksToday = tasks.filter(task => {
        if (!task.deadline) return false;

        const deadline = new Date(task.deadline);

        return (
            deadline >= start &&
            deadline <= end &&
            task.status === "pending"
        );
    }).length;

    return {
        totalTasksCompletedToday,
        totalTasksToday,
        ongoingTasksToday,
    };
};
