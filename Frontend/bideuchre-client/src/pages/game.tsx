import React from 'react';
import { useState } from 'react';
import PlayingCard from "../components/PlayingCard.tsx";
import WhiteBox from "../components/WhiteBox.tsx";

export default function Game() {
    const [cards, setCards] = React.useState([
        {suit: "hearts", value: "3", disabled:true},
        {suit: "diamonds", value: "Q"},
        {suit: "clubs", value: "J"},
        {suit: "spades", value: "K"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
    ]);

    const removeCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    return (
        <div style={{
            minHeight: "100vh",           // full screen height
            backgroundColor: "#35654d",   // pool felt green
            display: "flex",
            flexDirection: "column",
            alignItems: "center",         // center horizontally
            justifyContent: "center",     // center vertically
            padding: "16px",
    }}>
            <WhiteBox>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <span>Player 1</span>
                    <span>Score: 0</span>
                </div>
                <div style={{display: "flex", gap: "8px", justifyContent: "center", flex: 1}}>
                    {cards.map((card, index) => (
                        <PlayingCard
                            key={index}
                            suit={card.suit as Suit}
                            value={card.value}
                            disabled={card.disabled}
                            onClick={() => removeCard(index)}
                        />
                    ))}
                </div>
            </WhiteBox>
        </div>
    );
}

