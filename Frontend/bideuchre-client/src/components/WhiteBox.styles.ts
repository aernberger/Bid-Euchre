import type React from "react";

export const whiteBoxStyle = (width: string, height: string): React.CSSProperties => ({
    width,
    height,
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "8px",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
});
