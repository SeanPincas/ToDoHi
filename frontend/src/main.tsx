// ------------------------------ MAIN ---------------------------------
// React entry point. Renders App into #root (Vite default).
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Global CSS

const el = document.getElementById("root")!;
const root = createRoot(el);
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);

