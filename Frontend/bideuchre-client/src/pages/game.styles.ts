import type React from "react";

export const gamePageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#35654d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "16px",
    gap: "12px",
    boxSizing: "border-box",
};

export const gameTopActionsStyle: React.CSSProperties = {
    width: "clamp(500px, 90vw, 1000px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
};

export const gameTopActionsRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
};

export const backToTablesButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(0,0,0,0.15)",
    color: "#f5f5f5",
    cursor: "pointer",
    fontSize: "14px",
};

export const gameLogoutButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontSize: "14px",
};

export const gameRulesButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(147, 197, 253, 0.6)",
    backgroundColor: "rgba(219, 234, 254, 0.2)",
    color: "#dbeafe",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
};

export const scoreboardWrapStyle: React.CSSProperties = {
    width: "clamp(500px, 90vw, 1000px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px 16px",
    borderRadius: "10px",
    backgroundColor: "rgba(0,0,0,0.2)",
    boxSizing: "border-box",
};

export const handAreaWrapStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    flex: 1,
    minHeight: 0,
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
};

export const myNameRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: "8px",
    minWidth: 0,
    flexWrap: "wrap",
    boxSizing: "border-box",
};

export const handCardsRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flex: 1,
};

export const rulesModalBackdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
};

export const gameOverModalStyle: React.CSSProperties = {
    width: "min(440px, 92vw)",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    textAlign: "center",
};

export const gameOverTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    color: "#111827",
};

export const gameOverMessageStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "16px",
    color: "#374151",
};

export const gameOverCloseButtonStyle: React.CSSProperties = {
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    color: "#111827",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
};
