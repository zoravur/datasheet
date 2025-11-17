import { Width, Height, X, Y, A, R, I, J, Brand } from "../types";
import { Index, Ordinal, StubMeta, IndexIterator } from "./Index";

type IndexedStub<
  Extent extends Width | Height,
  Handle,
  Coord extends A<X> | A<Y>
> = {
  ordinal: Ordinal; // ordering key
  stub: StubMeta<Extent, Handle>; // the thing you expose
  extent: Extent; // numeric width/height (branded)
};

class ArrayIndex<
  Extent extends Width | Height,
  Handle,
  Coord extends A<X> | A<A<Y>>
> implements Index<Extent, Handle, Coord>
{
  private entries: IndexedStub<Extent, Handle, Coord>[] = [];

  register(pos: Ordinal, stub: StubMeta<Extent, Handle>): void {
    const extent = stub.extent as Extent; // or however you compute it
    const entry: IndexedStub<Extent, Handle, Coord> = {
      ordinal: pos,
      stub,
      extent,
    };
    // keep entries sorted by pos (or by ordinal)
    const i = this.findInsertIndex(pos);
    this.entries.splice(i, 0, entry);
  }

  bisectLeft(c: Coord): IndexIterator<StubMeta<Extent, Handle>, Coord> {
    // 1) find array index i such that entries[i] is the stub whose leading edge <= c
    const { index: i, coord } = this.binarySearchByCoord(c);
    return new ArrayIndexIterator(this.entries, i, coord);
  }

  // Private: find insert point in terms of Ordinal (not coord)
  private findInsertIndex(pos: Ordinal): number {
    let lo = 0,
      hi = this.entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.entries[mid].ordinal < pos) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  // Private: binary search by coordinate along the axis.
  // For a huge sheet you’d want some prefix-sum / segmented structure; for now assume in-memory.
  private binarySearchByCoord(c: Coord): { index: number; coord: Coord } {
    // Simple version: linear accumulate until > c.
    // Real version: store prefix sums or segment tree; still internal.
    let coord = 0 as Coord;
    let i = -1;
    for (let k = 0; k < this.entries.length; k++) {
      const width = this.entries[k].extent as unknown as number;
      if ((coord as unknown as number) + width > (c as unknown as number)) {
        i = k;
        break;
      }
      coord = ((coord as unknown as number) + width) as Coord;
    }
    if (i === -1) {
      // past the last; iterator will be "after end"
      return { index: this.entries.length, coord: coord };
    }
    return { index: i, coord };
  }
}

class ArrayIndexIterator<
  Extent extends Width | Height,
  Handle,
  Coord extends A<X> | A<Y>
> implements IndexIterator<StubMeta<Extent, Handle>, Coord>
{
  private readonly entries: IndexedStub<Extent, Handle, Coord>[];
  private i: number; // INTERNAL ONLY

  public coord: Coord; // leading edge of entries[i]

  constructor(
    entries: IndexedStub<Extent, Handle, Coord>[],
    index: number,
    coord: Coord
  ) {
    this.entries = entries;
    this.i = index;
    this.coord = coord;
  }

  current(): StubMeta<Extent, Handle> | null {
    if (this.i < 0 || this.i >= this.entries.length) return null;
    return this.entries[this.i].stub;
  }

  next(): IteratorResult<StubMeta<Extent, Handle>> {
    const curr = this.current();
    if (!curr) {
      return { value: undefined as any, done: true };
    }
    // advance coord by current extent
    const width = this.entries[this.i].extent as unknown as number;
    this.coord = ((this.coord as unknown as number) + width) as Coord;

    this.i++;
    const next = this.current();
    if (!next) {
      return { value: undefined as any, done: true };
    }
    return { value: next, done: false };
  }

  prev(): IteratorResult<StubMeta<Extent, Handle>> {
    if (this.i <= 0) {
      this.i = -1;
      return { value: undefined as any, done: true };
    }

    // move to previous entry, then back up coord by its extent
    this.i--;
    const entry = this.entries[this.i];
    const width = entry.extent as unknown as number;
    this.coord = ((this.coord as unknown as number) - width) as Coord;

    return { value: entry.stub, done: false };
  }

  clone(): IndexIterator<StubMeta<Extent, Handle>, Coord> {
    return new ArrayIndexIterator(this.entries, this.i, this.coord);
  }

  [Symbol.iterator](): IterableIterator<StubMeta<Extent, Handle>> {
    return this;
  }
}
