import { Width, Height, X, Y, A, R, I, J, Brand } from "../types";

// the ordinal type is just the key
// we use to compare and determine the order.
// It can be anything from the literal index, to the position, to something else entirely, such as the
// literal keyset in terms of SQL land.
export type Ordinal = Brand<number, "Ordinal">; // TODO: support anything comparable instead of just numbers.

// you might call the columns headers, but we'll call them the column stubs
// and row stubs.
export type StubMeta<
  Extent extends Width | Height,
  Handle // row handle, col handle.
> = {
  // Width or Height
  extent: Extent;
  // user representable name, for instance, "AA" for a column
  // or "2" for a row or a rowId or a column name
  name: string;
  // actual handle type for indexing into the data provider.
  handle: Handle;
};

// the coord type is the axis being iterated: X for columns, Y for rows
export interface IndexIterator<S, Coord extends X | Y>
  extends IterableIterator<S> {
  /**
   * Coordinate of the top/left edge of the *current* item, in logical sheet space
   * (e.g. pixels or some branded number).
   *
   * Only meaningful when `current()` returns non-null.
   */
  readonly coord: Coord;

  /** Current value without advancing; null if iterator is invalid (before first / after last). */
  current(): S | null;

  /** Move to the next item; updates `coord` by adding the *previous* extent. */
  next(): IteratorResult<S>;

  /** Move to the previous item; updates `coord` by subtracting the *new* extent. */
  prev(): IteratorResult<S>;

  /** Clone the cursor (sharing underlying storage but with independent position/coord). */
  clone(): IndexIterator<S, Coord>;
}

export interface Index<
  // Ordinal extends I | J,
  Extent extends Width | Height,
  Handle,
  Coord extends X | Y
> {
  // return the stub with the greatest position <= c
  bisectLeft(c: Coord): IndexIterator<StubMeta<Extent, Handle>, Coord>;

  // the register function allows the data provider to update
  // the index with the data it needs.
  // should support multiple methods, ideally,
  // such as rearranging, insertion, and deletion.
  register(pos: Ordinal, stub: StubMeta<Extent, Handle>): void;

  // TODO: Support unregister; update via weak map from Handle
}

type IndexedStub<Extent extends Width | Height, Handle, Coord extends X | Y> = {
  ordinal: Ordinal; // stable key used for ordering
  start: Coord; // start coordinate (e.g., x or y)
  end: Coord; // end coordinate (for hit-testing ranges)
  stub: StubMeta<Extent, Handle>; // your metadata
};

type HorizontalAxisTypes = {
  // ord: J;
  ext: Width;
  coord: X;
};
type VerticalAxisTypes = {
  // ord: I;
  ext: Height;
  coord: Y;
};

type Axis = HorizontalAxisTypes | VerticalAxisTypes;

// const makeUniformIndex = <AX extends Axis, Handle>(
//   defaultExtent: AX["ext"]
// ): Index<AX["ext"], Handle, AX["coord"]> => {

//   return {
//     at(pos) {
//       return {
//         extent: defaultExtent,
//         name: `Stub ${pos}`,
//         handle:
//       }
//     }
//   }
// };
