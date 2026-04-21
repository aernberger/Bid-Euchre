import supabase from "../supabaseClient.js";
import { RoundResult } from "../models/roundResult.js";
import Player from "../models/player.js";

export class StatsService {
  /**
   * Updates bidding, hand, and trick stats at the end of each round (hand).
   */
  static async recordRoundStats(
    players: Player[],
    result: RoundResult,
    declarerId: string,
    bidAmount: number,
    playerTricks: Record<string, number>
  ) {
    const updates = players.map((player) => {
      const isDeclarer = player.id === declarerId;
      
      return supabase.rpc("update_player_stats", {
        p_user_id: player.supabaseId,
        p_is_match_over: false, // Match is not over, just the round
        p_game_won: false,      // Match wins handled separately
        p_won_bid: isDeclarer,
        p_bid_amount: isDeclarer ? bidAmount : 0,
        p_made_bid: isDeclarer && result.contractMade,
        p_tricks_won: playerTricks[player.id] || 0,
        p_tricks_total: 6 
      });
    });

    await Promise.all(updates);
  }

  /**
   * Updates Games Played and Win % only when a team hits 21.
   */
  static async recordGameStats(players: Player[], winnerTeamId: number) {
    const updates = players.map((player) => {
      return supabase.rpc("update_player_stats", {
        p_user_id: player.supabaseId,
        p_is_match_over: true, // TRIGGER: Increment games_played for everyone
        p_game_won: player.teamId === winnerTeamId, // TRIGGER: Increment games_won for winners
        p_won_bid: false,
        p_bid_amount: 0,
        p_made_bid: false,
        p_tricks_won: 0,
        p_tricks_total: 0
      });
    });

    await Promise.all(updates);
  }
}