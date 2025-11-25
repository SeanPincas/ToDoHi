// ---------------------------- APP ROUTER -----------------------------------
// Centralized route definitions for the app.
// - Public routes: /login, /register
// - Protected routes: / (dashboard), /memos, etc.
// - Now wrapped inside <Layout> so the sidebar + page content show properly.

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/Dashboard";
import MemoBoardPage from "../pages/MemoBoardPage";

import ProtectedRoute from "./ProtectedRoute";
import { Layout } from "../components/layout/Layout"; // <-- IMPORTANT

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* ---------- Public Routes ---------- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ---------- Protected Routes (Layout + Sidebar) ---------- */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <DashboardPage />
                            </Layout>
                        }
                    />

                    <Route
                        path="/memos"
                        element={
                            <Layout>
                                <MemoBoardPage />
                            </Layout>
                        }
                    />
                </Route>

                {/* ---------- Fallback ---------- */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
