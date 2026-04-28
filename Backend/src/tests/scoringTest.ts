import test from 'node:test';
import assert from 'assert';
import Suit from '../models/enums/suit.js';
import { ContractType } from '../services/enums/contractType.js';
import { Bid } from '../services/bid.js';
import { Contract } from '../services/contract.js';
import Team from '../models/team.js';
import Player from '../models/player.js';
import { ScoringEngine } from '../services/scoringService.js';

const declarerId = 'player1';
const partnerId = 'player2';
const oppAId = 'player3';
const oppBId = 'player4';

const declarerTeam = new Team(
  new Player(declarerId, 'Declarer', 'supabaseId1'),
  new Player(partnerId, 'Partner', 'supabaseId2'),
  0,
);
const defenderTeam = new Team(
  new Player(oppAId, 'Opp A', 'supabaseId3'),
  new Player(oppBId, 'Opp B', 'supabaseId4'),
  1,
);
const teams: Team[] = [declarerTeam, defenderTeam];

function trickCounts(declarerTricks: number, defenderTricks: number): Map<number, number> {
  return new Map<number, number>([
    [declarerTeam.teamId, declarerTricks],
    [defenderTeam.teamId, defenderTricks],
  ]);
}

test('made contract awards points equal to tricks bid', function () {
  const contract = new Contract(new Bid(declarerId, 4, ContractType.HIGH, undefined, false));
  const result = ScoringEngine.calculateScore(contract, teams, trickCounts(4, 2));
  assert.strictEqual(result.contractMade, true, 'Contract should be made');
  assert.strictEqual(
    result.pointsAwardedToTeamId,
    declarerTeam.teamId,
    'Points should go to declarer team',
  );
  assert.strictEqual(result.pointsAwarded, 4, 'Award should match tricks required');
  assert.strictEqual(result.declarerTricks, 4, 'Declarer trick count should match input');
  assert.strictEqual(result.defenderTricks, 2, 'Defender trick count should match input');
});

test('made contract does not award extra for tricks above bid', function () {
  const contract = new Contract(new Bid(declarerId, 3, ContractType.HIGH, undefined, false));
  const result = ScoringEngine.calculateScore(contract, teams, trickCounts(6, 0));
  assert.strictEqual(result.contractMade, true, 'Contract should be made');
  assert.strictEqual(result.pointsAwarded, 3, 'Award should be bid amount only');
});

test('failed contract awards negative bid to declarer team id', function () {
  const contract = new Contract(new Bid(declarerId, 5, ContractType.HIGH, undefined, false));
  const result = ScoringEngine.calculateScore(contract, teams, trickCounts(4, 2));
  assert.strictEqual(result.contractMade, false, 'Contract should be set');
  assert.strictEqual(
    result.pointsAwardedToTeamId,
    declarerTeam.teamId,
    'Penalty should attach to declarer team id',
  );
  assert.strictEqual(result.pointsAwarded, -5, 'Penalty should match negative tricks bid');
});

test('loner six made awards twelve points', function () {
  const contract = new Contract(new Bid(declarerId, 6, ContractType.SUITED, Suit.HEARTS, true));
  const result = ScoringEngine.calculateScore(contract, teams, trickCounts(6, 0));
  assert.strictEqual(result.contractMade, true, 'Loner should be made');
  assert.strictEqual(result.pointsAwarded, 12, 'Loner six should award twelve');
  assert.strictEqual(result.loner, true, 'Result should record loner');
});

test('six tricks made without loner awards six points not twelve', function () {
  const contract = new Contract(new Bid(declarerId, 6, ContractType.HIGH, undefined, false));
  const result = ScoringEngine.calculateScore(contract, teams, trickCounts(6, 0));
  assert.strictEqual(result.contractMade, true, 'Six-bid should be made');
  assert.strictEqual(result.pointsAwarded, 6, 'Non-loner six should award six');
  assert.strictEqual(result.loner, false, 'Result should record non-loner');
});

test('moon shot flag matches contract', function () {
  const moonContract = new Contract(new Bid(declarerId, 6, ContractType.SUITED, Suit.SPADES, true));
  const made = ScoringEngine.calculateScore(moonContract, teams, trickCounts(6, 0));
  assert.strictEqual(made.moonShot, true, 'Moon shot should be true for loner six');

  const notMoon = new Contract(new Bid(declarerId, 6, ContractType.HIGH, undefined, false));
  const madeHigh = ScoringEngine.calculateScore(notMoon, teams, trickCounts(6, 0));
  assert.strictEqual(madeHigh.moonShot, false, 'Moon shot should be false without loner');
});

test('throws when declarer is not on any team', function () {
  const contract = new Contract(new Bid('ghost', 3, ContractType.HIGH, undefined, false));
  assert.throws(
    function () {
      ScoringEngine.calculateScore(contract, teams, trickCounts(3, 3));
    },
    /Declarer team not found/,
    'Should error when declarer is missing from teams',
  );
});

test('throws when defender team cannot be resolved', function () {
  const orphanTeam = new Team(
    new Player(declarerId, 'Declarer', 'supabaseId1'),
    new Player(partnerId, 'Partner', 'supabaseId2'),
    0,
  );
  const contract = new Contract(new Bid(declarerId, 3, ContractType.HIGH, undefined, false));
  assert.throws(
    function () {
      ScoringEngine.calculateScore(contract, [orphanTeam], trickCounts(3, 3));
    },
    /Defender team not found/,
    'Should error with only one team',
  );
});
