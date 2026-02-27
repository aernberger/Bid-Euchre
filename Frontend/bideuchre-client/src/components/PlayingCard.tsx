import React from "react";
import { useState } from 'react'
import { Heart, Diamond, Club, Spade, Crown, ChessKing, ChessQueen } from "lucide-react";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface PlayingCardProperties {
    suit: Suit;
    value: string;
    disabled?: boolean;
    onClick?: () => void;

}

const suitIcons = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
}

const faceIcons = {
    J: Crown,
    Q: ChessQueen,
    K: ChessKing
}

const suitColors = {
    hearts: "red",
    diamonds: "red",
    clubs: "black",
    spades: "black"
}

const face_cards = ["J", "Q", "K"];

export default function PlayingCard({suit, value, disabled, onClick}: PlayingCardProperties) {
    const SuitIcon = suitIcons[suit];
    const color = suitColors[suit];
    const is_face = face_cards.includes(value);
    const FaceIcon = is_face ? faceIcons[value] : suitIcons[suit];
    const [selected, setSelected] = React.useState(false);

    return( 
        <button
            onClick={onClick}
            disabled = {disabled}
            onMouseEnter={() => setSelected(true)}
            onMouseLeave={() => setSelected(false)}
            style={{
                width: "100px",
                height: "150px",
                border: selected ? "3px solid blue" : "2px solid black",
                borderRadius: "8px",
                backgroundColor: "White",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px",

            }}
        >
            <div style={{color: color, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%"}}>
                <div style={{fontWeight: "bold"}}>{value}</div>
                <SuitIcon size={20} />
            </div>

            <div style={{color: color, marginTop: "16px"}}>
                <FaceIcon size={60} />
            </div>
                    

        </button>
    );

}

