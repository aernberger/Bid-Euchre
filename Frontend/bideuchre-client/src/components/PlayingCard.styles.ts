import type React from "react";

export const playingCardBaseStyle = (compact: boolean): React.CSSProperties =>
    compact
        ? { width: "56px", height: "84px", padding: "4px" }
        : { width: "clamp(50px, 8vw, 150px)", height: "clamp(75px, 12vw, 225px)", padding: "8px" };

export const playingCardButtonStyle = (
    compact: boolean,
    selected: boolean,
    disabled: boolean
): React.CSSProperties => ({
    ...playingCardBaseStyle(compact),
    border: selected ? "3px solid blue" : "2px solid black",
    borderRadius: "8px",
    backgroundColor: "white",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
});

export const playingCardHeaderStyle = (color: string): React.CSSProperties => ({
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
});

export const playingCardValueStyle = (compact: boolean): React.CSSProperties => ({
    fontWeight: "bold",
    fontSize: compact ? "10px" : "clamp(12px, 2vw, 24px)",
});

export const playingCardCenterIconStyle = (compact: boolean, color: string): React.CSSProperties => ({
    color,
    marginTop: compact ? "4px" : "16px",
});
