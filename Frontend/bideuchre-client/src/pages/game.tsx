import React from 'react';
import { useState } from 'react';
import PlayingCard from "../components/PlayingCard.tsx";
import WhiteBox from "../components/WhiteBox.tsx";

export default function Game() {
    const [cards, setCards] = React.useState([
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
    ]);

    const removeCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    return (
        <div>
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
                            onClick={() => removeCard(index)}
                        />
                    ))}
                </div>
            </WhiteBox>
        </div>
    );
}

