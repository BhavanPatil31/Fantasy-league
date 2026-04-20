// Ranking points constant
const RANK_POINTS = [14, 12, 10, 8, 6, 4, 2, 0];

export interface PlayerScore {
  playerId: string;
  playerName: string;
  pointsScored: number;
}

export interface ProcessedScore extends PlayerScore {
  rankScore: number;
  actualRank: number;
}

export function calculateRankScores(playerScores: PlayerScore[]): ProcessedScore[] {
  // Sort by pointsScored descending
  const sorted = [...playerScores].sort((a, b) => b.pointsScored - a.pointsScored);
  
  const results: ProcessedScore[] = [];
  let currentRank = 0;
  
  for (let i = 0; i < sorted.length; i++) {
    // If not first and points are same as previous, they share the rank/points
    if (i > 0 && sorted[i].pointsScored === sorted[i - 1].pointsScored) {
      // Shared rank, but we need to track how many places were consumed
    } else {
      currentRank = i; // The actual rank (0-indexed)
    }
    
    // Assign points based on the rank
    // RANK_POINTS[0] is for 1st place (index 0)
    // RANK_POINTS[1] is for 2nd place (index 1)
    // If rank is > 7, they get 0.
    const rankScore = RANK_POINTS[currentRank] || 0;
    
    results.push({
      ...sorted[i],
      rankScore,
      actualRank: currentRank + 1
    });
  }
  
  return results;
}
