export type Point = readonly [number, number];

export interface Face {
  origin: Point;
  across: Point;
  up: Point;
}

/**
 * A point inside a four-cornered face, found from how far along each side it is (0 to 1).
 * `origin` is one corner, `across` the next corner along one side and `up` the next along the other.
 */
export function onFace(face: Face, u: number, v: number): Point {
  const { origin, across, up } = face;
  return [origin[0] + u * (across[0] - origin[0]) + v * (up[0] - origin[0]), origin[1] + u * (across[1] - origin[1]) + v * (up[1] - origin[1])];
}

/** The corners of one cell in a grid laid over a face, with a margin so the cells do not touch the edge. */
export function cellOnFace(face: Face, cell: { col: number; row: number; cols: number; rows: number }, margin = 0.08): Point[] {
  const span = (index: number, count: number): [number, number] => {
    const step = (1 - 2 * margin) / count;
    return [margin + index * step + step * 0.06, margin + (index + 1) * step - step * 0.06];
  };
  const [u0, u1] = span(cell.col, cell.cols);
  const [v0, v1] = span(cell.row, cell.rows);
  return [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => onFace(face, u as number, v as number));
}
