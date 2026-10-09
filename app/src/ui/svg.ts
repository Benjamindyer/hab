export const NS = "http://www.w3.org/2000/svg";

/** Makes an SVG element with attributes and an optional class. */
export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, cls = ""): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (cls) e.setAttribute("class", cls);
  return e;
}

/** Sets how strongly something is lit or moving, from 0 (dim and still) to 1 (full). */
export function setLevel(target: SVGElement, level: number): void {
  target.style.setProperty("--level", String(Math.max(0, Math.min(1, level))));
}

/** Points as the text an SVG polygon wants. */
export const pointsText = (points: readonly (readonly [number, number])[]): string => points.map(([x, y]) => `${x},${y}`).join(" ");
