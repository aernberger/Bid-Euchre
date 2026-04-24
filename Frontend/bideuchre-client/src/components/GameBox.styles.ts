import type React from "react";

export const boardGridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "grid",
    overflow: "hidden",
    gridTemplateColumns: "minmax(70px, 120px) 1fr minmax(70px, 120px)",
    gridTemplateRows: "auto 1fr auto",
    gap: "10px",
    alignItems: "center",
    justifyItems: "center",
    padding: "8px",
    boxSizing: "border-box",
};

export const seatColumnStyle = (gridColumn: string, gridRow: string): React.CSSProperties => ({
    gridColumn,
    gridRow,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    minWidth: 0,
});

export const sideSeatColumnStyle = (gridColumn: string): React.CSSProperties => ({
    ...seatColumnStyle(gridColumn, "2"),
    alignSelf: "center",
});

export const topStackContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "clamp(75px, 8vw, 95px)",
    height: "clamp(45px, 7vw, 110px)",
};

export const sideStackContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "clamp(70px, 10vw, 120px)",
    height: "clamp(70px, 10vw, 130px)",
};

export const topStackCardStyle = (i: number, stackOverlap: number): React.CSSProperties => ({
    position: "absolute",
    left: i * stackOverlap,
    top: 0,
});

export const leftStackCardStyle = (i: number, sideStackOverlap: number): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: i * sideStackOverlap,
    transform: "translateX(-50%) rotate(-90deg)",
    transformOrigin: "center",
});

export const rightStackCardStyle = (i: number, sideStackOverlap: number): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: i * sideStackOverlap,
    transform: "translateX(-50%) rotate(90deg)",
    transformOrigin: "center",
});

export const centerPanelStyle: React.CSSProperties = {
    gridColumn: "2",
    gridRow: "2",
    width: "100%",
    height: "100%",
    minWidth: 0,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px",
    boxSizing: "border-box",
};

export const trickSummaryWrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    maxWidth: "100%",
};

export const trickSummaryLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#6b7280",
    letterSpacing: "0.02em",
};

export const trickSummaryRowStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
};

export const currentTrickRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    minWidth: 0,
    maxWidth: "100%",
};
