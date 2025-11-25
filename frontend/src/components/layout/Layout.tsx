// --------------------------- MAIN LAYOUT WRAPPER ---------------------------
// Holds Sidebar (fixed) and content area (dynamic route pages)

import React from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout-wrapper">

            {/* ----- Sidebar Left (Fixed) ----- */}
            <Sidebar />

            {/* ----- Centered Content Area ----- */}
            <main className="layout-content">
                <div className="content-container">
                    {children}
                </div>
            </main>

        </div>
    );
};

export default Layout;