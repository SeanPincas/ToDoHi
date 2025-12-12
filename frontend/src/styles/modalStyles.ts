// ============================================================================
// modalStyles.ts — Shared modal layout styles for Add / Edit / View Task modals
// ============================================================================

export const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(3px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 40,
};

export const modalCardBaseStyle: React.CSSProperties = {
    width: "420px",
    maxWidth: "90%",
    background: "var(--paper-bg)",
    border: "2px solid var(--blue-dark)",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
};
