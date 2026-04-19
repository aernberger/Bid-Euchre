import test from 'node:test';
import assert from 'assert';
import Suit from '../models/enums/suit.js';
import { ContractType } from '../services/enums/contractType.js';
import { Bid } from '../services/bid.js';

const bidderId = 'player1';

test('test constructor sets properties', function() {
    const testBid = new Bid('testPlayer', 2, ContractType.HIGH, undefined, false);
    assert.strictEqual(testBid.bidderId, 'testPlayer', "Bidder ID should match constructor input");
    assert.strictEqual(testBid.tricks, 2, "Tricks should match constructor input");
    assert.strictEqual(testBid.contractType, ContractType.HIGH, "Contract type should match constructor input");
    assert.strictEqual(testBid.suitType, undefined, "Suit type should match constructor input");
    assert.strictEqual(testBid.loner, false, "Loner should match constructor input");
})

test('cant bid more than 6 tricks', function() {
    assert.throws(function() {
        new Bid(bidderId, 7, ContractType.HIGH, undefined, false);
    }, /Invalid number of tricks/, "Shouldn't allow bidding more than 6 tricks");
})

test('cant bid less than 0 tricks', function() {
    assert.throws(function() {
        new Bid(bidderId, -1, ContractType.HIGH, undefined, false);
    }, /Invalid number of tricks/, "Shouldn't allow bidding less than 0 tricks");
})

test('loner bid must be for 6 tricks', function() {
    assert.throws(function() {
        new Bid(bidderId, 5, ContractType.SUITED, Suit.HEARTS, true);
    }, /Loner bid must be for 6 tricks/, "Loner bid should require 6 tricks");
})

test('cant bid a suited contract without a suit', function() {
    assert.throws(function() {
        new Bid(bidderId, 4, ContractType.SUITED, undefined, false);
    }, /Suited bid must have a suit type/, "Shouldn't allow bidding a suited contract without a suit");
})

test('cant bid a suit on a high contract', function() {
    assert.throws(function() {
        new Bid(bidderId, 4, ContractType.HIGH, Suit.SPADES, false);
    }, /Non-suited bids cannot have a suit type/, "Shouldn't allow bidding a suit on a high contract");
})

test('cant bid a suit on a low contract', function() {
    assert.throws(function() {
        new Bid(bidderId, 4, ContractType.LOW, Suit.SPADES, false);
    }, /Non-suited bids cannot have a suit type/, "Shouldn't allow bidding a suit on a low contract");
})

test('compareTo should compare by tricks first', function() {
    const higherTricks = new Bid(bidderId, 5, ContractType.HIGH, undefined, false);
    const lowerTricks = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(higherTricks.compareTo(lowerTricks), 1, "Higher tricks bid should be greater");
    assert.strictEqual(lowerTricks.compareTo(higherTricks), -1, "Lower tricks bid should be lesser");
})

test('compareTo should compare by contract type second', function() {
    const highBid = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const lowBid = new Bid(bidderId, 4, ContractType.LOW, undefined, false);
    assert.strictEqual(highBid.compareTo(lowBid), 2, "High bid should be greater than low bid");
    assert.strictEqual(lowBid.compareTo(highBid), -2, "Low bid should be lesser than high bid");
})

test('compareTo should return 0 for equal bids', function() {
    const bid1 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const bid2 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(bid1.compareTo(bid2), 0, "Equal bids should be considered equal");
})

test('beats should return true for higher bids', function() {
    const higherBid = new Bid(bidderId, 5, ContractType.HIGH, undefined, false);
    const lowerBid = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(higherBid.beats(lowerBid), true, "Higher bid should beat lower bid");
    assert.strictEqual(lowerBid.beats(higherBid), false, "Lower bid should not beat higher bid");
})

test('beats should return true for stronger contract type', function() {
    const strongerBid = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const weakerBid = new Bid(bidderId, 4, ContractType.SUITED, Suit.SPADES, false);
    assert.strictEqual(strongerBid.beats(weakerBid), true, "Stronger contract type should beat weaker contract type");
})

test('beats should return false for equal bids', function() {
    const bid1 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const bid2 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(bid1.beats(bid2), false, "Equal bids should not beat each other");
})

test('six-trick loner beats same contract six without loner', function() {
    const lonerSix = new Bid(bidderId, 6, ContractType.HIGH, undefined, true);
    const partnerSix = new Bid('p2', 6, ContractType.HIGH, undefined, false);
    assert.strictEqual(lonerSix.compareTo(partnerSix), 1, "Loner should compare higher");
    assert.strictEqual(lonerSix.beats(partnerSix), true, "Loner six should beat non-loner six");
    assert.strictEqual(partnerSix.beats(lonerSix), false, "Non-loner should not beat loner");
})

test('beats should return false for equal suits', function() {
    const bid1 = new Bid(bidderId, 4, ContractType.SUITED, Suit.SPADES, false);
    const bid2 = new Bid(bidderId, 4, ContractType.SUITED, Suit.SPADES, false);
    assert.strictEqual(bid1.beats(bid2), false, "Equal suits should not beat each other");
})

test('beats should return false for lower bids', function() {
    const higherBid = new Bid(bidderId, 5, ContractType.HIGH, undefined, false);
    const lowerBid = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(lowerBid.beats(higherBid), false, "Lower bid should not beat higher bid");
})

test('isPass should return true for pass bids', function() {
    const passBid = new Bid(bidderId, 0, ContractType.LOW, undefined, false);
    assert.strictEqual(passBid.isPass(), true, "Pass bid should be recognized as a pass");
})

test('isPass should return false for non-pass bids', function() {
    const nonPassBid = new Bid(bidderId, 1, ContractType.HIGH, undefined, false);
    assert.strictEqual(nonPassBid.isPass(), false, "Non-pass bid should not be recognized as a pass");
})

test('equals should return true for equal bids', function() {
    const bid1 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const bid2 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    assert.strictEqual(bid1.equals(bid2), true, "Equal bids should be considered equal");
})

test('equals should return false for non-equal bids', function() {
    const bid1 = new Bid(bidderId, 4, ContractType.HIGH, undefined, false);
    const bid2 = new Bid(bidderId, 5, ContractType.HIGH, undefined, false);
    assert.strictEqual(bid1.equals(bid2), false, "Non-equal bids should not be considered equal");
})
