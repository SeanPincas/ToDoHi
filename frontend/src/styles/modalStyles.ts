// ============================================================================
// modalStyles.ts
// Purpose:
// - Keep only shared overlay layout in TS.
// - Modal card shell styling now lives in CSS via modalBaseTheme.css so
//   feature modals can extend it without inline-style conflicts.
// ============================================================================

export const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(3px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
};
