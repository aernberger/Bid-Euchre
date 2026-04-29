import React from 'react';
import {
  rulesCloseButtonStyle,
  rulesGridStyle,
  rulesHeaderStyle,
  rulesModalBackdropStyle,
  rulesModalStyle,
  rulesTitleStyle,
} from './RulesModal.styles';

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
          <div>
            <strong>Players</strong>
          </div>
          <div>Four players form two teams of two partners.</div>
          <div>Partners sit directly across from each other.</div>

          <div>
            <strong>Deck and Dealing</strong>
          </div>
          <div>The deck has 24 cards: 9 through Ace.</div>
          <div>Each player receives six cards each hand.</div>

          <div>
            <strong>Bidding</strong>
          </div>
          <div>A bid is the number of tricks a player thinks their team will win given a contract (explained below)</div>
          A trick is a round of play in which each player plays one card, and the highest card wins the trick.
          <div>Bidding starts with the player left of the dealer.</div>
          <div>The first player must make a bid.</div>
          <div>Each player must bid higher than the current highest bid, or pass.</div>
          <div>The team with the highest must meet its announced trick target.</div>

          <div>
            <strong>Contracts</strong>
          </div>
          <div>There are three different cotract types: High, Suited, and Low (They are ranked in that order)</div>
          <div>High: no trump, and high cards win tricks. Card ranking is A, K, Q, J, 10, 9.</div>
          <div>Suited: normal euchre rules; bidder names trump, and trump beats every non-trump card. Card raking is:</div>
          <div>Jack of trump (right bower), The Jack of the suit that matches trump's color (left bower), the rest of the trump in rank order, all non-trump cards in rank order</div>
          <div>Low: no trump, and low cards win tricks. Card ranking is 9, 10, J, Q, K, A.</div>
          
          <div>
            <strong>Playing</strong>
          </div>
          <div>The player left of dealer leads the first trick.</div>
          <div>You must follow the led suit when possible.</div>
          <div>If void in led suit, you may play any card.</div>
          <div>High trick winner: highest card in the led suit.</div>
          <div>Suited trick winner: highest trump, otherwise highest card of led suit.</div>
          <div>Low trick winner: lowest card in the led suit.</div>
        

        <div>
            <strong>Winning and Scoring</strong>
          </div>
          <div>Meeting or exceeding your bid's trick target earns points equal to the bid value.</div>
          <div>Failing your bid loses points equal to the bid value.</div>
          <div>First team to 21 points wins the game.</div>

          <div>
            <strong>Shooting the Moon (Going Alone/Loner)</strong>
          </div>
          <div>If a player believes they can win all the tricks in a round without their partner, they may declare "Shooting the Moon" during the bidding phase.</div>
          <div>Only the player who declared "Shooting the Moon" plays their cards alone, without the help of their partner.</div>
          <div>If successful, the player scores 12 points for their team.</div>
          <div>If successful, the player loses 12 points for their team.</div>



        </div>
      </div>
    </div>
  );
}
