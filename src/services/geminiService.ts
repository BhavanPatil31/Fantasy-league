export interface ComparisonInsights {
  trends: string;
  consistency: string;
  projection: string;
  summary: string;
}

export async function getPlayerInsights(
  playerAName: string,
  playerBName: string,
  historyA: number[],
  historyB: number[],
  matchesRemaining: number,
  gap: number,
  neededAvg: string
): Promise<ComparisonInsights> {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerAName,
        playerBName,
        historyA,
        historyB,
        matchesRemaining,
        gap,
        neededAvg
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result as ComparisonInsights;
  } catch (error) {
    console.error("Error generating insights via API:", error);
    return {
      trends: "Analysis currently offline. Our analysts are checking the stats.",
      consistency: "Stability metrics are being recalculated for this matchup.",
      projection: "Outlook data pending. Check back after the next match.",
      summary: "Showdown live. Strategic insights are arriving momentarily."
    };
  }
}
