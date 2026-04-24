import type React from "react";

export const lobbyPageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#1a3d2e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "24px 16px",
    boxSizing: "border-box",
    color: "#f0f4f0",
};

export const lobbyContainerStyle: React.CSSProperties = {
    width: "min(520px, 100%)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
};

export const lobbyHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
};

export const lobbyTitleWrapStyle: React.CSSProperties = { textAlign: "left" };
export const lobbyTitleStyle: React.CSSProperties = { margin: "0 0 6px 0", fontSize: "clamp(1.35rem, 4vw, 1.75rem)", fontWeight: 700 };
export const lobbySubtitleStyle: React.CSSProperties = { margin: 0, opacity: 0.85, fontSize: "15px", lineHeight: 1.45 };

export const lobbyHeaderActionsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
};

export const lobbyRulesButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(147, 197, 253, 0.65)",
    backgroundColor: "rgba(219, 234, 254, 0.2)",
    color: "#dbeafe",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
};

export const lobbyLogoutButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "transparent",
    color: "#f0f4f0",
    cursor: "pointer",
    fontSize: "14px",
};

export const createTableButtonStyle = (creating: boolean): React.CSSProperties => ({
    padding: "14px 18px",
    borderRadius: "10px",
    border: "none",
    background: creating ? "#4a6b58" : "#2d6a4f",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    cursor: creating ? "wait" : "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
});

export const lobbyErrorStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: "8px",
    background: "rgba(180, 40, 40, 0.2)",
    border: "1px solid rgba(255,120,120,0.35)",
    fontSize: "14px",
    textAlign: "left",
};

export const lobbySectionStyle: React.CSSProperties = { textAlign: "left" };
export const lobbySectionTitleStyle: React.CSSProperties = { margin: "0 0 12px 0", fontSize: "1.05rem", fontWeight: 600, opacity: 0.95 };
export const lobbyEmptyStyle: React.CSSProperties = { margin: 0, opacity: 0.75, fontSize: "15px" };
export const lobbyListStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" };
export const lobbyListItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
};
export const lobbyPlayerInfoStyle: React.CSSProperties = { minWidth: 0, flex: 1 };
export const lobbyPlayerCountStyle: React.CSSProperties = { fontWeight: 600, fontSize: "15px", marginBottom: "4px" };
export const lobbyPlayerNamesStyle: React.CSSProperties = { fontSize: "13px", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis" };

export const lobbyJoinButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: disabled ? "#555" : "#40916c",
    color: "#fff",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
});
