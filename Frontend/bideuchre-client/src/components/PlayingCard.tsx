import React from "react";
import { useState, useEffect } from "react";
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

const FaceCards = ["J", "Q", "K"];



export default function PlayingCard({suit, value, disabled, onClick}: PlayingCardProperties) {
    const SuitIcon = suitIcons[suit];
    const color = suitColors[suit];
    const is_face = FaceCards.includes(value);
    const FaceIcon = is_face ? faceIcons[value] : suitIcons[suit];
    const [iconSize, setIconSize] = useState(60);
    const [selected, setSelected] = React.useState(false);


    useEffect(() => {
        const updateSize = () => {
            const size = Math.min(Math.max(window.innerWidth * 0.05, 20), 60);
            setIconSize(size);
        };

        updateSize(); // run on mount
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize); // cleanup
    }, []);
    return( 
        <button
            onClick={onClick}
            disabled = {disabled}
            onMouseEnter={() => setSelected(true)}
            onMouseLeave={() => setSelected(false)}
            style={{
                width: "clamp(50px, 8vw, 150px)",
                height: "clamp(75px, 12vw, 225px)",
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
                <div style={{fontWeight: "bold", fontSize: "clamp(12px, 2vw, 24px)"}}>{value}</div>
                <SuitIcon size={iconSize * .33} color={color} fill={color}/>
            </div>

            <div style={{color: color, marginTop: "16px"}}>
                <FaceIcon size={iconSize} color={color} fill={color}/>
            </div>
        </button>
    );

}

