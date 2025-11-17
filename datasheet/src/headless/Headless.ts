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
import { Index } from "./Index";

interface ViewModel<RH, CH> {
  viewportModel: ViewportModel;
  resolveCellView: (
    handle: CellHandle<RH, CH> // TODO: Can parameterize this, or remove type parameters altogether
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

type HeadlessDatasheet<RH, CH, HIndex, VIndex> = {
  view: () => ViewModel<RH, CH>;

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
  horizontalIndex: Index<Width, CH, X>,
  verticalIndex: Index<Height, RH, Y>,
  config: HeadlessDatasheetConfig
): HeadlessDatasheet<RH, CH, typeof horizontalIndex, typeof verticalIndex> => {
  const viewportModel = makeViewportModel();

  const viewModel: ViewModel<RH, CH> = {
    viewportModel,
    resolveCellView: (handle: CellHandle<RH, CH>) => {
      const { rh, ch } = handle;

      const datum = dataProvider.getDatum(rh, ch);
      const formatting = formatProvider.getFormat(rh, ch, datum);
      return {
        datum,
        formatting,
        handle,
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
