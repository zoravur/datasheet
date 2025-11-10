import { h, type VNode } from "snabbdom";
// import { RexModel } from "..";
import { type SheetSurface } from "./sheetview";
// import { NativeSheetView } from "../../NativeSheetView";
import { Point } from "../../util/util";

import { CORNER_HEADER_DIMS } from "./sheetview";

export const CellInput = (
  cell: Point,
  nativeSheetView: SheetSurface,
  onChange: (event: Event) => void,
  onFocusOut: (event: Event) => void
) => {
  const text = nativeSheetView?.getCellText(cell.i, cell.j);

  const rowOffset = nativeSheetView?.getRowOffset(cell.row);
  const colOffset = nativeSheetView?.getColOffset(cell.col);
  const width = nativeSheetView?.getColWidth(cell.col);
  const height = nativeSheetView?.getRowHeight(cell.row);

  return h(
    "textarea",
    {
      on: {
        change: onChange,
        blur: onFocusOut,
      },
      style: {
        position: "absolute",
        top: rowOffset + CORNER_HEADER_DIMS.y + "px",
        left: colOffset + CORNER_HEADER_DIMS.x + "px",
        width: width + "px",
        height: height + "px",
      },
      props: {
        value: text,
      },
      hook: {
        insert: (vnode: VNode) => {
          (vnode.elm as HTMLElement)?.focus();
        },
        destroy: (vnode: VNode) => {
          vnode.elm?.parentElement?.focus();
        },
      },
      key: `(${cell.i},${cell.j})`,
    },
    []
  );
};
