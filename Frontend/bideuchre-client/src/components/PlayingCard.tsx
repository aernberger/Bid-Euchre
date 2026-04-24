import React from "react";
import { useState, useEffect } from "react";
import { Heart, Diamond, Club, Spade, Crown, ChessKing, ChessQueen } from "lucide-react";
import {
    playingCardButtonStyle,
    playingCardCenterIconStyle,
    playingCardHeaderStyle,
    playingCardValueStyle,
} from "./PlayingCard.styles";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface PlayingCardProperties {
    suit: Suit;
    value: string;
    disabled?: boolean;
    onClick?: () => void;
    compact?: boolean;
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



export default function PlayingCard({suit, value, disabled, onClick, compact = false}: PlayingCardProperties) {
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
            style={playingCardButtonStyle(compact, selected, Boolean(disabled))}
        >
            <div style={playingCardHeaderStyle(color)}>
                <div style={playingCardValueStyle(compact)}>{value}</div>
                <SuitIcon size={(compact ? 12 : iconSize * .33)} color={color} fill={color}/>
            </div>

            <div style={playingCardCenterIconStyle(compact, color)}>
                <FaceIcon size={compact ? 28 : iconSize} color={color} fill={color}/>
            </div>
        </button>
    );

}

