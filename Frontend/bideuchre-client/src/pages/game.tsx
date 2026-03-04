import React from 'react';
import { useState } from 'react';
import PlayingCard from "../components/PlayingCard.tsx";
import WhiteBox from "../components/WhiteBox.tsx";
import PlayingBox from '../components/PlayingBox.tsx';

export default function Game() {
    const [cards, setCards] = React.useState([
        {suit: "hearts", value: "3", disabled:true},
        {suit: "diamonds", value: "Q"},
        {suit: "clubs", value: "J"},
        {suit: "spades", value: "K"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
    ]);

    const [biddingPhase, setBiddingPhase] = React.useState(true);
    const [playingPhase, setPlayingPhase] = React.useState(false);

    const fakeTrick = [
        { suit: "hearts" as Suit, value: "3" },
        { suit: "clubs" as Suit, value: "7" },
    ];

    const handleBidSubmit = (bid: Bid) => {
        console.log("Bid submitted:", bid);
        setBiddingPhase(false);
        setPlayingPhase(true);
    };

    const handleCardClick = (index: number) => {
        console.log("Card clicked:", index);
    };


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
            <PlayingBox
                biddingPhase={biddingPhase}
                playingPhase={playingPhase}
                hand={cards}
                onCardClick={handleCardClick}
                currentHighBid={{ type: "Suited", number: 3 }}
                onBidSubmit={handleBidSubmit}
                currentTrick={fakeTrick}
                trumpSuit="hearts"
                isPlayerTurn={true}
            />
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

