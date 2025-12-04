import React, { useState, useEffect } from 'react';
import "./DashboardPage.css";

import DashboardStats from "../components/dashboard/DashboardStats";
import TodoPreview from "../components/dashboard/TodoPreview";
import MemoPreview from "../components/dashboard/MemoPreview";
import DailyPlanPreview from "../components/dashboard/DailyPlanPreview";

import Layout from '../components/layout/Layout';

const Dashboard: React.FC = () => {

    // ------------------ LIVE TIME & DATE ------------------
    const [time12, setTime12] = useState("");
    const [time24, setTime24] = useState("");
    const [currentDate, setCurrentDate] = useState("");

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

    // ------------------------------ RENDER ----------------------------------------------
    return (
        <Layout showSidebar={true}>
            <div className="dashboard-container">

                {/* ---------- GREETING ---------- */}
                <div className="dashboard-greeting-bar">
                    <div className="greeting-left">
                        <h2>👋 Hello, User</h2>
                        <p>Welcome Back!</p>
                    </div>

                    <div className="greeting-right">

                        <div className="time-row">
                            <span className="time-text">{time12}</span>
                            <span className="time-divider">||</span>
                            <span className="time-text">{time24}</span>
                        </div>

                        <span className="date-text">{currentDate}</span>
                    </div>
                </div>

                {/* ---------- STATS BAR ---------- */}
                <DashboardStats />

                {/* ---------- BENTO GRID ---------- */}
                <div className="dashboard-bento-grid">
                    <div className="bento-box">
                        <div className="bento-scroll">
                            <TodoPreview />
                        </div>
                    </div>

                    <div className="bento-box">
                        <div className="bento-scroll">
                            <DailyPlanPreview />
                        </div>
                    </div>

                    <div className="bento-box">
                        <div className="bento-scroll">
                            <MemoPreview />
                        </div>
                    </div>
                </div>

                {/* ---------- CHARTS ---------- */}
                <div className="dashboard-charts">
                    <div className="chart-card">Chart #1</div>
                    <div className="chart-card">Chart #2</div>
                    <div className="chart-card">Chart #3</div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
