import React, { useMemo } from "react";
import "./DashboardStats.css";

import { useAuthContext } from "../../context/AuthContext";
import { useTodo } from "../../context/TodoContext";
import { useMemoContext } from "../../context/MemoContext";
import { Icons } from "../../styles/iconLibrary";

import { computeDailyDashboardStats } from "../../utils/statsUtils";

const DashboardStats: React.FC = () => {
    const { user } = useAuthContext();
    const { tasks } = useTodo();
    const { memos } = useMemoContext();

    const daily = useMemo(() => {
        if (!user || !tasks) return null;

        return computeDailyDashboardStats(tasks, user);
    }, [tasks, user?.preference?.resetHour]);

    const liveTotalTasksCompleted = useMemo(() => {
        const storedTotal = user?.stats?.totalTasksCompleted ?? 0;
        const storedCompletedToday = user?.stats?.tasksCompletedToday ?? 0;
        const currentCompletedToday = daily?.totalTasksCompletedToday ?? 0;
        const historicalBase = Math.max(0, storedTotal - storedCompletedToday);

        return historicalBase + currentCompletedToday;
    }, [
        daily?.totalTasksCompletedToday,
        user?.stats?.totalTasksCompleted,
        user?.stats?.tasksCompletedToday,
    ]);

    // ------------------ BASE STATS FROM BACKEND ------------------
    const todoStats = [
        {
            label: "Total Tasks Created",
            value: user?.stats?.totalTasksCreated ?? 0,
            icon: Icons.Todo,
            tone: "blue",
        },
        {
            label: "Total Tasks Completed",
            value: liveTotalTasksCompleted,
            icon: Icons.Check,
            tone: "green",
        },
        {
            label: "Total Tasks Today",
            value: daily?.totalTasksToday ?? 0,
            icon: Icons.Sun,
            tone: "amber",
        },
        {
            label: "Ongoing Tasks Today",
            value: daily?.ongoingTasksToday ?? 0,
            icon: Icons.Repeat,
            tone: "blue",
        },
        {
            label: "Failed Tasks Yesterday",
            value: user?.stats?.tasksFailedYesterday ?? 0,
            icon: Icons.Alert,
            tone: "red",
        },
    ];

    const plannerMemoStats = [
        {
            label: "Total Memos Created",
            value: user?.stats?.totalMemosCreated ?? 0,
            icon: Icons.Note,
            tone: "violet",
        },
        {
            label: "Total Memos",
            value: memos?.length ?? 0,
            icon: Icons.Memo,
            tone: "violet",
        },

        {
            label: "Daily Plan Current Streak",
            value: user?.stats?.dailyStreak ?? 0,
            icon: Icons.Flame,
            tone: "olive",
        },
        {
            label: "Daily Plan Longest Streak",
            value: user?.stats?.longestStreak ?? 0,
            icon: Icons.Star,
            tone: "gold",
        },
        {
            label: "Total Completed Daily Plan",
            value: user?.stats?.totalDailyPlanCompleted ?? 0,
            icon: Icons.Target,
            tone: "blue",
        },
    ];

    // --------------------------- RENDER -------------------------------------
    return (
        <div className="stats-bar">
            <div className="stats-column">
                {todoStats.map((item) => (
                    <div className={`stats-item stats-item-${item.tone}`} key={item.label}>
                        <div className="stats-label-row">
                            <item.icon className="stats-item-icon" />
                            <span className="stats-label">{item.label}</span>
                        </div>
                        <span className="stats-value">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="stats-column">
                {plannerMemoStats.map((item) => (
                    <div className={`stats-item stats-item-${item.tone}`} key={item.label}>
                        <div className="stats-label-row">
                            <item.icon className="stats-item-icon" />
                            <span className="stats-label">{item.label}</span>
                        </div>
                        <span className="stats-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardStats;
