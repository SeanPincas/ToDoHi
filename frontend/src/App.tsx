// ----------------------------- APP -------------------------------
// App simply renders the AppRouter.
// All global providers (AuthProvider, TodoProvider) live INSIDE AppRouter
// so they are wrapped by <BrowserRouter> (required for useNavigate).

import React from "react";
import AppRouter from "./router/AppRouter";

const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
