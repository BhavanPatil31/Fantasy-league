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
  // Separate active players from zero-score players
  const scoredPlayers = playerScores.filter(p => p.pointsScored > 0);
  const zeroPlayers = playerScores.filter(p => p.pointsScored <= 0);

  // Sort active players by pointsScored descending
  const sorted = [...scoredPlayers].sort((a, b) => b.pointsScored - a.pointsScored);
  
  const results: ProcessedScore[] = [];
  let i = 0;
  
  // Calculate rank points for active players
  while (i < sorted.length) {
    let j = i;
    // Find all players with the same pointsScored
    while (j < sorted.length && sorted[j].pointsScored === sorted[i].pointsScored) {
      j++;
    }
    
    // Group found from index i to j-1
    const groupSize = j - i;
    const startRank = i; // 0-indexed rank
    
    // Calculate average points for this group based on the slots they take in RANK_POINTS
    let totalRankPoints = 0;
    for (let k = i; k < j; k++) {
      // Use the slot corresponding to their position in the sorted list
      totalRankPoints += RANK_POINTS[k] || 0;
    }
    const averageRankScore = totalRankPoints / groupSize;
    
    // Assign calculated points and rank to all players in the group
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
  
  // Assign 0 points to all zero-score players and mark them as unranked (actualRank 0)
  zeroPlayers.forEach(p => {
    results.push({
      ...p,
      rankScore: 0,
      actualRank: 0
    });
  });

  return results;
}
