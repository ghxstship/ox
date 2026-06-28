// OX mobile — XP / level curve. Mirrors the 05-state-machines XP rule: each
// level needs threshold(level) XP. The DB stores level + xp (xp = progress into
// the current level), so we only need the next threshold to draw the bar.
export function threshold(level: number): number {
  // Smooth copper curve: 100 base, +60 per level (matches seed magnitudes).
  return 100 + level * 60;
}

export function xpPct(level: number, xp: number): number {
  const t = threshold(level);
  return t > 0 ? Math.min(100, Math.round((xp / t) * 100)) : 0;
}
