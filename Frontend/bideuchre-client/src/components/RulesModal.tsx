import React from "react";
import {
    rulesCloseButtonStyle,
    rulesGridStyle,
    rulesHeaderStyle,
    rulesModalBackdropStyle,
    rulesModalStyle,
    rulesTitleStyle,
} from "./RulesModal.styles";

type RulesModalProps = {
    onClose: () => void;
};

export default function RulesModal({ onClose }: RulesModalProps) {
    return (
        <div style={rulesModalBackdropStyle} onClick={onClose}>
            <div style={rulesModalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={rulesHeaderStyle}>
                    <h2 style={rulesTitleStyle}>BID EUCHRE RULES (Play to 21)</h2>
                    <button type="button" onClick={onClose} style={rulesCloseButtonStyle}>
                        Close
                    </button>
                </div>

                <div style={rulesGridStyle}>
                    <div><strong>Players</strong></div>
                    <div>Four players form two teams of two partners.</div>
                    <div>Partners sit directly across from each other.</div>

                    <div><strong>Deck and Dealing</strong></div>
                    <div>The deck has 24 cards: 9 through Ace.</div>
                    <div>Each player receives six cards each hand.</div>

                    <div><strong>Winning and Scoring</strong></div>
                    <div>First team to 21 points wins the game.</div>
                    <div>Making your bid earns points equal to the bid value.</div>
                    <div>Failing your bid loses points equal to the bid value.</div>
                    <div>Defenders earn one point for each trick won.</div>

                    <div><strong>Bidding</strong></div>
                    <div>Bidding starts with the player left of the dealer.</div>
                    <div>Each player either bids zero to six tricks or passes.</div>
                    <div>There is no minimum opening bid.</div>
                    <div>The highest bidder chooses High, Low, or Suited contract.</div>
                    <div>The bidding team must meet its announced trick target.</div>

                    <div><strong>Card Ranking</strong></div>
                    <div>Suited trump order: Right Bower, Left Bower, A, K, Q, 10, 9.</div>
                    <div>High no-trump order: A, K, Q, J, 10, 9.</div>
                    <div>Low no-trump order: 9, 10, J, Q, K, A.</div>

                    <div><strong>Contracts</strong></div>
                    <div>Suited: bidder names trump, and trump beats every non-trump card.</div>
                    <div>High: no trump, and high cards win tricks.</div>
                    <div>Low: no trump, and low cards win tricks.</div>
                    <div>Low contract goal is taking as few tricks as possible.</div>

                    <div><strong>Playing Tricks</strong></div>
                    <div>The player left of dealer leads the first trick.</div>
                    <div>You must follow the led suit when possible.</div>
                    <div>If void in led suit, you may play any card.</div>
                    <div>Suited trick winner: highest trump, otherwise highest card of led suit.</div>
                    <div>High trick winner: highest card in the led suit.</div>
                    <div>Low trick winner: lowest card in the led suit.</div>
                </div>
            </div>
        </div>
    );
}
