// ---------------------------- APP ROUTER -----------------------------------
// Centralized route definitions for the app.
// AuthProvider + TodoProvider MUST be inside BrowserRouter so that
// all pages (DashboardPage, MemoPage, etc.) have access to both contexts.

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import MemoBoardPage from "../pages/MemoBoardPage";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import { AuthProvider } from "../context/AuthContext";
import { TodoProvider } from "../context/TodoContext";
import AddTaskModal from "../components/todo/AddTaskModal";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TodoProvider>

                    <Routes>
                        {/* ---------- Public Routes ---------- */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* ---------- Protected Routes ---------- */}
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

                    {/* ===================================================== */}
                    {/*                   GLOBAL TODO MODALS                 */}
                    {/* ===================================================== */}
                    <AddTaskModal />
                    {/*<EditTaskModal />*/}
                    {/*<ViewTaskModal />*/}
                    {/*<VerificationModal />*/}
                </TodoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default AppRouter;