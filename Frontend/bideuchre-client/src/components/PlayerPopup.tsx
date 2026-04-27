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
interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalCallsWon: number;
  successfulCalls: number;
  sumBidAmount: number;
  handsPlayed: number;
  handsWon: number;
  tricksPlayed: number;
  tricksWon: number;
}

interface PlayerPopupProps {
  token: string;
  user: any;
  onUserUpdated: (user: any) => void;
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#1f2937",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  fontSize: "0.95rem",
  color: "#111827",
};

const helperTextStyle: React.CSSProperties = {
  marginTop: "6px",
  marginBottom: 0,
  fontSize: "0.82rem",
  color: "#6b7280",
};

const saveButtonStyle = (disabled: boolean): React.CSSProperties => ({
  borderRadius: "10px",
  border: "1px solid #1d4ed8",
  background: disabled ? "#93c5fd" : "#2563eb",
  color: "#ffffff",
  padding: "10px 14px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 700,
});

const statusTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.9rem",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "10px",
  marginTop: "8px",
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px 12px",
  background: "#f9fafb",
};

const statLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.8rem",
  color: "#6b7280",
};

const statValueStyle: React.CSSProperties = {
  margin: "2px 0 0 0",
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#111827",
};

export default function PlayerPopup({ token, user, onUserUpdated }: PlayerPopupProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<PlayerTab>("stats");
  const [username, setUsername] = React.useState("");
  const [profilePicUrl, setProfilePicUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [buttonAvatarLoadFailed, setButtonAvatarLoadFailed] = React.useState(false);
  const [stats, setStats] = React.useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState<string | null>(null);

  const currentUsername = React.useMemo(
    () =>
      (typeof user?.user_metadata?.username === "string" && user.user_metadata.username) ||
      (typeof user?.email === "string" ? user.email : "Player"),
    [user]
  );
  const currentAvatarUrl = React.useMemo(
    () =>
      (typeof user?.user_metadata?.profile_pic_url === "string" && user.user_metadata.profile_pic_url) ||
      (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : ""),
    [user]
  );

  React.useEffect(() => {
    if (!open) return;
    setUsername(currentUsername);
    setProfilePicUrl(currentAvatarUrl);
    setError(null);
    setSuccess(null);
  }, [open, currentUsername, currentAvatarUrl]);

  React.useEffect(() => {
    setButtonAvatarLoadFailed(false);
  }, [currentAvatarUrl]);

  React.useEffect(() => {
    if (!open || activeTab !== "stats") return;

    let isMounted = true;
    setStatsLoading(true);
    setStatsError(null);

    fetch("http://localhost:8000/api/auth/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Could not load player stats.");
        }
        const raw = data?.stats ?? {};
        return {
          gamesPlayed: Number(raw.gamesPlayed ?? raw.games_played ?? 0),
          gamesWon: Number(raw.gamesWon ?? raw.games_won ?? 0),
          totalCallsWon: Number(raw.totalCallsWon ?? raw.total_calls_won ?? 0),
          successfulCalls: Number(raw.successfulCalls ?? raw.successful_calls ?? 0),
          sumBidAmount: Number(raw.sumBidAmount ?? raw.sum_bid_amount ?? 0),
          handsPlayed: Number(raw.handsPlayed ?? raw.hands_played ?? 0),
          handsWon: Number(raw.handsWon ?? raw.hands_won ?? 0),
          tricksPlayed: Number(raw.tricksPlayed ?? raw.tricks_played ?? 0),
          tricksWon: Number(raw.tricksWon ?? raw.tricks_won ?? 0),
        } as PlayerStats;
      })
      .then((nextStats) => {
        if (!isMounted) return;
        setStats(nextStats);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setStatsError(err?.message ?? "Could not load player stats.");
      })
      .finally(() => {
        if (!isMounted) return;
        setStatsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, activeTab, token]);

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

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim();
    const trimmedProfilePicUrl = profilePicUrl.trim();
    if (!trimmedUsername) {
      setError("Username cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: trimmedUsername,
          profilePicUrl: trimmedProfilePicUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Could not update your profile.");
        return;
      }

      if (data?.user) {
        onUserUpdated(data.user);
      }
      setSuccess("Profile updated.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toSafeNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPercent = (wins: unknown, played: unknown): string => {
    const winsN = toSafeNumber(wins);
    const playedN = toSafeNumber(played);
    if (playedN <= 0) return "0%";
    return `${Math.round((winsN / playedN) * 100)}%`;
  };

  const formatAverageBid = (sumBidAmount: unknown, totalCallsWon: unknown): string => {
    const sumN = toSafeNumber(sumBidAmount);
    const callsN = toSafeNumber(totalCallsWon);
    if (callsN <= 0) return "0.00";
    return (sumN / callsN).toFixed(2);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open player popup"
        onClick={() => setOpen(true)}
        style={floatingButtonStyle}
      >
        {currentAvatarUrl && !buttonAvatarLoadFailed ? (
          <img
            src={currentAvatarUrl}
            alt="Player avatar"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "999px",
              objectFit: "cover",
            }}
            onError={() => setButtonAvatarLoadFailed(true)}
          />
        ) : (
          <Users size={24} />
        )}
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
                  {statsLoading ? <p style={{ margin: 0 }}>Loading stats...</p> : null}
                  {statsError ? (
                    <p style={{ ...statusTextStyle, color: "#b91c1c" }} role="alert">
                      {statsError}
                    </p>
                  ) : null}
                  {stats ? (
                    <div style={statsGridStyle}>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Games played</p>
                        <p style={statValueStyle}>{stats.gamesPlayed}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Game Win %</p>
                        <p style={statValueStyle}>{formatPercent(stats.gamesWon, stats.gamesPlayed)}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Hands played</p>
                        <p style={statValueStyle}>{stats.handsPlayed}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Hands Win %</p>
                        <p style={statValueStyle}>{formatPercent(stats.handsWon, stats.handsPlayed)}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Tricks played</p>
                        <p style={statValueStyle}>{stats.tricksPlayed}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Tricks Win %</p>
                        <p style={statValueStyle}>{formatPercent(stats.tricksWon, stats.tricksPlayed)}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Call Success %</p>
                        <p style={statValueStyle}>{formatPercent(stats.successfulCalls, stats.totalCallsWon)}</p>
                      </div>
                      <div style={statCardStyle}>
                        <p style={statLabelStyle}>Average Bid</p>
                        <p style={statValueStyle}>{formatAverageBid(stats.sumBidAmount, stats.totalCallsWon)}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0 }}>Player settings</h3>
                  <form onSubmit={handleSaveSettings} style={{ display: "grid", gap: "12px" }}>
                    <div>
                      <label htmlFor="player-username" style={fieldLabelStyle}>
                        Username
                      </label>
                      <input
                        id="player-username"
                        type="text"
                        maxLength={32}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Enter username"
                        style={inputStyle}
                        disabled={saving}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="profile_pic_url" style={fieldLabelStyle}>
                        Profile picture URL
                      </label>
                      <input
                        id="profile_pic_url"
                        type="url"
                        value={profilePicUrl}
                        onChange={(event) => setProfilePicUrl(event.target.value)}
                        placeholder="https://example.com/avatar.png"
                        style={inputStyle}
                        disabled={saving}
                      />
                      <p style={helperTextStyle}>
                        Use a public image URL. Leave blank to remove your current picture.
                      </p>
                    </div>
                    {profilePicUrl.trim() ? (
                      <img
                        src={profilePicUrl.trim()}
                        alt="Profile preview"
                        style={{
                          width: "84px",
                          height: "84px",
                          borderRadius: "999px",
                          objectFit: "cover",
                          border: "1px solid #d1d5db",
                        }}
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        onLoad={(event) => {
                          (event.currentTarget as HTMLImageElement).style.display = "block";
                        }}
                      />
                    ) : null}
                    {error ? (
                      <p style={{ ...statusTextStyle, color: "#b91c1c" }} role="alert">
                        {error}
                      </p>
                    ) : null}
                    {success ? <p style={{ ...statusTextStyle, color: "#166534" }}>{success}</p> : null}
                    <button type="submit" style={saveButtonStyle(saving)} disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
