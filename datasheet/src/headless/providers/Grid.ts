import { Brand, Width, Height, X, Y, A, R, I, J } from "../../types";

// This file uses I and J directly for Row and Col handles,
// but we may replace this with semantic rowhandles later
// on. In that case we'll have to define a bidirectional
// index <-> handle mapping.
// type RowHandle = I;
type RowHandle = unknown;

type RowMeta = {
  h: Height;
};

export type RowPatch = Partial<RowMeta>;

export interface VirtualRowSet {
  defaultOf(i: I): RowMeta;
  get(i: I): RowMeta;
  patch(i: I, p: RowPatch): RowMeta;
  clear(i: I): void;
  has(i: I): boolean;
}

export const makeVirtualRowSet = (
  template: (i: I) => RowMeta,
  norm: (p: RowPatch) => RowPatch = (p) => p
): VirtualRowSet => {
  const overrides = new Map<I, RowPatch>();

  return {
    defaultOf(i) {
      return template(i);
    },

    get(i) {
      const base = template(i);
      const ov = overrides.get(i);
      return ov ? ({ ...base, ...ov } as RowMeta) : ({ ...base } as RowMeta);
    },

    patch(i, p) {
      const prev = overrides.get(i);
      const next = { ...(prev ?? {}), ...norm(p) };
      overrides.set(i, next);

      const base = template(i);
      return { ...base, ...next } as RowMeta;
    },

    clear(i) {
      overrides.delete(i);
    },

    has(i) {
      return overrides.has(i);
    },
  };
};

type ColHandle = J;

type ColMeta = {
  h: Height;
};

export type ColPatch = Partial<ColMeta>;

export interface VirtualColSet {
  defaultOf(j: J): ColMeta;
  get(j: J): ColMeta;
  patch(j: J, p: ColPatch): ColMeta;
  clear(j: J): void;
  has(j: J): boolean;
}

export const makeVirtualColSet = (
  template: (j: J) => ColMeta,
  norm: (p: ColPatch) => ColPatch = (p) => p
): VirtualColSet => {
  const overrides = new Map<J, ColPatch>();

  return {
    defaultOf(j) {
      return template(j);
    },

    get(j) {
      const base = template(j);
      const ov = overrides.get(j);
      return ov
        ? ({ ...base, ...ov, j } as ColMeta)
        : ({ ...base, j } as ColMeta);
    },

    patch(j, p) {
      const prev = overrides.get(j);
      const next = { ...(prev ?? {}), ...norm(p) };
      overrides.set(j, next);

      const base = template(j);
      return { ...base, ...next, j } as ColMeta;
    },

    clear(j) {
      overrides.delete(j);
    },

    has(j) {
      return overrides.has(j);
    },
  };
};

export interface GridViewModel {
  // rows: VirtualRowSet; // a sequence of row handles
  // cols: VirtualColSet; // a sequnece of col handles
  // vw: Width; // viewport width
  // vh: Height; // viewport height
  // sax: A<X>; // scroll absolute x
  // say: A<Y>; // scroll absolute y
  // pinnedRows: Set<RowHandle>;
  // pinnedCols: Set<ColHandle>;
}
