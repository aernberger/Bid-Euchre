import React from 'react';
import { useEffect } from 'react';
import PlayingCard from '../components/PlayingCard';
import WhiteBox from '../components/WhiteBox';
import BiddingBox from '../components/BiddingBox';
import GameBox from '../components/GameBox';
import { placeBid, connectSocket, registerGameListeners, playCard, joinGameRoom } from '../sockets/socket';
import { Bid, BidType, Suit, Card } from '../types';

const contractTypeToBidType: Record<number, BidType> = {
    0: "Low",
    1: "Suited",
    2: "High",
};

interface GameProps {
  token: string;
  user: any;
  gameId: string;
  onLeaveTable: () => void;
  onLogout: () => void;
}

export default function Game({ token, user, gameId, onLeaveTable, onLogout }: GameProps) {
    // Player's hand and which cards can be played (from server via yourHand)
    const [cards, setCards] = React.useState<{ suit: string; value: string }[]>([]);
    const [playableCards, setPlayableCards] = React.useState<{ suit: string; value: string }[]>([]);

    const [biddingPhase, setBiddingPhase] = React.useState(true);
    const [gameState, setGameState] = React.useState<any>(null);
    const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
    // State for cards currently in the center - synced from optimistic updates and server gameUpdates
    const [currentTrick, setCurrentTrick] = React.useState<Card[]>([]);

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
        // During play, public state keeps highestBid; winningBid is set at bidding end — use either.
        const bid = gameState?.winningBid ?? gameState?.highestBid;
        if (!bid || bid.tricks === 0) return null;
        const suit = bid.suitType?.toLowerCase?.();
        return {
            type: (contractTypeToBidType[bid.contractType] ?? "Low") as BidType,
            number: bid.tricks,
            suit: suit as Suit | undefined,
        };
    }, [gameState?.winningBid, gameState?.highestBid]);

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

    const opponentNames = React.useMemo(() => {
        const players = gameState?.players ?? [];
        const myIndex = players.findIndex((p: { id: string }) => p.id === myPlayerId);
        if (myIndex === -1 || players.length !== 4) {
            return { left: "—", top: "—", right: "—" };
        }
        const leftP = players[(myIndex + 1) % 4];
        const topP = players[(myIndex + 2) % 4];
        const rightP = players[(myIndex + 3) % 4];
        return {
            left: leftP?.name ?? "Player",
            top: topP?.name ?? "Player",
            right: rightP?.name ?? "Player",
        };
    }, [gameState?.players, myPlayerId]);

    // const myPlayerName = React.useMemo(() => {
    //     const players = gameState?.players ?? [];
    //     const me = players.find((p: { id: string }) => p.id === myPlayerId);
    //     return me?.name ?? "—";
    // }, [gameState?.players, myPlayerId]);

    const opponentTurnHighlight = React.useMemo(() => {
        const players = gameState?.players ?? [];
        const myIndex = players.findIndex((p: { id: string }) => p.id === myPlayerId);
        if (myIndex === -1 || players.length !== 4 || gameState?.phase !== "PLAYING") {
            return { left: false, top: false, right: false };
        }
        const leftId = players[(myIndex + 1) % 4]?.id;
        const topId = players[(myIndex + 2) % 4]?.id;
        const rightId = players[(myIndex + 3) % 4]?.id;
        return {
            left: !!currentPlayerId && leftId === currentPlayerId,
            top: !!currentPlayerId && topId === currentPlayerId,
            right: !!currentPlayerId && rightId === currentPlayerId,
        };
    }, [gameState?.players, gameState?.phase, myPlayerId, currentPlayerId]);

    // Backend seats: team 1 = indices 0 & 2, team 2 = indices 1 & 3
    const myTeamId = React.useMemo((): 1 | 2 | null => {
        const players = gameState?.players ?? [];
        const idx = players.findIndex((p: { id: string }) => p.id === myPlayerId);
        if (idx === -1) return null;
        return idx === 0 || idx === 2 ? 1 : 2;
    }, [gameState?.players, myPlayerId]);

    const contractBidRelative = React.useMemo((): "us" | "them" | null => {
        const raw = gameState?.winningBid ?? gameState?.highestBid;
        if (!raw || typeof raw.tricks !== "number" || raw.tricks === 0) return null;
        const players = gameState?.players ?? [];
        const declarerId =
            (typeof gameState?.declarerId === "string" && gameState.declarerId) ||
            (typeof raw?.bidderId === "string" && raw.bidderId) ||
            null;
        if (!declarerId || myTeamId == null) return null;
        const declarerIdx = players.findIndex((p: { id: string }) => p.id === declarerId);
        if (declarerIdx === -1) return null;
        const declarerTeamId: 1 | 2 = declarerIdx === 0 || declarerIdx === 2 ? 1 : 2;
        return declarerTeamId === myTeamId ? "us" : "them";
    }, [gameState?.winningBid, gameState?.highestBid, gameState?.declarerId, gameState?.players, myTeamId]);

    const teamScoreMap = React.useMemo(() => {
        const rows = gameState?.teamScores;
        const m = new Map<number, number>();
        if (!Array.isArray(rows)) return m;
        for (const r of rows as { teamId: number; score: number }[]) {
            if (r && typeof r.teamId === "number") m.set(r.teamId, r.score ?? 0);
        }
        return m;
    }, [gameState?.teamScores]);

    const tricksThisHand = React.useMemo(() => {
        const raw = gameState?.teamTricksThisRound;
        if (!raw || typeof raw !== "object" || myTeamId == null) return null;
        const t1 = Number((raw as Record<string, unknown>)["1"] ?? 0);
        const t2 = Number((raw as Record<string, unknown>)["2"] ?? 0);
        const ours = myTeamId === 1 ? t1 : t2;
        const theirs = myTeamId === 1 ? t2 : t1;
        return { ours, theirs };
    }, [gameState?.teamTricksThisRound, myTeamId]);

    const scoreboard = React.useMemo(() => {
        const s1 = teamScoreMap.get(1) ?? 0;
        const s2 = teamScoreMap.get(2) ?? 0;
        if (!gameState?.teamScores?.length) return null;
        if (myTeamId == null) {
            return { leftLabel: "Team 1", left: s1, rightLabel: "Team 2", right: s2 };
        }
        return {
            leftLabel: "Us",
            left: myTeamId === 1 ? s1 : s2,
            rightLabel: "Them",
            right: myTeamId === 1 ? s2 : s1,
        };
    }, [gameState?.teamScores, teamScoreMap, myTeamId]);

    const myPlayerName = React.useMemo(() => {
        const players = gameState?.players ?? [];
        const p = players.find((x: { id: string }) => x.id === myPlayerId);
        return p?.name ?? "You";
    }, [gameState?.players, myPlayerId]);

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

    useEffect(() => {
        const displayName = user?.user_metadata?.username || user?.email || "Player";

        connectSocket(token, (socketId) => {
            setMyPlayerId(socketId);
            joinGameRoom(gameId, displayName, user.id);
        });

        const unregister = registerGameListeners(
            (state: any) => {
                setGameState(state);
                setBiddingPhase(state?.phase !== "PLAYING");
                if (state?.type === "ROUND_COMPLETE" || state?.trickCompleted || state?.phase !== "PLAYING") {
                    setCurrentTrick([]);
                }
                if (state?.playedCards && Array.isArray(state.playedCards)) {
                    const faceToValue: Record<string, string> = {
                        "9": "9",
                        "10": "10",
                        Jack: "J",
                        Queen: "Q",
                        King: "K",
                        Ace: "A",
                    };
                    setCurrentTrick(
                        state.playedCards.map((c: { suit: string; face: string }) => ({
                            suit: (typeof c.suit === "string" ? c.suit.toLowerCase() : c.suit) as Suit,
                            value: faceToValue[c.face] ?? c.face,
                        }))
                    );
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
    }, [token, user, gameId]);

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
        <div
            style={{
                width: "clamp(500px, 90vw, 1000px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
            }}
        >
            <button
                type="button"
                onClick={onLeaveTable}
                style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(0,0,0,0.15)",
                    color: "#f5f5f5",
                    cursor: "pointer",
                    fontSize: "14px",
                }}
            >
                Back to tables
            </button>
            <button
                type="button"
                onClick={onLogout}
                style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    fontSize: "14px",
                }}
            >
                Log out
            </button>
        </div>
        {scoreboard ? (
            <div
                style={{
                    width: "clamp(500px, 90vw, 1000px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#f5f5f5",
                    fontSize: "16px",
                    fontWeight: 700,
                    boxSizing: "border-box",
                }}
            >
                <span>
                    {scoreboard.leftLabel}: {scoreboard.left}
                </span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>
                    {scoreboard.rightLabel}: {scoreboard.right}
                </span>
            </div>
        ) : null}
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
                contractBidRelative={contractBidRelative}
                topCount={opponentCounts.top}
                leftCount={opponentCounts.left}
                rightCount={opponentCounts.right}
                opponentNames={opponentNames}
                opponentTurnHighlight={opponentTurnHighlight}
                width="clamp(500px, 90vw, 1000px)"
                tricksThisHand={tricksThisHand}
            />
    )}
           
            <WhiteBox width="clamp(500px, 90vw, 1000px)">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        gap: "8px",
                        minWidth: 0,
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize:
                                isPlayerBiddingTurn || isPlayerPlayingTurn
                                    ? "clamp(13px, 2.2vw, 16px)"
                                    : "clamp(13px, 2.1vw, 15px)",
                            color:
                                isPlayerBiddingTurn || isPlayerPlayingTurn
                                    ? "#2563eb"
                                    : "#000000",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                        }}
                        title={myPlayerName}
                    >
                        {myPlayerName}
                    </span>
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

