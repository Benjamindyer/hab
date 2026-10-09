import type { PowerView } from "../state/power";
import { cellOnFace, type Point } from "../state/houseShape";
import { pointsText, setLevel, svgEl } from "./svg";

/* A small house seen from a corner. The front corner is at the bottom; walls rise 70, the roof ridge 40 more. */
const FRONT: Point = [500, 340];
const RIGHT: Point = [620, 280];
const LEFT: Point = [420, 300];
const WALL = 70;
const up = ([x, y]: Point, by: number): Point => [x, y - by];
const FRONT_TOP = up(FRONT, WALL);
const RIGHT_TOP = up(RIGHT, WALL);
const LEFT_TOP = up(LEFT, WALL);
const RIDGE_START: Point = [460, 210];
const RIDGE_END: Point = [580, 150];

/** The house is drawn small, then scaled up about this point. */
const CENTRE: Point = [500, 290];
const SCALE = 1.5;

const HOUSE_FULL_KW = 3;
const SOLAR_FULL_KW = 1.5;

const poly = (points: readonly Point[], cls: string): SVGPolygonElement => svgEl("polygon", { points: pointsText(points) }, cls);

function walls(): SVGElement[] {
  return [
    svgEl("ellipse", { cx: 520, cy: 342, rx: 150, ry: 26 }, "shadow"),
    poly([FRONT, LEFT, LEFT_TOP, FRONT_TOP], "wall left"),
    poly([FRONT_TOP, LEFT_TOP, RIDGE_START], "wall left"),
    poly([FRONT, RIGHT, RIGHT_TOP, FRONT_TOP], "wall right"),
    poly([FRONT_TOP, RIGHT_TOP, RIDGE_END, RIDGE_START], "roof"),
  ];
}

/** Rows of panels on the sunny roof slope. They light up with the solar output. */
function panels(): SVGGElement {
  const group = svgEl("g", {}, "panels");
  const face = { origin: FRONT_TOP, across: RIGHT_TOP, up: RIDGE_START };
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) group.append(poly(cellOnFace(face, { col, row, cols: 4, rows: 2 }), "panel"));
  }
  return group;
}

/** Windows on the long wall and a door, lit more as the house uses more power. */
function windows(): SVGGElement {
  const group = svgEl("g", {}, "windows");
  const face = { origin: FRONT, across: RIGHT, up: FRONT_TOP };
  for (const col of [0, 2, 4]) group.append(poly(cellOnFace(face, { col, row: 0, cols: 5, rows: 1 }, 0.12), "window"));
  return group;
}

export interface House {
  group: SVGGElement;
  update(view: PowerView): void;
}

/** The house in the middle of the Energy picture. It glows with the house's use and its roof with the sun. */
export function createHouse(): House {
  const group = svgEl("g", { transform: `translate(${CENTRE[0]} ${CENTRE[1]}) scale(${SCALE}) translate(${-CENTRE[0]} ${-CENTRE[1]})` }, "house");
  const roofPanels = panels();
  const lights = windows();
  group.append(...walls(), roofPanels, lights);
  return {
    group,
    update(view) {
      setLevel(roofPanels, (view.solar ?? 0) / SOLAR_FULL_KW);
      setLevel(lights, (view.house ?? 0) / HOUSE_FULL_KW);
    },
  };
}
