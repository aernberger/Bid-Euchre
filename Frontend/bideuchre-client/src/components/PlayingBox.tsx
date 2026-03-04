import React from 'react';
import { useState } from 'react';
import PlayingCard from "./PlayingCard.tsx";
import WhiteBox from "./WhiteBox.tsx";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface Card {
    suit: Suit;
    value: string;
    disabled?: boolean;
}

interface PlayingBoxProperties {
    biddingPhase: boolean;
    playingPhase: boolean;

    currentHighBid: number;
    onBidSubmit: (bid: number) => void;

    currentTrick: Card[];
    trumpSuit?: Suit;
    isPlayerTurn: boolean;
}

export default function PlayingBox({
    biddingPhase,
    playingPhase,
    currentHighBid,
    onBidSubmit,
    currentTrick,
    trumpSuit,
    isPlayerTurn
}: PlayingBoxProperties) {
    const [selectedBid, setSelectedBid] = useState<number | null>(null);

    return (
        <WhiteBox height={"clamp(333px, 45vh, 625px)"}>
            {biddingPhase && (
                <div>
                    <h3>Current Highest Bid: {currentHighBid}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {["Low", "Suited", "High"].map((bid) => (
                            <button
                                key={bid}
                                onClick={() => setSelectedBid(bid === "Pass" ? 0 : bid as number)}
                                style={{ fontWeight: selectedBid === bid ? "bold" : "normal" }}
                            >
                                {bid}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5, 6].map((bid) => (
                            <button
                                key={bid}
                                onClick={() => setSelectedBid(bid === "Pass" ? 0 : bid as number)}
                                style={{ fontWeight: selectedBid === bid ? "bold" : "normal" }}
                            >
                                {bid}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                            disabled={selectedBid === null}
                            onClick={() => selectedBid !== null && onBidSubmit(selectedBid)}
                        >
                            Confirm Bid
                        </button>
                        <button onClick={() => onBidSubmit(0)}>
                            Pass
                        </button>
                    </div>
                </div>
            )}

            {playingPhase && (
                <div>
                    <h3>Trump: {trumpSuit ?? "Not set"}</h3>
                    <div>
                        <h4>Current Trick</h4>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {currentTrick.map((card, index) => (
                                <PlayingCard
                                    key={index}
                                    suit={card.suit}
                                    value={card.value}
                                    disabled={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </WhiteBox>
    );
}