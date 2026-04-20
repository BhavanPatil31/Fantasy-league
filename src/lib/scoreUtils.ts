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
  let i = 0;
  
  while (i < sorted.length) {
    let j = i;
    // Find all players with the same pointsScored
    while (j < sorted.length && sorted[j].pointsScored === sorted[i].pointsScored) {
      j++;
    }
    
    // Group found from index i to j-1
    const groupSize = j - i;
    const startRank = i; // 0-indexed rank
    
    // Calculate average points for this group
    let totalRankPoints = 0;
    for (let k = i; k < j; k++) {
      totalRankPoints += RANK_POINTS[k] || 0;
    }
    const averageRankScore = totalRankPoints / groupSize;
    
    // Assign to all players in the group
    for (let k = i; k < j; k++) {
      results.push({
        ...sorted[k],
        rankScore: averageRankScore,
        actualRank: startRank + 1
      });
    }
    
    // Move to the next group
    i = j;
  }
  
  return results;
}
