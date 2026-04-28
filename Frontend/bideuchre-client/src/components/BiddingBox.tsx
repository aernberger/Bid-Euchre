import React from 'react';
import { useState } from 'react';
import WhiteBox from './WhiteBox';
import { statPill } from '../ui/statPill';
import { Bid, BidType, Suit } from '../types';
import {
  biddingActionsStyle,
  biddingLabelStyle,
  biddingRootStyle,
  biddingSectionStyle,
  biddingSuitRowStyle,
  biddingTopRowStyle,
  biddingWrapRowStyle,
  chipStyle,
  confirmBidButtonStyle,
  passButtonStyle,
} from './BiddingBox.styles';

interface BiddingBoxProperties {
  currentHighBid: Bid | null;
  onBidSubmit: (bid: Bid) => void;
  isPlayerTurn: boolean;
  /** Display name of the player whose turn it is to bid (from server `currentPlayerId`). */
  currentBidderName?: string | null;
  /** Current bidder only: blue = you or partner, red = opponent, neutral = waiting / unknown. */
  turnStatusTone?: 'blue' | 'red' | 'neutral';
}

const bidTypeRank: Record<BidType, number> = {
  Low: 0,
  Suited: 1,
  High: 2,
};

function isBidValid(type: BidType, number: number, currentHighBid: Bid | null): boolean {
  if (!currentHighBid) return true;
  if (number > currentHighBid.number) return true;
  if (number === currentHighBid.number && bidTypeRank[type] > bidTypeRank[currentHighBid.type])
    return true;
  return false;
}

export default function BiddingBox({
  currentHighBid,
  onBidSubmit,
  isPlayerTurn,
  currentBidderName = null,
  turnStatusTone = 'neutral',
}: BiddingBoxProperties) {
  const [selectedType, setSelectedType] = useState<BidType | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  /** Six-bid only: play without partner (backend scoring). */
  const [wantLoner, setWantLoner] = useState(false);

  const statusPillVariant: 'blue' | 'red' | 'neutral' =
    turnStatusTone === 'blue' ? 'blue' : turnStatusTone === 'red' ? 'red' : 'neutral';

  const needsSuit = selectedType === 'Suited';
  const hasSuit = !needsSuit || selectedSuit !== null;
  const canConfirm =
    selectedType !== null &&
    selectedNumber !== null &&
    hasSuit &&
    isBidValid(selectedType, selectedNumber, currentHighBid);

  return (
    <WhiteBox height={'clamp(333px, 45vh, 625px)'} width="clamp(500px, 90vw, 1000px)">
      <div style={biddingRootStyle}>
        <div style={biddingTopRowStyle}>
          <span
            style={statPill(statusPillVariant, 'lg', {
              whiteSpace: 'normal',
              textAlign: 'left',
              maxWidth: 'min(100%, 360px)',
            })}
          >
            {isPlayerTurn
              ? 'Your turn to bid'
              : currentBidderName
                ? `${currentBidderName} is bidding`
                : 'Waiting for a bid…'}
          </span>
          <span style={statPill('neutral', 'sm', { fontWeight: 600 })}>
            Current highest:{' '}
            {currentHighBid
              ? `${currentHighBid.type} ${currentHighBid.number}${
                  currentHighBid.loner && currentHighBid.number === 6 ? ' (Loner)' : ''
                }`
              : 'None'}
          </span>
        </div>

        <div style={biddingSectionStyle}>
          <div style={biddingLabelStyle}>Contract Type</div>
          <div style={biddingWrapRowStyle}>
            {['Low', 'Suited', 'High'].map((bid) =>
              (() => {
                const disabled = !isPlayerTurn;
                return (
                  <button
                    key={bid}
                    disabled={disabled}
                    onClick={() => setSelectedType(bid as BidType)}
                    style={chipStyle(selectedType === bid, disabled)}
                  >
                    {bid}
                  </button>
                );
              })(),
            )}
          </div>
        </div>

        {needsSuit && (
          <div style={biddingSuitRowStyle}>
            <span style={biddingLabelStyle}>Choose trump suit:</span>
            {(['hearts', 'spades', 'diamonds', 'clubs'] as Suit[]).map((suit) =>
              (() => {
                const disabled = !isPlayerTurn;
                return (
                  <button
                    key={suit}
                    disabled={disabled}
                    onClick={() => setSelectedSuit(suit)}
                    style={chipStyle(selectedSuit === suit, disabled)}
                  >
                    {suit.charAt(0).toUpperCase() + suit.slice(1)}
                  </button>
                );
              })(),
            )}
          </div>
        )}

        <div style={biddingSectionStyle}>
          <div style={biddingLabelStyle}>Tricks</div>
          <div style={biddingWrapRowStyle}>
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const anyTypeValid = (['Low', 'Suited', 'High'] as BidType[]).some((t) =>
                isBidValid(t, num, currentHighBid),
              );
              return (
                <button
                  key={num}
                  disabled={!isPlayerTurn || !anyTypeValid}
                  onClick={() => {
                    setSelectedNumber(num);
                    if (num !== 6) setWantLoner(false);
                  }}
                  style={chipStyle(selectedNumber === num, !isPlayerTurn || !anyTypeValid)}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {selectedNumber === 6 && isPlayerTurn ? (
          <div style={biddingSectionStyle}>
            <div style={biddingLabelStyle}>Six tricks — play without your partner?</div>
            <div style={biddingWrapRowStyle}>
              <button
                type="button"
                disabled={!isPlayerTurn}
                onClick={() => setWantLoner(false)}
                style={chipStyle(!wantLoner, !isPlayerTurn)}
              >
                With partner
              </button>
              <button
                type="button"
                disabled={!isPlayerTurn}
                onClick={() => setWantLoner(true)}
                style={chipStyle(wantLoner, !isPlayerTurn)}
              >
                Go alone (loner)
              </button>
            </div>
          </div>
        ) : null}

        <div style={biddingActionsStyle}>
          <button
            disabled={!isPlayerTurn || !canConfirm}
            onClick={() => {
              if (selectedType && selectedNumber) {
                const bid: Bid = {
                  type: selectedType,
                  number: selectedNumber,
                  loner: selectedNumber === 6 && wantLoner,
                };
                if (selectedType === 'Suited' && selectedSuit) {
                  bid.suit = selectedSuit;
                }
                onBidSubmit(bid);
              }
            }}
            style={confirmBidButtonStyle(!isPlayerTurn || !canConfirm)}
          >
            Confirm Bid
          </button>
          <button
            disabled={!isPlayerTurn}
            onClick={() => {
              setWantLoner(false);
              onBidSubmit({ type: 'Low', number: 0 });
            }}
            style={passButtonStyle(!isPlayerTurn)}
          >
            Pass
          </button>
        </div>
      </div>
    </WhiteBox>
  );
}
