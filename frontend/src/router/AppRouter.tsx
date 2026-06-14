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
import ViewTaskModal from "../components/todo/ViewTaskModal";
import EditTaskModal from "../components/todo/EditTaskModal";
import DeleteConfirmModal from "../components/common/modals/DeleteConfirmModal";
import RepeatTaskModal from "../components/common/modals/RepeatTaskModal";
import RepeatConfirmModal from "../components/common/modals/RepeatConfirmModal";
import TaskArchiveModal from "../components/common/modals/TaskArchiveModal";
import { MemoProvider } from "../context/MemoContext";
import AddMemoModal from "../components/memo/AddMemoModal";
import ViewMemoModal from "../components/memo/ViewMemoModal";
import DeleteConfirmMemoModal from "../components/memo/DeleteConfirmMemoModal";
import EditMemoModal from "../components/memo/EditMemoModal";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TodoProvider>
                    <MemoProvider>
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
                                    path="/memoboard"
                                    element={
                                        <>
                                            <MemoBoardPage />
                                            <AddMemoModal />
                                            <ViewMemoModal />
                                            <EditMemoModal />
                                            <DeleteConfirmMemoModal />
                                        </>
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
                        <ViewTaskModal />
                        <EditTaskModal />
                        <DeleteConfirmModal />
                        <RepeatTaskModal />
                        <RepeatConfirmModal />
                        <TaskArchiveModal />
                    </MemoProvider>
                </TodoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default AppRouter;
