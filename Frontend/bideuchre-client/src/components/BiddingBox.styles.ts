import type React from "react";

export const biddingRootStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
};

export const biddingTopRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    width: "100%",
    maxWidth: "680px",
};

export const biddingSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    maxWidth: "680px",
    alignItems: "center",
};

export const biddingLabelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, opacity: 0.75 };
export const biddingWrapRowStyle: React.CSSProperties = { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" };
export const biddingSuitRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: "680px",
};

export const biddingActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: "680px",
};

export const chipStyle = (active: boolean, disabled = false): React.CSSProperties => ({
    padding: "8px 12px",
    borderRadius: "999px",
    border: disabled
        ? "1px solid #e5e7eb"
        : active
            ? "1px solid #2563eb"
            : "1px solid #d1d5db",
    backgroundColor: disabled ? "#f3f4f6" : active ? "#dbeafe" : "#ffffff",
    color: disabled ? "#9ca3af" : "#1f2937",
    fontWeight: active ? 700 : 500,
    opacity: disabled ? 0.65 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
});

export const confirmBidButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #1d4ed8",
    backgroundColor: disabled ? "#bfdbfe" : "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
});

export const passButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
});
