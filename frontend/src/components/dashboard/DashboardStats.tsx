import React, { useMemo } from "react";
import "./DashboardStats.css";

import { useAuthContext } from "../../context/AuthContext";
import { useTodo } from "../../context/TodoContext";
import { useMemoContext } from "../../context/MemoContext";

import { computeDailyDashboardStats } from "../../utils/statsUtils";

const DashboardStats: React.FC = () => {
    const { user } = useAuthContext();
    const { tasks } = useTodo();
    const { memos } = useMemoContext();

    const daily = useMemo(() => {
        if (!user || !tasks) return null;

        return computeDailyDashboardStats(tasks, user);
    }, [tasks, user?.preference?.resetHour]);

    // ------------------ BASE STATS FROM BACKEND ------------------
    const stats = [
        {
            label: "Total Tasks Created",
            value: user?.stats?.totalTasksCreated ?? 0,
        },
        {
            label: "Total Tasks Completed",
            value: user?.stats?.totalTasksCompleted ?? 0,
        },
        {
            label: "Total Tasks Today",
            value: daily?.totalTasksToday ?? 0,
        },
        {
            label: "Ongoing Tasks Today",
            value: daily?.ongoingTasksToday ?? 0,
        },
        {
            label: "Failed Tasks Yesterday",
            value: user?.stats?.tasksFailedYesterday ?? 0,
        },

        {
            label: "Total Memos Created",
            value: user?.stats?.totalMemosCreated ?? 0,
        },
        {
            label: "Total Memos",
            value: memos?.length ?? 0,
        },

        {
            label: "Daily Plan Current Streak",
            value: user?.stats?.dailyStreak ?? 0,
        },
        {
            label: "Daily Plan Longest Streak",
            value: user?.stats?.longestStreak ?? 0,
        },
        {
            label: "Total Completed Daily Plan",
            value: user?.stats?.totalDailyPlanCompleted ?? 0,
        },
    ];

    // --------------------------- RENDER -------------------------------------
    return (
        <div className="stats-bar">
            {stats.map((item, index) => (
                <div className="stats-item" key={index}>
                    <span className="stats-label">{item.label}</span>
                    <span className="stats-value">{item.value}</span>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
