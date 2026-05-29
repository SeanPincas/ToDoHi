// --------------------------- MAIN LAYOUT WRAPPER ---------------------------
// - Holds Sidebar (fixed)
// - Content container just wraps the pages (NO borders, NO styling)

import React from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

interface LayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
    return (
        <div className={`layout-wrapper ${showSidebar ? "sidebar-open" : ""}`}>
            <div className="book-shell">
                <div className={`notebook-sheet ${showSidebar ? "with-sidebar" : "no-sidebar"}`}>
                    {/* Sidebar (optional) */}
                    {showSidebar && <Sidebar />}

                    {/* Page content */}
                    <div className="layout-content">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
