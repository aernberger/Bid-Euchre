import supabase from "../supabaseClient.js";
import { RoundResult } from "../models/roundResult.js";
import Player from "../models/player.js";
import { supabaseAdmin } from "../supabaseClient.js";

export class StatsService {
  static async recordRoundStats(
    players: Player[],
    result: RoundResult,
    declarerId: string,
    bidAmount: number,
    playerTricks: Record<string, number>
  ) {
    const updates = players.map(async (player) => {
      const isDeclarer = player.id === declarerId;

      console.log(`🔎 PLAYER: ${player.name} | SOCKET_ID: ${player.id} | DB_ID: [${player.supabaseId}]`);
      
      const { data, error } = await supabaseAdmin.rpc("update_player_stats", {
        p_user_id: player.supabaseId,
        p_is_match_over: false,
        p_game_won: false,
        p_won_bid: isDeclarer,
        p_bid_amount: isDeclarer ? bidAmount : 0,
        p_made_bid: isDeclarer && result.contractMade,
        p_tricks_won: playerTricks[player.id] || 0,
        p_tricks_total: 6 
      });

      if (error) {
        console.error(`❌ DB Sync Failed for ${player.name}:`, error.message);
        console.error(`Hint: Check if the function 'update_player_stats' exists in Supabase.`);
      } else {
        console.log(`✅ DB Sync Success for ${player.name}`);
      }
    });

    await Promise.all(updates);
  }

  static async recordGameStats(players: Player[], winnerTeamId: number) {
    const updates = players.map(async (player) => {
      const { error } = await supabase.rpc("update_player_stats", {
        p_user_id: player.supabaseId,
        p_is_match_over: true,
        p_game_won: player.teamId === winnerTeamId,
        p_won_bid: false,
        p_bid_amount: 0,
        p_made_bid: false,
        p_tricks_won: 0,
        p_tricks_total: 0
      });

      if (error) console.error(`❌ Game End Sync Failed:`, error.message);
    });

    await Promise.all(updates);
  }
}