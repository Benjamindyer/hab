/** How many characters of a line to show after some time, when it is typed out at a steady pace. */
export function visibleLength(total: number, elapsedMs: number, msPerChar: number): number {
  if (total <= 0) return 0;
  return Math.min(total, Math.floor(Math.max(0, elapsedMs) / msPerChar) + 1);
}

/** How long a line takes to type out, capped so a long line never keeps anyone waiting. */
export function typingDuration(total: number, msPerChar: number, capMs: number): number {
  return Math.min(capMs, total * msPerChar);
}
