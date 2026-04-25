import type React from "react";

export const rulesModalBackdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
};

export const rulesModalStyle: React.CSSProperties = {
    width: "min(860px, 96vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    padding: "16px",
    boxSizing: "border-box",
    color: "#000000",
};

export const rulesHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
};

export const rulesTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "20px",
    textAlign: "center",
    flex: 1,
    color: "#000000",
};

export const rulesCloseButtonStyle: React.CSSProperties = {
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    color: "#111827",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 600,
};

export const rulesGridStyle: React.CSSProperties = {
    display: "grid",
    width: "100%",
    maxWidth: "820px",
    margin: "0 auto",
    justifyItems: "stretch",
    gap: "10px",
    color: "#000000",
    lineHeight: 1.45,
    textAlign: "center",
};
