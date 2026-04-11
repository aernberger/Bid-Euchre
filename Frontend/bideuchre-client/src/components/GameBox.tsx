import React from "react";
import WhiteBox from "./WhiteBox";
import PlayingCard from "./PlayingCard";
import CardBack from "./CardBack";
import { Bid, BidType, Suit, Card } from '../types';

interface GameBoxProperties {
  trumpSuit?: Suit;
  currentTrick: Card[];
  bid: Bid | null;
  leftCount?: number;
  topCount?: number;
  rightCount?: number;
  opponentNames?: { left: string; top: string; right: string };
  opponentTurnHighlight?: { left: boolean; top: boolean; right: boolean };
  width?: string;
}

export default function GameBox({
    trumpSuit,
    currentTrick,
    bid,
    leftCount = 6,
    topCount = 6,
    rightCount = 6,
    opponentNames = { left: "—", top: "—", right: "—" },
    opponentTurnHighlight = { left: false, top: false, right: false },
    width = "clamp(500px, 90vw, 1000px)",
}: GameBoxProperties) {

  const stackOverlap = 8;
  const sideStackOverlap = 10;

  const nameStyle = (isTheirTurn: boolean): React.CSSProperties => ({
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 14px)",
    color: isTheirTurn ? "#2563eb" : "#000000",
    textAlign: "center",
    maxWidth: "min(120px, 22vw)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });

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
          <span style={nameStyle(opponentTurnHighlight.top)} title={opponentNames.top}>
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
          <span style={nameStyle(opponentTurnHighlight.left)} title={opponentNames.left}>
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

        {/* CENTER (this is where the trump suit will be displayed) this will be col 2 middle and row 2 middle */}
        <div
          style={{
            gridColumn: "2",
            gridRow: "2",
            width: "100%",
            height: "100%",
            minWidth: 0,
            overflow: "hidden",
            border: "1px solid #ddd",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "12px",
            boxSizing: "border-box",
          }}
        >
        <div style={{ fontWeight: 800, fontSize: "18px" }}>
            Bid: {bid ? `${bid.type} ${bid.number}` : "None"}
        </div>

<div style={{ fontWeight: 700, fontSize: "16px", opacity: 0.9 }}>
  Trump: {trumpSuit ?? "Not set"}
</div>

          <div style={{ fontWeight: 600 }}>Current Trick</div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", minWidth: 0, maxWidth: "100%" }}>
            {currentTrick.length === 0 ? (
              <div style={{ opacity: 0.6 }}>(No cards played yet)</div>
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
          <span style={nameStyle(opponentTurnHighlight.right)} title={opponentNames.right}>
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