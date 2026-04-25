import type React from "react";

export const cardBackStyle = (disabled: boolean): React.CSSProperties => ({
    width: "clamp(30px, 4.5vw, 70px)",
    height: "clamp(45px, 7vw, 110px)",
    border: "2px solid black",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #1f3b73, #0b1b3a)",
    opacity: disabled ? 0.85 : 1,
});
