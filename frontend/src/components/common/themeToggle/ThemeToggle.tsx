// ThemeToggle.tsx
// Circular button to toggle Light / Dark theme

import "./ThemeToggle.css";

interface ThemeToggleProps {
    theme: "light" | "dark";
    onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
    return (
        <button
            className={`theme-toggle-btn ${theme}`}
            onClick={onToggle}
            aria-label="Toggle Theme"
        >
            <span className="theme-icon">
                {theme === "light" ? "☀️" : "🌙"}
            </span>
        </button>
    );
};

export default ThemeToggle;