import {
  // type ColHandle,
  // type RowHandle,
  // type GridViewModel,
  makeVirtualRowSet,
  makeVirtualColSet,
} from "./models/Grid";
import { type ViewportModel, makeViewportModel } from "./models/Viewport";
import type { CellViewModel, FormatSpec, CellHandle } from "./models/Cell";

import { Width, Height, As, I, J } from "../types";
import { Datum } from "../../demo/mockApi/FieldTypes";

interface ViewModel {
  grid: GridViewModel;
  resolveCellView: (handle: CellHandle) => CellViewModel;
}

interface DataProvider<RH, CH> {
  getCell(row: RH, col: CH): Datum;
}
interface FormatProvider<RH, CH> {
  getFormat(row: RH, col: CH, value: Datum): FormatSpec;
}

type HeadlessDatasheet = {
  view: () => ViewModel;

  updateColumnWidth(colId: ColHandle, width: Width): void;
  updateRowHeight(rowId: RowHandle, height: Height): void;

  updatePinnedRows(
    updateFn: (frozenRows: Set<RowHandle>) => Set<RowHandle>
  ): void;
  updatePinnedCols(
    updateFn: (frozenCols: Set<ColHandle>) => Set<ColHandle>
  ): void;

  updateViewportDims(dims: { vw?: Width; vh?: Height }): void;

  updateCellFormat(handle: CellHandle, fmt: Partial<FormatSpec>): void;
  updateCellData(handle: CellHandle, datum: Datum): void;
};

type HeadlessDatasheetConfig = {
  rowHeight: Height;
  columnWidth: Width;
};

export const makeHeadlessDatasheet = (
  dataProvider: DataProvider,
  formatProvider: FormatProvider,
  config: HeadlessDatasheetConfig
): HeadlessDatasheet => {
  const viewModel: ViewModel = {
    grid: {
      rows: makeVirtualRowSet((i: I) => ({ i, h: config.rowHeight })),
      cols: makeVirtualColSet((j: J) => ({ j, w: config.columnWidth })),
      pinnedRows: new Set(),
      pinnedCols: new Set(),
    },
    resolveCellView: (handle): CellViewModel => {
      const { i, j } = handle;
      const value = dataProvider.getCell(i, j);
      const formatting = formatProvider.getFormat(i, j, value);

      return {
        datum: value,
        formatting: formatting,
        handle: handle,
      };
    },
  };

  return {
    view: () => {
      return viewModel;
    },

    updateColumnWidth: (colId: ColHandle, width: Width): void => {
      viewModel.grid.cols.patch(colId, { w: width });
    },
    updateRowHeight: (rowId: RowHandle, height: Height): void => {},

    updatePinnedRows: (
      updateFn: (frozenRows: Set<RowHandle>) => Set<RowHandle>
    ) => {},
    updatePinnedCols: (
      updateFn: (frozenCols: Set<ColHandle>) => Set<ColHandle>
    ) => {},

    updateViewportDims: ({ vw, vh }): void => {
      if (vw != null) {
        viewModel.grid.viewport_rx = vw;
      }
      if (vh != null) {
        viewModel.grid.viewport_ry = vh;
      }
    },

    updateCellFormat: (
      handle: CellHandle,
      fmt: Partial<FormatSpec>
    ): void => {},
    updateCellData: (handle: CellHandle, datum: Datum): void => {},
  };
};

// export const HeadlessDatasheet = () => {
//     viewModel: () =>
// }
