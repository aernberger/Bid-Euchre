import React from "react";
import { Users } from "lucide-react";

const floatingButtonStyle: React.CSSProperties = {
  position: "fixed",
  top: "16px",
  right: "16px",
  width: "52px",
  height: "52px",
  borderRadius: "999px",
  border: "1px solid #d6dbe7",
  background: "#ffffff",
  color: "#1f2937",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
  zIndex: 1200,
};

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  zIndex: 1300,
};

const modalStyle: React.CSSProperties = {
  width: "min(92vw, 680px)",
  minHeight: "360px",
  borderRadius: "16px",
  border: "1px solid #d6dbe7",
  background: "#ffffff",
  boxShadow: "0 28px 70px rgba(15, 23, 42, 0.28)",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "#111827",
};

const closeButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: 600,
};

const tabsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  padding: "12px 16px 0 16px",
};

const tabBaseStyle: React.CSSProperties = {
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 600,
};

const contentStyle: React.CSSProperties = {
  padding: "16px",
  color: "#1f2937",
  lineHeight: 1.45,
};

type PlayerTab = "stats" | "settings";
export default function PlayerPopup() {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<PlayerTab>("stats");

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open player popup"
        onClick={() => setOpen(true)}
        style={floatingButtonStyle}
      >
        <Users size={24} />
      </button>

      {open ? (
        <div style={backdropStyle} onClick={() => setOpen(false)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>Player center</h2>
              <button type="button" onClick={() => setOpen(false)} style={closeButtonStyle}>
                Close
              </button>
            </div>

            <div style={tabsRowStyle}>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                style={{
                  ...tabBaseStyle,
                  borderColor: activeTab === "stats" ? "#2563eb" : tabBaseStyle.borderColor,
                  background: activeTab === "stats" ? "#eff6ff" : tabBaseStyle.background,
                  color: activeTab === "stats" ? "#1d4ed8" : tabBaseStyle.color,
                }}
              >
                Player stats
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                style={{
                  ...tabBaseStyle,
                  borderColor: activeTab === "settings" ? "#2563eb" : tabBaseStyle.borderColor,
                  background: activeTab === "settings" ? "#eff6ff" : tabBaseStyle.background,
                  color: activeTab === "settings" ? "#1d4ed8" : tabBaseStyle.color,
                }}
              >
                Player settings
              </button>
            </div>

            <div style={contentStyle}>
              {activeTab === "stats" ? (
                <>
                  <h3 style={{ marginTop: 0 }}>Player stats</h3>
                  <p>
                    Stats will show here, including wins, losses, and recent game performance.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0 }}>Player settings</h3>
                  <p>
                    Settings will appear here, such as display preferences, avatar updates, and gameplay options.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
