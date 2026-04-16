import React from 'react';
import { useState } from 'react';
import WhiteBox from "./WhiteBox";
import { Bid, BidType, Suit } from '../types';


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

    const chipStyle = (active: boolean, disabled = false): React.CSSProperties => ({
        padding: "8px 12px",
        borderRadius: "999px",
        border: disabled
            ? "1px solid #e5e7eb"
            : active
                ? "1px solid #2563eb"
                : "1px solid #d1d5db",
        backgroundColor: disabled ? "#f3f4f6" : active ? "#dbeafe" : "#ffffff",
        color: disabled ? "#9ca3af" : "#1f2937",
        fontWeight: active ? 700 : 500,
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
    });

    return (
        <WhiteBox height={"clamp(333px, 45vh, 625px)"} width="clamp(500px, 90vw, 1000px)">
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                            width: "100%",
                            maxWidth: "680px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "clamp(15px, 2vw, 18px)",
                                fontWeight: 700,
                                color: isPlayerTurn ? "#1d4ed8" : "#374151",
                            }}
                        >
                            {isPlayerTurn ? "Your turn to bid" : "Waiting for your turn to bid"}
                        </div>
                        <div style={{ fontWeight: 600, opacity: 0.9 }}>
                            Current Highest: {currentHighBid ? `${currentHighBid.type} ${currentHighBid.number}` : "None"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "680px", alignItems: "center" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.75 }}>Contract Type</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                        {["Low", "Suited", "High"].map((bid) => (
                            (() => {
                                const disabled = !isPlayerTurn;
                                return (
                            <button
                                key={bid}
                                disabled={disabled}
                                onClick={() => setSelectedType(bid as BidType)}
                                style={chipStyle(selectedType === bid, disabled)}
                            >
                                {bid}
                            </button>
                                );
                            })()
                        ))}
                        </div>
                    </div>

                    {needsSuit && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "680px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, opacity: 0.75 }}>Choose trump suit:</span>
                            {(["hearts", "spades", "diamonds", "clubs"] as Suit[]).map((suit) => (
                                (() => {
                                    const disabled = !isPlayerTurn;
                                    return (
                                <button
                                    key={suit}
                                    disabled={disabled}
                                    onClick={() => setSelectedSuit(suit)}
                                    style={chipStyle(selectedSuit === suit, disabled)}
                                >
                                    {suit.charAt(0).toUpperCase() + suit.slice(1)}
                                </button>
                                    );
                                })()
                            ))}
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "680px", alignItems: "center" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.75 }}>Tricks</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                            const anyTypeValid = (["Low", "Suited", "High"] as BidType[]).some(
                                (t) => isBidValid(t, num, currentHighBid)
                            );
                            return (
                                <button
                                    key={num}
                                    disabled={!isPlayerTurn || !anyTypeValid}
                                    onClick={() => setSelectedNumber(num)}
                                    style={chipStyle(selectedNumber === num, !isPlayerTurn || !anyTypeValid)}
                                >
                                    {num}
                                </button>
                            );
                        })}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "680px" }}>
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
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #1d4ed8",
                                backgroundColor: !isPlayerTurn || !canConfirm ? "#bfdbfe" : "#2563eb",
                                color: "#ffffff",
                                fontWeight: 700,
                                cursor: !isPlayerTurn || !canConfirm ? "not-allowed" : "pointer",
                            }}
                        >
                            Confirm Bid
                        </button>
                        <button
                            disabled={!isPlayerTurn}
                            onClick={() => onBidSubmit({ type: "Low", number: 0 })}
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#374151",
                                fontWeight: 600,
                                cursor: !isPlayerTurn ? "not-allowed" : "pointer",
                            }}
                        >
                            Pass
                        </button>
                    </div>
                </div>
        </WhiteBox>
    );
}