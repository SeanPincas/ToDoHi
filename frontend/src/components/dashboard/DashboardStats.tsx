import React from "react";
import "./DashboardStats.css";

const DashboardStats: React.FC = () => {

    // --------------------------- PLACEHOLDER DATA ---------------------------
    const stats = [
        { label: "Total Tasks Created", value: 100 },
        { label: "Total Task Created Today", value: 25 },
        { label: "Total Task Completed", value: 75 },
        { label: "Total Tasks Today", value: 10 },
        { label: "Ongoing Tasks Today", value: 7 },
        { label: "Failed Tasks Yesterday", value: 3 },

        { label: "Total Memos Created", value: 15 },

        { label: "Daily Plan Current Streak", value: 24 },
        { label: "Daily Plan Longest Streak", value: 60 },
        { label: "Total Completed Daily Plan", value: 120 }
    ]

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
    )
}

export default DashboardStats;