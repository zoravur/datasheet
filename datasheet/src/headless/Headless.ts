import {
  // type ColHandle,
  // type RowHandle,
  // type GridViewModel,
  makeVirtualRowSet,
  makeVirtualColSet,
} from "./providers/Grid";
import { type ViewportModel, makeViewportModel } from "./models/Viewport";
import type { CellViewModel, FormatSpec, CellHandle } from "./models/Cell";

import type { Width, Height, As, A, I, J, X, Y } from "../types";
import type { Datum } from "../../demo/mockApi/FieldTypes";
import type { Index, IndexIterator, StubMeta } from "./Index";

export interface ViewModel<RH, CH, Cursor> {
  viewportModel: ViewportModel;
  topLeft: Cursor;
  editing?: Cursor;
  resolveCellView: (
    cursor: Cursor // TODO: Can parameterize this, or remove type parameters altogether
  ) => CellViewModel<RH, CH>;
}

export interface ViewController<RH, CH, Cursor> {
  // updateColumnWidth(colId: CH, width: Width): void; not always implemented
  // updateRowHeight(rowId: RH, height: Height): void; not always implemented

  // updatePinnedRows(updateFn: (frozenRows: Set<RH>) => Set<RH>): void; not always implemented
  // updatePinnedCols(updateFn: (frozenCols: Set<CH>) => Set<CH>): void; not always implemented

  updateViewportScroll(
    viewModel: ViewModel<RH, CH, Cursor>,
    dims: { sx: A<X>; sy: A<Y> }
  ): ViewModel<RH, CH, Cursor>;
  updateViewportDims(
    viewModel: ViewModel<RH, CH, Cursor>,
    dims: { vw: Width; vh: Height }
  ): ViewModel<RH, CH, Cursor>;

  // updateCellFormat(handle: CellHandle<RH, CH>, fmt: Partial<FormatSpec>): void; not always implemented
  updateCellData(
    viewModel: ViewModel<RH, CH, Cursor>,
    handle: CellHandle<RH, CH>,
    datum: Datum
  ): ViewModel<RH, CH, Cursor>;
}

export interface DataProvider<RH, CH> {
  getDatum(row: RH, col: CH): Datum;
  updateDatum(row: RH, col: CH, datum: Datum): void;
}

export interface FormatProvider<RH, CH> {
  getFormat(row: RH, col: CH, value: Datum): FormatSpec;
  // updateFormat(row: RH, col: CH, )
}

export type Cursor<RH, CH> = {
  row: IndexIterator<StubMeta<Height, RH>, A<Y>>;
  col: IndexIterator<StubMeta<Width, CH>, A<X>>;
};

export type HeadlessDatasheet<RH, CH, HIndex, VIndex> = {
  view: () => ViewModel<RH, CH, Cursor<RH, CH>>;
  controller: () => ViewController<RH, CH, Cursor<RH, CH>>;
};

type HeadlessDatasheetConfig = {
  rowHeight: Height;
  columnWidth: Width;
};

export const makeHeadlessDatasheet = <RH, CH>(
  dataProvider: DataProvider<RH, CH>,
  formatProvider: FormatProvider<RH, CH>,
  horizontalIndex: Index<Width, CH, A<X>>,
  verticalIndex: Index<Height, RH, A<Y>>,
  config: HeadlessDatasheetConfig
): HeadlessDatasheet<RH, CH, typeof horizontalIndex, typeof verticalIndex> => {
  const viewportModel = makeViewportModel();

  type HIndex = typeof horizontalIndex;
  type VIndex = typeof verticalIndex;

  const makeCursor = (
    horizontalIndex: HIndex,
    verticalIndex: VIndex,
    sx: typeof viewportModel.sx,
    sy: typeof viewportModel.sy
  ) => {
    const col = horizontalIndex.bisectLeft(sx);
    const row = verticalIndex.bisectLeft(sy);
    return {
      row,
      col,
    };
  };

  const viewModel: ViewModel<RH, CH, Cursor<RH, CH>> = {
    viewportModel,
    topLeft: makeCursor(
      horizontalIndex,
      verticalIndex,
      viewportModel.sx,
      viewportModel.sy
    ),
    resolveCellView: (cursor: Cursor<RH, CH>) => {
      const { row, col } = cursor;

      const rowStub = row.current();
      const colStub = col.current();

      if (rowStub == null || colStub == null) {
        throw new Error("Attempt to resolve invalid stub iterator");
      }

      const { handle: rh, extent: h } = rowStub;
      const { handle: ch, extent: w } = colStub;

      const datum = dataProvider.getDatum(rowStub.handle, colStub.handle);
      const formatting = formatProvider.getFormat(rh, ch, datum);
      const handle = {
        rh,
        ch,
      };
      return {
        datum,
        formatting,
        handle,
        dims: {
          x: col.coord,
          y: row.coord,
          w,
          h,
        },
      };
    },
  };

  return {
    view: () => {
      return viewModel;
    },

    controller: () => {
      return {
        updateViewportScroll: (viewModel, { sx, sy }): typeof viewModel => {
          viewModel.viewportModel.sx = sx;
          viewModel.viewportModel.sy = sy;
          viewModel.topLeft = makeCursor(
            horizontalIndex,
            verticalIndex,
            viewportModel.sx,
            viewportModel.sy
          );
          return viewModel;
        },
        updateViewportDims: (viewModel, { vw, vh }): typeof viewModel => {
          viewModel.viewportModel.w = vw;
          viewModel.viewportModel.h = vh;
          return viewModel;
        },

        updateCellData: (
          viewModel,
          handle: CellHandle<RH, CH>,
          datum: Datum
        ): typeof viewModel => {
          const { rh, ch } = handle;
          dataProvider.updateDatum(rh, ch, datum);
          return viewModel;
        },
      };
    },
  };
};
