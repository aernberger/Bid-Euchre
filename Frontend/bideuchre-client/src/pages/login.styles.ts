import type React from "react";

export const loginPageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#1a3d2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
};

export const loginCardStyle: React.CSSProperties = {
    width: "min(420px, 100%)",
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "24px 22px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    color: "#f0f4f0",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
};

export const loginTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "clamp(1.4rem, 4vw, 1.85rem)",
};

export const loginSubtitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.45,
    opacity: 0.85,
};

export const loginFormStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

export const loginInputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f0f4f0",
    padding: "11px 12px",
    fontSize: "14px",
    boxSizing: "border-box",
};

export const loginPrimaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
    marginTop: "4px",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: disabled ? "#4a6b58" : "#2d6a4f",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "15px",
    cursor: disabled ? "wait" : "pointer",
});

export const loginSecondaryButtonStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.25)",
    backgroundColor: "transparent",
    color: "#f0f4f0",
    fontSize: "14px",
    cursor: "pointer",
};

export const loginErrorStyle: React.CSSProperties = {
    margin: 0,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,120,120,0.35)",
    backgroundColor: "rgba(180, 40, 40, 0.2)",
    color: "#ffe3e3",
    fontSize: "13px",
    lineHeight: 1.35,
};

export const loginHelpTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "12px",
    opacity: 0.75,
};
