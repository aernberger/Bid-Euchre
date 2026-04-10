import React from 'react';
import { useEffect } from 'react';
import PlayingCard from "../components/PlayingCard.tsx";
import WhiteBox from "../components/WhiteBox.tsx";
import BiddingBox from '../components/BiddingBox.tsx';
import GameBox from "../components/GameBox.tsx";
import { placeBid, connectSocket, registerGameListeners, playCard } from '../sockets/socket.ts';
import { Bid, BidType, Suit, Card } from '../types.js';

const contractTypeToBidType: Record<number, BidType> = {
    0: "Low",
    1: "Suited",
    2: "High",
};

export default function Game() {
    // Player's hand and which cards can be played (from server via yourHand)
    const [cards, setCards] = React.useState<{ suit: string; value: string }[]>([]);
    const [playableCards, setPlayableCards] = React.useState<{ suit: string; value: string }[]>([]);

    const [biddingPhase, setBiddingPhase] = React.useState(true);
    const [gameState, setGameState] = React.useState<any>(null);
    const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
    // State for cards currently in the center - synced from optimistic updates and server gameUpdates
    const [currentTrick, setCurrentTrick] = React.useState<Card[]>([]);

    useEffect(() => {
        connectSocket("dev", undefined, (socketId) => setMyPlayerId(socketId));
        const unregister = registerGameListeners(
            (state: any) => {
            setGameState(state);
            setBiddingPhase(state?.phase !== "PLAYING");
            // Clear center when trick/round ends or when we return to bidding.
            if (state?.type === "ROUND_COMPLETE" || state?.trickCompleted || state?.phase !== "PLAYING") {
                setCurrentTrick([]);
            }
            // Sync currentTrick from server so all players see the same cards (converts backend face→value)
            if (state?.playedCards && Array.isArray(state.playedCards)) {
                const faceToValue: Record<string, string> = {
                    "9": "9", "10": "10", "Jack": "J", "Queen": "Q", "King": "K", "Ace": "A"
                };
                setCurrentTrick(state.playedCards.map((c: { suit: string; face: string }) => ({
                    suit: (typeof c.suit === "string" ? c.suit.toLowerCase() : c.suit) as Suit,
                    value: faceToValue[c.face] ?? c.face
                })));
            }
        },
            (handData) => {
                setCards(handData.cards);
                setPlayableCards(handData.playableCards);
            }
        );
        return () => {
            unregister?.();
        };
    }, []);

    const currentPlayerId =
        gameState?.currentPlayerId ?? gameState?.nextPlayerId ?? null;
    const isPlayerBiddingTurn =
        !!myPlayerId &&
        myPlayerId === currentPlayerId &&
        gameState?.phase === "BIDDING";
    // True when it's this player's turn to play a card (playing phase only)
    const isPlayerPlayingTurn =
        !!myPlayerId &&
        myPlayerId === currentPlayerId &&
        gameState?.phase === "PLAYING";

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

    // Opponent card counts: left, top, right (you are at bottom). Players are in seat order [0,1,2,3].
    const opponentCounts = React.useMemo(() => {
        const players = gameState?.players ?? [];
        const counts = gameState?.playerHandCounts ?? {};
        const myIndex = players.findIndex((p: { id: string }) => p.id === myPlayerId);
        if (myIndex === -1 || players.length !== 4) return { left: 6, top: 6, right: 6 };
        const leftId = players[(myIndex + 1) % 4]?.id;
        const topId = players[(myIndex + 2) % 4]?.id;
        const rightId = players[(myIndex + 3) % 4]?.id;
        return {
            left: leftId ? (counts[leftId] ?? 6) : 6,
            top: topId ? (counts[topId] ?? 6) : 6,
            right: rightId ? (counts[rightId] ?? 6) : 6,
        };
    }, [gameState?.players, gameState?.playerHandCounts, myPlayerId]);

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

        const data: { tricks: number; contractType: number; suitType?: string; loner: boolean } = {
            tricks: bid.number,
            contractType: contractTypeMap[bid.type],
            loner: false
        };

        if (bid.type === "Suited" && bid.suit) {
            data.suitType = bid.suit.charAt(0).toUpperCase() + bid.suit.slice(1);
        }

        console.log("Frontend: Sending bid to socket", data);

        placeBid(data);
};


    const isCardPlayable = (card: { suit: string; value: string }) =>
        playableCards.some((p) => p.suit === card.suit && p.value === card.value);

    // Play a card by sending to server; hand/table update comes from authoritative socket events.
    const handlePlayCard = (card: Card) => {
        if (!isCardPlayable(card)) return;
        const valueToFace: Record<string, string> = {
            "9": "9", "10": "10", "J": "Jack", "Q": "Queen", "K": "King", "A": "Ace"
        };
        const face = valueToFace[card.value];
        const data: { suit: string; face: string } = {
            suit: card.suit.charAt(0).toUpperCase() + card.suit.slice(1),
            face: face
        };
        playCard(data);
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#35654d",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "16px",
            gap: "12px",
            boxSizing: "border-box",
    }}>
        {/* TOP AREA */}
    {biddingPhase ? (
            <BiddingBox
                currentHighBid={currentHighBid}
                onBidSubmit={handleBidSubmit}
                isPlayerTurn={isPlayerBiddingTurn}
            />
            ) : (
            // Pass currentTrick (not fakeTrick) so played cards show in center for all players
            <GameBox
                trumpSuit={trumpSuit}
                currentTrick={currentTrick}
                bid={winningBid}
                topCount={opponentCounts.top}
                leftCount={opponentCounts.left}
                rightCount={opponentCounts.right}
                width="clamp(500px, 90vw, 1000px)"
            />
    )}
           
            <WhiteBox width="clamp(500px, 90vw, 1000px)">
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <span>Player 1</span>
                    <span>Score: 0</span>
                </div>
                {/* Cards are clickable only when isPlayingTurn; click plays card and moves it to center */}
                <div style={{display: "flex", gap: "8px", justifyContent: "center", flex: 1}}>
                    {cards.map((card, index) => (
                        <PlayingCard
                            key={`${card.suit}-${card.value}-${index}`}
                            suit={card.suit as Suit}
                            value={card.value}
                            disabled={!isPlayerPlayingTurn || !isCardPlayable(card)}
                            onClick={() => isPlayerPlayingTurn && isCardPlayable(card) && handlePlayCard({ suit: card.suit as Suit, value: card.value })}
                        />
                    ))}
                </div>
            </WhiteBox>
        </div>
    );
}

