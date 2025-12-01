// --------------------------- SIDEBAR COMPONENT ---------------------------
// Fixed sidebar on desktop, drawer sidebar on mobile
import { useState } from 'react';
import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";

export const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setOpen(!open);

    return (
        <>
            {/* ---------------- MOBILE HAMBURGER BUTTON ---------------- */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            {/* ---------------------- SIDEBAR PANEL ---------------------- */}
            <aside className={`sidebar ${open ? "open" : ""}`}>

                {/* ----- SECTION 1: LOGO + QUOTE ----- */}
                <div className="sidebar-section logo section">
                    <img src="/logo.png" alt="ToDoHi Logo" className="sidebar-logo" />
                    <p className="sidebar-quote">"Stay Productive, one day at a Time."</p>
                </div>

                {/* ----- SECTION 2: MAIN NAVIGATION ----- */}
                <div className="sidebar-section">
                    <button className="sidebar-btn" onClick={() => navigate("/")}>
                        Dashboard
                    </button>

                    <button className="sidebar-btn" onClick={() => navigate("/memos")}>
                        Memo Board
                    </button>
                </div>

                {/* ----- SECTION 3: USER PREFERENCES ----- */}
                <div className="sidebar-section">
                    {/* Reset Hour */}
                    <div className="sidebar-field">
                        <label>Reset Hour</label>
                        <select>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i}>
                                    {i}:00
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quote Category Selector */}
                    <div className="sidebar-field">
                        <label>Quote Preferences</label>
                        <select multiple size={3}>
                            <option value="Motivation">Motivation</option>
                            <option value="Success">Success</option>
                            <option value="Life Lessons">Life Lessons</option>
                            <option value="Happiness">Happiness</option>
                            <option value="Love">Love</option>
                            <option value="Wisdom">Wisdom</option>
                            <option value="Courage">Courage</option>
                            <option value="Discipline">Discipline</option>
                            <option value="Friendship">Friendship</option>
                            <option value="Positive Thinking">Positive Thinking</option>
                            <option value="Faith">Faith</option>
                            <option value="Mindfulness">Mindfulness</option>
                            <option value="Growth">Growth</option>
                            <option value="Health">Health</option>
                            <option value="Patience">Patience</option>
                        </select>
                    </div>

                    {/* ----- SECTION 4: FAILED TASKS YESTERDAY ----- */}
                    <div className="sidebar-section">
                        <h4 className="section-title">Failed Tasks Yesterday</h4>
                        <ul className="failed-task-list">
                            <li>No Data Loaded Yet...</li>
                        </ul>
                    </div>

                    {/* ----- SECTION 5: USER PROFILE & LOGOUT ----- */}
                    <div className="sidebar-section profile-section">
                        <img src="/default-profile.png" alt="User Profile Img" className="sidebar-profile-pic" />
                        <p className="profile-name">Username</p>

                        <button className="logout-btn">Logout</button>

                        <footer className="sidebar-footer">
                            <p>© 2025 ToDoHi</p>
                        </footer>
                    </div>
                </div>
            </aside>






        </>
    )
}

export default Sidebar