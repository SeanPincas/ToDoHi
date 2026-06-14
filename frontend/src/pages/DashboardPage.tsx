import React, { useState, useEffect } from 'react';
import "./DashboardPage.css";

import DashboardStats from "../components/dashboard/DashboardStats";
import TodoPreview from "../components/dashboard/TodoPreview";
import MemoPreview from "../components/dashboard/MemoPreview";
import DailyPlanPreview from "../components/dashboard/DailyPlanPreview";

import { useTodo } from '../context/TodoContext';
import { useAuthContext } from '../context/AuthContext';
import { getRepeatReviewApi } from "../api/taskApi";

const TASK_REVIEW_MODAL_SNOOZE_KEY = "todohi_task_review_modal_snoozed_until";

const Dashboard: React.FC = () => {
    const { openModal } = useTodo();
    const { user } = useAuthContext();

    const [time12, setTime12] = useState("");
    const [time24, setTime24] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [repeatChecked, setRepeatChecked] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (repeatChecked) return;

        const checkRepeatReview = async () => {
            try {
                const snoozedUntilRaw = localStorage.getItem(TASK_REVIEW_MODAL_SNOOZE_KEY);
                const snoozedUntil = snoozedUntilRaw ? Number(snoozedUntilRaw) : 0;

                if (Number.isFinite(snoozedUntil) && snoozedUntil > Date.now()) {
                    setRepeatChecked(true);
                    return;
                }

                if (snoozedUntilRaw && (!Number.isFinite(snoozedUntil) || snoozedUntil <= Date.now())) {
                    localStorage.removeItem(TASK_REVIEW_MODAL_SNOOZE_KEY);
                }

                const review = await getRepeatReviewApi();

                if (!review.reviewRequired || review.tasks.length === 0) {
                    setRepeatChecked(true);
                    return;
                }

                openModal("repeat", {
                    tasks: review.tasks,
                    cycleKey: review.cycleKey,
                    retentionDays: review.retentionDays,
                    archiveLabel: review.archiveLabel,
                    summary: review.summary,
                });
            } catch (err) {
                console.error("[DashboardPage] Failed loading repeat review:", err);
            } finally {
                setRepeatChecked(true);
            }
        };

        checkRepeatReview();
    }, [user, repeatChecked, openModal]);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            setTime12(now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }));

            setTime24(now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }));

            setCurrentDate(now.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }));
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="opened-book-spread">
                    <section className="book-page left-book-page">
                        <div className="dashboard-greeting-bar">
                            <div className="greeting-left">
                                <h2>Welcome Back!</h2>
                                <p>Hello, {user?.username || "User"}</p>
                            </div>

                            <img
                                src="/logo.webp"
                                alt=""
                                aria-hidden="true"
                                className="dashboard-header-logo"
                            />

                            <div className="greeting-right">
                                <div className="time-row">
                                    <span className="time-text">{time12}</span>
                                    <span className="time-divider">||</span>
                                    <span className="time-text">{time24}</span>
                                </div>

                                <span className="date-text">{currentDate}</span>
                            </div>
                        </div>

                        <div className="left-page-stack">
                            <div className="bento-box left-page-todo">
                                <div className="bento-scroll todo-pane-scroll">
                                    <TodoPreview />
                                </div>
                            </div>

                            <div className="bento-box left-page-memo">
                                <div className="bento-scroll memo-pane-scroll">
                                    <MemoPreview />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="book-spine" aria-hidden="true" />

                    <section className="book-page right-book-page">
                        <div className="dashboard-stats-wrapper">
                            <DashboardStats />
                        </div>

                        <div className="bento-box right-page-planner">
                            <div className="bento-scroll">
                                <DailyPlanPreview />
                            </div>
                        </div>

                        <div className="right-page-chart-stack">
                            <div className="dashboard-charts right-page-charts">
                                <div className="chart-card">Chart #1</div>
                                <div className="chart-card">Chart #2</div>
                                <div className="chart-card">Chart #3</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
