import { type VNode } from "snabbdom";
import { drawCell } from "./canvas/canvasRenderer";
import { CellInput } from "./html/cellinput";
import { ViewModel, Cursor } from "../../headless/Headless";

export const renderCells = <RH, CH>(
  viewModel: ViewModel<RH, CH, Cursor<RH, CH>>,
  ctx: CanvasRenderingContext2D,
  container: Array<VNode>
) => {
  const { row: topRow, col: leftCol } = viewModel.topLeft;
  const vp = viewModel.viewportModel;

  for (let tr = topRow.clone(); tr.coord <= vp.sy + vp.h; tr.next()) {
    const rowStub = tr.current();
    if (rowStub == null) {
      break;
    }

    for (let lc = leftCol.clone(); lc.coord <= vp.sx + vp.w; lc.next()) {
      const colStub = lc.current();
      if (colStub == null) {
        break;
      }

      const {
        datum,
        formatting,
        dims: { x, y, w, h },
      } = viewModel.resolveCellView({ row: tr, col: lc });

      drawCell(ctx, x, y, w, h, datum, formatting);
    }
  }

  if (viewModel.editing != null) {
    container.push(
      CellInput(
        viewModel.resolveCellView(viewModel.editing),
        () => {
          console.log("TODO: onchange");
        },
        () => {
          console.log("TODO: onFocusOut");
        }
      )
    );
  }
  viewModel.editing;
};
