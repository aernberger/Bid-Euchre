import React from "react";
import { Heart, Diamond, Club, Spade, Divide} from "lucide-react";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface PlayingCardProperties {
    suit: Suit;
    value: string;
    disabled?: boolean;
    selected?: boolean;
    onClick?: () => void;

}

const suitIcons = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
}

const suitColors = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-gray-900",
    spades: "text-gray-900"
}

export default function PlayingCard({suit, value, disabled, selected, onClick}: PlayingCardProperties) {
    const SuitIcon = suitIcons[suit];
    const color = suitColors[suit];

    return( 
        <button
            onClick={onClick}
            disabled = {disabled}
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
                <SuitIcon size={60} />
            </div>
                    

        </button>
    );

}

