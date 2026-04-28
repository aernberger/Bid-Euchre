import test from 'node:test';
import assert from 'assert';
import Suit from '../models/enums/suit.js';
import { ContractType } from '../services/enums/contractType.js';
import { Bid } from '../services/bid.js';
import { Contract } from '../services/contract.js';
import Card from '../models/card.js';
import Face from '../models/enums/face.js';

const bidderId = 'player1';
const highBid = new Bid(bidderId, 3, ContractType.HIGH, undefined, false);
const lowBid = new Bid(bidderId, 3, ContractType.LOW, undefined, false);
const suitedBid = new Bid(bidderId, 4, ContractType.SUITED, Suit.HEARTS, false);
const moonBid = new Bid(bidderId, 6, ContractType.SUITED, Suit.SPADES, true);

test('test constructor sets properties for contract', function () {
  const testContract = new Contract(highBid);
  assert.strictEqual(
    testContract.declarerId,
    bidderId,
    'Declarer ID should match constructor input',
  );
  assert.strictEqual(testContract.tricksRequired, 3, 'Tricks should match constructor input');
  assert.strictEqual(
    testContract.type,
    ContractType.HIGH,
    'Contract type should match constructor input',
  );
  assert.strictEqual(
    testContract.trumpSuit,
    undefined,
    'Trump suit should match constructor input',
  );
  assert.strictEqual(testContract.loner, false, 'Loner should match constructor input');
});

test('isMoonShot identifies moon shots', function () {
  const testContract = new Contract(moonBid);
  assert.strictEqual(testContract.isMoonShot(), true, 'Should identify moon shot');
});

test('getEffectiveSuit identifies the left bower', function () {
  const testBower = new Card(Suit.DIAMONDS, Face.JACK);
  const testContract = new Contract(suitedBid);
  assert.strictEqual(
    testContract.getEffectiveSuit(testBower),
    Suit.HEARTS,
    'Should identify left bower',
  );
});

test('getEffectiveSuit ignores non-bower cards', function () {
  const testCard = new Card(Suit.CLUBS, Face.TEN);
  const testContract = new Contract(suitedBid);
  assert.strictEqual(
    testContract.getEffectiveSuit(testCard),
    Suit.CLUBS,
    'Should ignore non-bower cards',
  );
});

test('compareCards ace beats ten in high contract following suit', function () {
  const testContract = new Contract(highBid);
  const aceCard = new Card(Suit.HEARTS, Face.ACE);
  const tenCard = new Card(Suit.HEARTS, Face.TEN);
  assert.strictEqual(
    testContract.compareCards(aceCard, tenCard, Suit.HEARTS),
    4,
    'Ace should beat Ten',
  );
});

test('compareCards ten beats ace in high contract when ace doesnt follow suit', function () {
  const testContract = new Contract(highBid);
  const aceCard = new Card(Suit.HEARTS, Face.ACE);
  const tenCard = new Card(Suit.CLUBS, Face.TEN);
  assert.strictEqual(
    testContract.compareCards(aceCard, tenCard, Suit.CLUBS),
    -2,
    'Ten should beat Ace',
  );
});

test('compareCards nine beats ace in low contract when following suit', function () {
  const testContract = new Contract(lowBid);
  const aceCard = new Card(Suit.HEARTS, Face.ACE);
  const nineCard = new Card(Suit.HEARTS, Face.NINE);
  assert.strictEqual(
    testContract.compareCards(aceCard, nineCard, Suit.HEARTS),
    -5,
    'Nine should beat Ace',
  );
});

test('compareCards ace beats nine in low contract when nine doesnt follow suit', function () {
  const testContract = new Contract(lowBid);
  const aceCard = new Card(Suit.HEARTS, Face.ACE);
  const nineCard = new Card(Suit.CLUBS, Face.NINE);
  assert.strictEqual(
    testContract.compareCards(aceCard, nineCard, Suit.HEARTS),
    1,
    'Ace should beat Nine',
  );
});

test('compareCards low trump beats high not trump in suited contract', function () {
  const testContract = new Contract(suitedBid);
  const lowTrumpCard = new Card(Suit.HEARTS, Face.NINE);
  const highNonTrumpCard = new Card(Suit.CLUBS, Face.ACE);
  assert.strictEqual(
    testContract.compareCards(lowTrumpCard, highNonTrumpCard, Suit.CLUBS),
    35,
    'Low trump should beat high non-trump',
  );
});

test('compareCards right bower beats left bower in suited contract', function () {
  const testContract = new Contract(suitedBid);
  const rightBowerCard = new Card(Suit.HEARTS, Face.JACK);
  const leftBowerCard = new Card(Suit.DIAMONDS, Face.JACK);
  assert.strictEqual(
    testContract.compareCards(rightBowerCard, leftBowerCard, Suit.HEARTS),
    1,
    'Right bower should beat left bower',
  );
});

test('compareCards left bower beats other trump in suited contract', function () {
  const testContract = new Contract(suitedBid);
  const leftBowerCard = new Card(Suit.DIAMONDS, Face.JACK);
  const otherTrumpCard = new Card(Suit.HEARTS, Face.ACE);
  assert.strictEqual(
    testContract.compareCards(leftBowerCard, otherTrumpCard, Suit.HEARTS),
    13,
    'Left bower should beat other trump',
  );
});

test('compareCards ace beats ten in suited contract following suit, no trump', function () {
  const testContract = new Contract(suitedBid);
  const aceCard = new Card(Suit.SPADES, Face.ACE);
  const tenCard = new Card(Suit.SPADES, Face.TEN);
  assert.strictEqual(
    testContract.compareCards(aceCard, tenCard, Suit.SPADES),
    4,
    'Ace should beat Ten',
  );
});

test('compareCards ten beats ace in suited contract when ace doesnt follow suit, no trump', function () {
  const testContract = new Contract(suitedBid);
  const aceCard = new Card(Suit.SPADES, Face.ACE);
  const tenCard = new Card(Suit.CLUBS, Face.TEN);
  assert.strictEqual(
    testContract.compareCards(aceCard, tenCard, Suit.CLUBS),
    -42,
    'Ten should beat Ace',
  );
});
