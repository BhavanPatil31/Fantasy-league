export interface Player {
  id: string;
  name: string;
  totalScore: number;
  lastMatchScore: number;
  previousRank: number;
  currentRank: number;
}

export interface MatchScore {
  playerId: string;
  playerName: string;
  pointsScored: number; // The actual points entered (e.g. 100)
  rankScore: number;   // The assigned points (e.g. 14)
}

export interface Match {
  id: string;
  matchNumber: number;
  matchTitle?: string;
  date: string;
  scores: MatchScore[];
}

export interface Fixture {
  id: string;
  title: string;
  createdAt: any;
}
