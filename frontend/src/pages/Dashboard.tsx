import React from 'react'
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>

            <section>
                <h2>Quick Links Here</h2>
                <ul>
                    <li><Link to="/memos">Memo Board</Link> </li>
                </ul>
            </section>

            <section>
                <p>Replacing this with DashboardStats, TodoPreview, MemoPreview, etc.</p>
            </section>
        </div>
    )
}

export default Dashboard