// ----------------------------- APP -------------------------------
// Wrap the entire application with all providers that need global access.
// This includes AuthProvider (authentication) and TodoProvider (tasks).

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { TodoProvider } from "./context/TodoContext";
import AppRouter from "./router/AppRouter";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppRouter />
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;