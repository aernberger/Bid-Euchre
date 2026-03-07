import React from "react";
import WhiteBox from "./WhiteBox.tsx";
import PlayingCard from "./PlayingCard.tsx";
import CardBack from "./CardBack.tsx";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";
type Card = { suit: Suit; value: string };
type BidType = "Low" | "Suited" | "High";

interface Bid {
    type: BidType;
    number: number;
}

interface GameBoxProperties {
  trumpSuit?: Suit;
  currentTrick: Card[];
  bid: Bid | null;
  leftCount?: number; // number of cards on the left side of the game
  topCount?: number; // number of cards on the side across from the player's side
  rightCount?: number; // number of cards on the right side of the game
}

export default function GameBox({
    trumpSuit,
    currentTrick,
    bid,
    leftCount = 6,
    topCount = 6,
    rightCount = 6,
}: GameBoxProperties) {

const sideSlotStyle = {
        width: "clamp(40px, 6vw, 90px)",
        height: "clamp(60px, 9vw, 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };


  return (
    <WhiteBox
      height={"clamp(333px, 45vh, 625px)"}
      width={"clamp(533px, 60vw, 1200px)"}
    >
        {/*this part uses the CSS grid*/}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          overflow: "hidden",
          gridTemplateColumns: "1fr 2fr 1fr",
          gridTemplateRows: "1fr 2fr 1fr",
          gap: "12px",
          alignItems: "center",
          justifyItems: "center",
          padding: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* TOP OPPONENT (this will be in col 2 (middle) and row 1*/}
        <div style={{ gridColumn: "2", gridRow: "1", display: "flex", gap: "8px" }}>
          {Array.from({ length: topCount }).map((_, i) => (
            <div key={`top-${i}`}> {/*Wrapper Div so Reach can keep track of list items*/}
              <CardBack />
            </div>
          ))}
        </div>

        {/* LEFT OPPONENT (this will be in col 1 and row 2 (middle)) */}
        <div
            style={{
                gridColumn: "1",
                gridRow: "2",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly", // spreads them out
                height: "100%",                 // fills the whole grid cell
              }}
            >
            {Array.from({ length: leftCount }).map((_, i) => (
                <div key={`left-${i}`} style={sideSlotStyle}>
                <div style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}>
                    <CardBack />
                </div>
                </div>
            ))}
        </div>

        {/* CENTER (this is where the trump suit will be displayed) this will be col 2 middle and row 2 middle */}
        <div
          style={{
            gridColumn: "2",
            gridRow: "2",
            width: "100%",
            height: "100%",
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
            <div style={{ color: "red", fontSize: "28px", fontWeight: 900 }}>
            CENTER TEST
            </div>
        <div style={{ fontWeight: 800, fontSize: "18px" }}>
            Bid: {bid ? `${bid.type} ${bid.number}` : "None"}
        </div>

<div style={{ fontWeight: 700, fontSize: "16px", opacity: 0.9 }}>
  Trump: {trumpSuit ?? "Not set"}
</div>

          <div style={{ fontWeight: 600 }}>Current Trick</div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {currentTrick.length === 0 ? (
              <div style={{ opacity: 0.6 }}>(No cards played yet)</div>
            ) : (
              currentTrick.map((card, idx) => (
                <div key={`trick-${idx}`}>
                  <PlayingCard suit={card.suit} value={card.value} disabled={true} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT OPPONENT (this will be in col 3 row 2 (middle)) */}
       <div
            style={{
                gridColumn: "3",
                gridRow: "2",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly",
                height: "100%",
              }}
            >
            {Array.from({ length: rightCount }).map((_, i) => (
                <div key={`right-${i}`} style={sideSlotStyle}>
                <div style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
                    <CardBack />
                </div>
                </div>
            ))}
        </div>

        {/* Bottom row intentionally empty (your hand is in the separate WhiteBox below) */}
      </div>
    </WhiteBox>
  );
}