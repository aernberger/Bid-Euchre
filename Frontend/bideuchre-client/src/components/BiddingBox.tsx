import React from 'react';
import { useState } from 'react';
import PlayingCard from "./PlayingCard";
import WhiteBox from "./WhiteBox";
import { placeBid } from '../sockets/socket';
import { Bid, BidType, Suit, Card } from '../types';


interface BiddingBoxProperties {
    currentHighBid: Bid | null;
    onBidSubmit: (bid: Bid) => void;
    isPlayerTurn: boolean;
}

const bidTypeRank: Record<BidType, number> = {
    Low: 0,
    Suited: 1,
    High: 2,
};

function isBidValid(type: BidType, number: number, currentHighBid: Bid | null): boolean {
    if (!currentHighBid) return true;
    if (number > currentHighBid.number) return true;
    if (number === currentHighBid.number && bidTypeRank[type] > bidTypeRank[currentHighBid.type]) return true;
    return false;
}

export default function BiddingBox({
    currentHighBid,
    onBidSubmit,
    isPlayerTurn
}: BiddingBoxProperties) {
    const [selectedType, setSelectedType] = useState<BidType | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

    const needsSuit = selectedType === "Suited";
    const hasSuit = !needsSuit || selectedSuit !== null;
    const canConfirm = selectedType !== null && selectedNumber !== null && hasSuit
        && isBidValid(selectedType, selectedNumber, currentHighBid);

    return (
        <WhiteBox height={"clamp(333px, 45vh, 625px)"}>
                <div>
                    <h3>
                        {isPlayerTurn ? "Your turn to bid" : "Waiting for your turn to bid"}
                    </h3>
                    <h3>Current Highest Bid: {currentHighBid ? `${currentHighBid.type} ${currentHighBid.number}` : "None"}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {["Low", "Suited", "High"].map((bid) => (
                            <button
                                key={bid}
                                disabled={!isPlayerTurn}
                                onClick={() => setSelectedType(bid as BidType)}
                                style={{ fontWeight: selectedType === bid ? "bold" : "normal" }}
                            >
                                {bid}
                            </button>
                        ))}
                    </div>
                    {needsSuit && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                            <span>Choose trump suit:</span>
                            {(["hearts", "spades", "diamonds", "clubs"] as Suit[]).map((suit) => (
                                <button
                                    key={suit}
                                    disabled={!isPlayerTurn}
                                    onClick={() => setSelectedSuit(suit)}
                                    style={{ fontWeight: selectedSuit === suit ? "bold" : "normal" }}
                                >
                                    {suit.charAt(0).toUpperCase() + suit.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                            const anyTypeValid = (["Low", "Suited", "High"] as BidType[]).some(
                                (t) => isBidValid(t, num, currentHighBid)
                            );
                            return (
                                <button
                                    key={num}
                                    disabled={!isPlayerTurn || !anyTypeValid}
                                    onClick={() => setSelectedNumber(num)}
                                    style={{ fontWeight: selectedNumber === num ? "bold" : "normal" }}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                            disabled={!isPlayerTurn || !canConfirm}
                            onClick={() => {
                                if (selectedType && selectedNumber) {
                                    const bid: Bid = { type: selectedType, number: selectedNumber };
                                    if (selectedType === "Suited" && selectedSuit) {
                                        bid.suit = selectedSuit;
                                    }
                                    onBidSubmit(bid);
                                }
                            }}
                        >
                            Confirm Bid
                        </button>
                        <button
                            disabled={!isPlayerTurn}
                            onClick={() => onBidSubmit({ type: "Low", number: 0 })}
                        >
                            Pass
                        </button>
                    </div>
                </div>
        </WhiteBox>
    );
}