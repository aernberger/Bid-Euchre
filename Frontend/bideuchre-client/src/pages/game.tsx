import React from 'react';
import { useState, useEffect } from 'react';
import PlayingCard from "../components/PlayingCard.tsx";
import WhiteBox from "../components/WhiteBox.tsx";
import PlayingBox from '../components/PlayingBox.tsx';
import GameBox from "../components/GameBox.tsx";
import { placeBid, connectSocket, registerGameListeners } from '../sockets/socket.ts';
import { Contract } from "../services/contract.js";
import Trick from "../models/trick.js";

export default function Game() {
    const [cards, setCards] = React.useState([
        {suit: "hearts", value: "3", disabled:true},
        {suit: "diamonds", value: "Q"},
        {suit: "clubs", value: "J"},
        {suit: "spades", value: "K"},
        {suit: "diamonds", value: "Q"},
        {suit: "diamonds", value: "Q"},
    ]);

    type BidType = "Low" | "Suited" | "High";
    type Suit = "hearts" | "diamonds" | "clubs" | "spades";

    interface Bid {
        type: BidType;
        number: number;
    }

    const [biddingPhase, setBiddingPhase] = React.useState(true);
    const [playingPhase, setPlayingPhase] = React.useState(false);
    const [gameState, setGameState] = React.useState<any>(null);

    useEffect(() => {
        connectSocket("dev");
        registerGameListeners((state: any) => {
            setGameState(state);
            if (state?.phase === "PLAYING") {
                setBiddingPhase(false);
                setPlayingPhase(true);
            }
        });
    }, []);

    const contractTypeToBidType: Record<number, BidType> = {
        0: "Low",
        1: "Suited",
        2: "High",
    };

    const currentHighBid: Bid | null = React.useMemo(() => {
        const bid = gameState?.highestBid ?? gameState?.winningBid;
        if (!bid || bid.tricks === 0) return null;
        return {
            type: contractTypeToBidType[bid.contractType] ?? "Low",
            number: bid.tricks,
        };
    }, [gameState?.highestBid, gameState?.winningBid]);

    const winningBid = React.useMemo(() => {
        const bid = gameState?.winningBid;
        if (!bid || bid.tricks === 0) return null;
        const suit = bid.suitType?.toLowerCase?.();
        return {
            type: (contractTypeToBidType[bid.contractType] ?? "Low") as BidType,
            number: bid.tricks,
            suit: suit as Suit | undefined,
        };
    }, [gameState?.winningBid]);

    const trumpSuit = React.useMemo(() => {
        if (!winningBid?.suit) return undefined;
        return winningBid.suit as Suit;
    }, [winningBid]);

    const fakeTrick = [
        { suit: "hearts" as Suit, value: "3" },
        { suit: "clubs" as Suit, value: "7" },
    ];

    const handleBidSubmit = (bid: Bid) => {

    console.log("Frontend: Bid button clicked", bid);

    const contractTypeMap: Record<BidType, number> = {
        Low: 0,
        Suited: 1,
        High: 2
    };

    // PASS
    if (bid.number === 0) {
        console.log("Frontend: Player passed");

        placeBid({
            tricks: 0,
            contractType: 0
        });

        return;
    }

    const data = {
        tricks: bid.number,
        contractType: contractTypeMap[bid.type],
        loner: false
    };

    console.log("Frontend: Sending bid to socket", data);

    placeBid(data);
};

    // const handleBidSubmit = (bid: Bid) => {
    //     // console.log("Bid submitted:", bid);
    //     // setBiddingPhase(false);
    //     // setPlayingPhase(true);
    // //     if (bid.number === 0) {
    // //     placeBid({
    // //         tricks: 0,
    // //         contractType: 0
    // //     });
    // //     return;
    // // }

    // // const contractTypeMap = {
    // //     Low: 0,
    // //     Suited: 1,
    // //     High: 2
    // // };

    // // placeBid({
    // //     tricks: bid.number,
    // //     contractType: contractTypeMap[bid.type],
    // //     loner: false
    // console.log("Frontend: Bid button clicked", bid);

    //     const contractTypeMap: Record<string, number> = {
    //         Low: 0,
    //         Suited: 1,
    //         High: 2
    //     };

    //     if (bid.number === 0) {
    //         console.log("Frontend: Player passed");

    //         placeBid({
    //             tricks: 0,
    //             contractType: 0
    //         });

    //         return;
    //     }
    // };

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
        {/* TOP AREA */}
    {biddingPhase ? (
            <PlayingBox
                biddingPhase={true}
                playingPhase={false}
                currentHighBid={currentHighBid}
                onBidSubmit={handleBidSubmit}
                currentTrick={fakeTrick}
                trumpSuit={trumpSuit}
                isPlayerTurn={true}
            />
            ) : (
            <GameBox
                trumpSuit={trumpSuit}
                currentTrick={fakeTrick}
                bid={winningBid}
                topCount={6}
                leftCount={6}
                rightCount={6}
            />
    )}
           
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

