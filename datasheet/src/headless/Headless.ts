import {
  // type ColHandle,
  // type RowHandle,
  // type GridViewModel,
  makeVirtualRowSet,
  makeVirtualColSet,
} from "./providers/Grid";
import { type ViewportModel, makeViewportModel } from "./models/Viewport";
import type { CellViewModel, FormatSpec, CellHandle } from "./models/Cell";

import { Width, Height, As, A, I, J, X, Y } from "../types";
import { Datum } from "../../demo/mockApi/FieldTypes";
import { Index, IndexIterator, StubMeta } from "./Index";

interface ViewModel<RH, CH, Cursor> {
  viewportModel: ViewportModel;
  topLeft: Cursor;
  editing?: Cursor;
  resolveCellView: (
    cursor: Cursor // TODO: Can parameterize this, or remove type parameters altogether
  ) => CellViewModel<RH, CH>;
}

interface DataProvider<RH, CH> {
  getDatum(row: RH, col: CH): Datum;
  updateDatum(row: RH, col: CH, datum: Datum): void;
}

interface FormatProvider<RH, CH> {
  getFormat(row: RH, col: CH, value: Datum): FormatSpec;
  // updateFormat(row: RH, col: CH, )
}

type Cursor<RH, CH> = {
  row: IndexIterator<StubMeta<Height, RH>, A<Y>>;
  col: IndexIterator<StubMeta<Width, CH>, A<X>>;
};

type HeadlessDatasheet<RH, CH, HIndex, VIndex> = {
  view: () => ViewModel<RH, CH, Cursor<RH, CH>>;

  // updateColumnWidth(colId: CH, width: Width): void; not always implemented
  // updateRowHeight(rowId: RH, height: Height): void; not always implemented

  // updatePinnedRows(updateFn: (frozenRows: Set<RH>) => Set<RH>): void; not always implemented
  // updatePinnedCols(updateFn: (frozenCols: Set<CH>) => Set<CH>): void; not always implemented

  updateViewportScroll(dims: { sx: A<X>; sy: A<Y> }): void;
  updateViewportDims(dims: { vw: Width; vh: Height }): void;

  // updateCellFormat(handle: CellHandle<RH, CH>, fmt: Partial<FormatSpec>): void; not always implemented
  updateCellData(handle: CellHandle<RH, CH>, datum: Datum): void;
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

    // updateColumnWidth: (colId: ColHandle, width: Width): void => {
    //   viewModel.grid.cols.patch(colId, { w: width });
    // },
    // updateRowHeight: (rowId: RowHandle, height: Height): void => {},

    updateViewportScroll: ({ sx, sy }): void => {
      viewModel.viewportModel.sx = sx;
      viewModel.viewportModel.sy = sy;
      viewModel.topLeft = makeCursor(
        horizontalIndex,
        verticalIndex,
        viewportModel.sx,
        viewportModel.sy
      );
    },
    updateViewportDims: ({ vw, vh }): void => {
      viewModel.viewportModel.w = vw;
      viewModel.viewportModel.h = vh;
    },

    // updateCellFormat: (
    //   handle: CellHandle,
    //   fmt: Partial<FormatSpec>
    // ): void => {},
    updateCellData: (handle: CellHandle<RH, CH>, datum: Datum): void => {
      const { rh, ch } = handle;
      dataProvider.updateDatum(rh, ch, datum);
    },
  };
};
