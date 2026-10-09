import type { PowerView } from "../state/power";
import { el, setText } from "./dom";

const NS = "http://www.w3.org/2000/svg";
const FLOWING = 0.02;

const text = (cls: string, x: number, y: number, value = ""): SVGTextElement => {
  const t = document.createElementNS(NS, "text");
  t.setAttribute("class", cls);
  t.setAttribute("x", String(x));
  t.setAttribute("y", String(y));
  t.textContent = value;
  return t;
};

const rect = (x: number, y: number, w: number, h: number): SVGRectElement => {
  const r = document.createElementNS(NS, "rect");
  for (const [k, v] of Object.entries({ x, y, width: w, height: h })) r.setAttribute(k, String(v));
  return r;
};

const line = (d: string, tone: string): SVGPathElement => {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("class", `flow ${tone}`);
  return p;
};

interface Node {
  group: SVGGElement;
  value: Text;
}

/** A box with a label and one big number. The unit follows the number inside the same text. */
function node(label: string, tone: string, [x, y, w]: readonly [number, number, number]): Node {
  const group = document.createElementNS(NS, "g");
  group.setAttribute("class", `node ${tone}`);
  const big = text("v", x + 16, y + 88);
  const value = document.createTextNode("");
  const unit = document.createElementNS(NS, "tspan");
  unit.setAttribute("class", "u");
  unit.setAttribute("dx", "8");
  unit.textContent = "kW";
  big.append(value, unit);
  group.append(rect(x, y, w, 120), text("k", x + 16, y + 30, label), big);
  return { group, value };
}

function show(n: Node, value: string): void {
  if (n.value.data !== value) n.value.data = value;
}

const fmt = (n: number | null): string => (n === null ? "--" : String(Number(n.toFixed(n < 10 ? 2 : 1))));

const svgEl = (tag: string, attrs: Record<string, string | number>, cls = ""): SVGElement => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (cls) e.setAttribute("class", cls);
  return e;
};

/** A small sun whose rays turn, beside the solar number. */
function sunIcon(x: number, y: number): SVGGElement {
  const g = svgEl("g", { transform: `translate(${x} ${y})` }, "icon sun") as SVGGElement;
  const rays = svgEl("g", {}, "rays");
  for (let i = 0; i < 8; i += 1) rays.append(svgEl("line", { x1: 0, y1: -17, x2: 0, y2: -25, transform: `rotate(${i * 45})` }));
  g.append(rays, svgEl("circle", { r: 9 }, "core"));
  return g;
}

/** Rings that spread outwards from a point, beside the grid number. */
function gridIcon(x: number, y: number): SVGGElement {
  const g = svgEl("g", { transform: `translate(${x} ${y})` }, "icon pulse") as SVGGElement;
  g.append(svgEl("circle", { r: 4 }, "dot"), svgEl("circle", { r: 4 }, "ring one"), svgEl("circle", { r: 4 }, "ring two"));
  return g;
}

/** Sets how strongly an icon moves, from 0 (still and dim) to 1 (full). */
const setLevel = (icon: SVGElement, level: number): void => {
  icon.style.setProperty("--level", String(Math.max(0, Math.min(1, level))));
};

const SOLAR_FULL_KW = 1.5;
const GRID_FULL_KW = 3;

export interface Diagram {
  element: SVGSVGElement;
  update(view: PowerView): void;
}

/** The picture of power moving between the sun, the grid, the house and the car. */
export function createDiagram(): Diagram {
  const element = document.createElementNS(NS, "svg");
  element.setAttribute("viewBox", "0 0 1000 450");
  element.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const flows = { solar: line("M190 90 H400 V190", "solar"), grid: line("M810 90 H600 V190", "grid"), car: line("M500 290 V330", "car") };
  const solar = node("SOLAR", "solar", [0, 30, 190]);
  const grid = node("GRID", "grid", [810, 30, 190]);
  const house = node("HOUSE", "house", [400, 170, 200]);
  const car = node("CAR", "car", [405, 330, 190]);
  const sun = sunIcon(150, 66);
  const pulse = gridIcon(960, 66);
  solar.group.append(sun);
  grid.group.append(pulse);
  element.append(...Object.values(flows), solar.group, grid.group, house.group, car.group);

  return {
    element,
    update(view) {
      show(solar, fmt(view.solar));
      show(grid, fmt(view.grid));
      show(house, fmt(view.house));
      show(car, fmt(view.car));
      setLevel(sun, (view.solar ?? 0) / SOLAR_FULL_KW);
      setLevel(pulse, (view.grid ?? 0) / GRID_FULL_KW);
      flows.solar.classList.toggle("on", (view.solar ?? 0) > FLOWING);
      flows.grid.classList.toggle("on", (view.grid ?? 0) > FLOWING);
      flows.car.classList.toggle("on", (view.car ?? 0) > FLOWING);
    },
  };
}

export interface Panel {
  element: HTMLElement;
  update(big: string, small: string, sub: string, fill?: number | null): void;
}

/** One of the four boxes under the picture: a label, a big number and a line of detail. */
export function createPanel(label: string, tone: string): Panel {
  const element = el("div", `pn ${tone}`);
  const big = el("span", "big");
  const unit = el("small");
  const sub = el("span", "sub");
  const gauge = el("div", "gauge");
  const fill = el("b");
  gauge.append(fill);
  big.append(document.createTextNode(""), unit);
  element.append(el("span", "k", label), big, gauge, sub);
  return {
    element,
    update(value, small, detail, level = null) {
      const first = big.firstChild;
      if (first && first.textContent !== value) first.textContent = value;
      setText(unit, small);
      setText(sub, detail);
      gauge.hidden = level === null;
      fill.style.width = `${Math.max(0, Math.min(100, level ?? 0))}%`;
    },
  };
}
