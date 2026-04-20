export const IPL_TEAMS = [
  'PBKS', 'RCB', 'CSK', 'MI', 'GT', 'KKR', 'RR', 'LSG', 'DC', 'SRH'
] as const;

export type IPLTeam = typeof IPL_TEAMS[number];
