import React from "react";
import WhiteBox from "./WhiteBox";
import PlayingCard from "./PlayingCard";
import CardBack from "./CardBack";
import { statPill } from "../ui/statPill";
import { Bid, Card } from '../types';

interface GameBoxProperties {
  currentTrick: Card[];
  bid: Bid | null;
  /** Declarer display name for the contract line (pill color still uses contractBidRelative). */
  declarerName?: string | null;
  contractBidRelative?: "us" | "them" | null;
  leftCount?: number;
  topCount?: number;
  rightCount?: number;
  opponentNames?: { left: string; top: string; right: string };
  /** Only the current player’s seat is colored: blue = you/partner, red = opponent. */
  seatTurnTone?: { left: "idle" | "red" | "blue"; top: "idle" | "blue" | "red"; right: "idle" | "red" | "blue" };
  width?: string;
  /** Tricks taken this hand (playing phase only), from the player’s perspective. */
  tricksThisHand?: { ours: number; theirs: number } | null;
}

function possessiveBidHeading(name: string | null | undefined): string {
  const t = typeof name === "string" ? name.trim() : "";
  if (!t) return "Bid";
  return /s$/i.test(t) ? `${t}' bid` : `${t}'s bid`;
}

function formatBidSummary(bid: Bid | null): string {
  if (!bid) return "None";
  const lonerTag = bid.loner && bid.number === 6 ? " (Loner)" : "";
  if (bid.type === "Suited" && bid.suit) {
    const s = bid.suit;
    const suitWord = s.charAt(0).toUpperCase() + s.slice(1);
    return `${suitWord} ${bid.number}${lonerTag}`;
  }
  return `${bid.type} ${bid.number}${lonerTag}`;
}

export default function GameBox({
    currentTrick,
    bid,
    declarerName = null,
    contractBidRelative = null,
    leftCount = 6,
    topCount = 6,
    rightCount = 6,
    opponentNames = { left: "—", top: "—", right: "—" },
    seatTurnTone = { left: "idle", top: "idle", right: "idle" },
    width = "clamp(500px, 90vw, 1000px)",
    tricksThisHand = null,
}: GameBoxProperties) {

  const bidHeading = possessiveBidHeading(declarerName);

  const bidPillVariant: "blue" | "red" | "neutral" =
    contractBidRelative === "us" ? "blue" : contractBidRelative === "them" ? "red" : "neutral";

  const stackOverlap = 8;
  const sideStackOverlap = 10;

  const namePillStyle = (
    seat: "left" | "top" | "right",
    tone: "idle" | "blue" | "red"
  ): React.CSSProperties => {
    const isBlueSeat = seat === "top";
    const activeTone = isBlueSeat ? "blue" : "red";
    const variant = tone === activeTone ? activeTone : "neutral";
    const size = tone === activeTone ? "md" : "sm";
    const textColor = isBlueSeat ? "#2563eb" : "#dc2626";
    return statPill(variant, size, {
      fontWeight: 600,
      color: textColor,
      textAlign: "center",
      maxWidth: "min(120px, 22vw)",
    });
  };

  return (
    <WhiteBox
      height={"min(75vh, 480px)"}
      width={width}
    >
        {/*this part uses the CSS grid*/}
      <div
        style={{
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
        }}
      >
        {/* TOP OPPONENT - name + stacked cards */}
        <div
          style={{
            gridColumn: "2",
            gridRow: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <span style={namePillStyle("top", seatTurnTone.top)} title={opponentNames.top}>
            {opponentNames.top}
          </span>
          <div
            style={{
              position: "relative",
              width: "clamp(75px, 8vw, 95px)",
              height: "clamp(45px, 7vw, 110px)",
            }}
          >
            {Array.from({ length: topCount }).map((_, i) => (
              <div key={`top-${i}`} style={{ position: "absolute", left: i * stackOverlap, top: 0 }}>
                <CardBack />
              </div>
            ))}
          </div>
        </div>

        {/* LEFT OPPONENT - name + stacked cards */}
        <div
          style={{
            gridColumn: "1",
            gridRow: "2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            alignSelf: "center",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <span style={namePillStyle("left", seatTurnTone.left)} title={opponentNames.left}>
            {opponentNames.left}
          </span>
          <div
            style={{
              position: "relative",
              width: "clamp(70px, 10vw, 120px)",
              height: "clamp(70px, 10vw, 130px)",
            }}
          >
            {Array.from({ length: leftCount }).map((_, i) => (
              <div key={`left-${i}`} style={{ position: "absolute", left: "50%", top: i * sideStackOverlap, transform: "translateX(-50%) rotate(-90deg)", transformOrigin: "center" }}>
                <CardBack />
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — contract + trick in progress */}
        <div
          style={{
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
          }}
        >
        <div
          style={statPill(bidPillVariant, "lg", {
            fontWeight: 800,
            whiteSpace: "normal",
            textAlign: "center",
            maxWidth: "min(100%, 320px)",
          })}
        >
            {bidHeading}: {formatBidSummary(bid)}
        </div>

          {tricksThisHand ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6b7280",
                  letterSpacing: "0.02em",
                }}
              >
                Tricks this hand
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={statPill("blue", "md")}>Blue team {tricksThisHand.ours}</span>
                <span style={statPill("red", "md")}>Red team {tricksThisHand.theirs}</span>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", minWidth: 0, maxWidth: "100%" }}>
            {currentTrick.length === 0 ? (
              <span style={statPill("neutral", "sm", { fontWeight: 600 })}>(No cards played yet)</span>
            ) : (
              currentTrick.map((card, idx) => (
                <div key={`trick-${idx}`}>
                  <PlayingCard suit={card.suit} value={card.value} disabled={true} compact />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT OPPONENT - name + stacked cards */}
        <div
          style={{
            gridColumn: "3",
            gridRow: "2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            alignSelf: "center",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <span style={namePillStyle("right", seatTurnTone.right)} title={opponentNames.right}>
            {opponentNames.right}
          </span>
          <div
            style={{
              position: "relative",
              width: "clamp(70px, 10vw, 120px)",
              height: "clamp(70px, 10vw, 130px)",
            }}
          >
            {Array.from({ length: rightCount }).map((_, i) => (
              <div key={`right-${i}`} style={{ position: "absolute", left: "50%", top: i * sideStackOverlap, transform: "translateX(-50%) rotate(90deg)", transformOrigin: "center" }}>
                <CardBack />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row intentionally empty (your hand is in the separate WhiteBox below) */}
      </div>
    </WhiteBox>
  );
}