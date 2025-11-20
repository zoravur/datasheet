import { h, type VNode } from "snabbdom";
// import { getCellOverlappingPoint, NativeSheetView } from "../NativeSheetView";
import { type Logger, Point, point } from "../../util/util";
import { type Ref, decodeCString } from "../../util/util";
import { CreateDragHandlers } from "./input/CreateMouseHandlers";
// import { patch } from './render';
import { CellInput } from "./CellInput";
// import { SheetController } from './SheetController';
// import { RexController as SheetController } from ".";
import { patch } from "../../main";
import { type Slice } from "../slice";
import { store } from "../../store";
// import { keydownHandler } from "./input/keyboard";

const CELL_HEIGHT = 30;
const CELL_WIDTH = 180;
// const VIEWPORT_WIDTH

// export const CELL_HEIGHT = 24; // keep your constants
// export const CELL_WIDTH = 100;

type Row = {
  values: any[];
  cursorHandle: string;
  rowHandle?: string;
  cellHandles?: any[];
};

type BufferData = {
  columns: { name: string }[];
  order: string[]; // cursorHandles in display order
  rows: Record<string, Row>; // handle -> row
};

export const sheetSurface = (slice: any) => {
  const { data, viewInfo } = slice as {
    data: BufferData | null;
    viewInfo: any;
  };
  if (!data) return;

  const originRow = Math.floor(viewInfo.originY / CELL_HEIGHT);
  const originCol = Math.floor(viewInfo.originX / CELL_WIDTH);
  const visRows = Math.floor(viewInfo.viewportY / CELL_HEIGHT) + 1;
  const visCols = Math.floor(viewInfo.viewportX / CELL_WIDTH) + 1;

  const rowsCap = data.order.length;
  const colsCap = data.columns.length;

  const tableHeight = rowsCap * CELL_HEIGHT;
  const tableWidth = colsCap * CELL_WIDTH;

  return {
    originRow,
    originCol,
    rowsCap,
    colsCap,
    visRows,
    visCols,
    tableHeight,
    tableWidth,

    getRowOffset: (i: number) =>
      CELL_HEIGHT * (i + originRow) - viewInfo.originY,
    getColOffset: (j: number) =>
      CELL_WIDTH * (j + originCol) - viewInfo.originX,
    getRowHeight: (_i: number) => CELL_HEIGHT,
    getColWidth: (_j: number) => CELL_WIDTH,

    getHeaderText: (j: number) => {
      const col = data.columns?.[j + originCol];
      if (col?.name) return col.name;
      let n = j,
        label = "";
      do {
        label = String.fromCharCode((n % 26) + 65) + label;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      return label;
    },

    // Use buffered order + map; never reorder existing entries.
    getCellText: (i: number, j: number) => {
      const rowIndex = i + originRow;
      if (rowIndex < 0 || rowIndex >= data.order.length) return undefined;
      const handle = data.order[rowIndex];
      const row = data.rows[handle];
      if (!row) return undefined;
      return row.values?.[j + originCol];
    },

    getCellOverlappingPoint: (x: number, y: number) => {
      const j = Math.floor((x + viewInfo.originX) / CELL_WIDTH - originCol);
      const i = Math.floor((y + viewInfo.originY) / CELL_HEIGHT - originRow);
      return [i, j] as const;
    },
  };
};

export type SheetSurface = ReturnType<typeof sheetSurface>;

interface SheetController {
  updateViewportScroll: Function;
  updateCell: Function;
  handleKeyNavigation: Function;
  updateRectangleSelection: Function;
}

const sheetController = (self: SheetView) => {
  return {
    updateViewportScroll: (ox: number, oy: number, vx: number, vy: number) => {
      const ss = self.getSheetSurface();

      const payload = {
        originX: ox,
        originY: oy,
        viewportX: vx,
        viewportY: vy,
      };

      if (ss) {
        const [middleRow, middleCol] = ss.getCellOverlappingPoint(
          ox + vx / 2,
          oy + vy / 2
        );

        Object.assign(payload, { middleRow, middleCol });
      }

      store.dispatch({
        type: "sheet/updateViewportScroll",
        payload,
      });
    },
    updateCell: (i: number, j: number, val: unknown) => {
      console.log(JSON.stringify(store.state["components/workspace"]));
      store.dispatch({
        type: "HTTP/api/edit",
        payload: {
          cell: store.state["components/workspace"].data!.rows[i].cellHandles[
            j
          ],
          // column: store.state["components/workspace"].data!.columns[j],
          value: val,
        },
      });
    },
    handleKeyNavigation: (...args) =>
      console.log("updateKeyNaviation called", ...args),
    updateRectangleSelection: (...args) => {},
    // console.log("updateRectangleSelection called", ...args),
  };
};

export const CORNER_HEADER_DIMS = point({ x: 48, y: 24 });
// const TOTAL_DIMS = point({ x: 100000, y: 100000 });

export class SheetView {
  private vnode?: VNode;
  private canvasRef: Ref<HTMLCanvasElement>;
  private log: Logger;
  // private nativeSheetView?: NativeSheetView;
  private sheetSurface?: SheetSurface;

  /* View variables */
  private viewportDims?: Point;
  private scroll: Point;
  private observer: ResizeObserver;
  private editing?: Point;

  /* CALLBACKS */
  private controller: SheetController;
  // @TODO: Replace each of these private methods with the controller above
  private updateViewportScroll: Function;
  private updateRectangleSelection: Function;
  private updateCell: Function;
  private handleKeyNavigation: Function;

  constructor() {
    const controller = sheetController(this);
    this.scroll = point({});
    this.canvasRef = { current: null };
    this.log = () => {};
    this.controller = controller;
    this.updateViewportScroll = controller.updateViewportScroll;
    this.updateRectangleSelection = controller.updateRectangleSelection;
    this.updateCell = controller.updateCell;
    this.handleKeyNavigation = controller.handleKeyNavigation;
    this.viewportDims = point({});
    this.observer = new ResizeObserver((entries) => {
      for (const entr of entries) {
        const { width, height } = entr.contentRect;
        // const resizeEvent = new CustomEvent('resize', {
        //   detail: { width, height, entry: entr },
        //   bubbles: true,
        //   cancelable: true
        // });
        // console.log(resizeEvent);

        const newDims = point({ x: width, y: height });
        if (this.viewportDims == null || !this.viewportDims.equals(newDims)) {
          this.viewportDims = point({ x: width, y: height });
          this.updateViewportScroll(
            this.scroll.x,
            this.scroll.y,
            this.viewportDims.x,
            this.viewportDims.y
          );
          this.render();
          this.draw();
        }
      }
    });
    // this.sheetSurface = ss;
  }

  setLogger(log: Logger) {
    this.log = log;
  }

  setSheetSurface(ss: SheetSurface) {
    // this.nativeSheetView = nativeSheetView;
    this.sheetSurface = ss;
    this.draw();
  }

  getViewportDims = (): Point => {
    if (this.viewportDims == null) {
      throw Error(
        "Unexpected null viewport dimensions when accessing SheetView.viewportDims"
      );
    }
    return this.viewportDims;
  };

  getCanvas = (): HTMLCanvasElement => {
    const canvas = this.canvasRef.current;
    if (canvas == null) {
      throw Error("Unexpected null when accessing SheetView.canvasRef");
    }
    return canvas;
  };

  static get2DContext = (
    canvas: HTMLCanvasElement
  ): CanvasRenderingContext2D => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw Error("Failed to get 2d context");
    }
    return ctx;
  };

  // getNativeSheetView = (): NativeSheetView => {
  //   if (this.nativeSheetView == null) {
  //     throw Error(
  //       "Unexpected null nativeSheetView when accessing SheetView.nativeSheetView"
  //     );
  //   }
  //   return this.nativeSheetView;
  // };

  getSheetSurface = (): SheetSurface => {
    // if (this.sheetSurface == null) {
    //   throw Error(
    //     "Unexpected null SheetSurface when accessing SheetView.sheetSurface"
    //   );
    // }
    return this.sheetSurface;
  };

  // toColumnLabel(j: number): string {
  //   let n = j;
  //   let label = "";
  //   do {
  //     label = String.fromCharCode((n % 26) + 65) + label;
  //     n = Math.floor(n / 26) - 1;
  //   } while (n >= 0);
  //   return this.sheetSurface?.getHeaderText(j) || label;
  // }

  static drawCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    highlighted: boolean,
    selected: boolean
  ) {
    ctx.fillStyle = highlighted ? "#E6EfFD" : "#ffffff";
    ctx.fillRect(x, y, w, h);

    //der (right + bottom only)
    ctx.save();
    ctx.strokeStyle = selected ? "#007dff" : "#ddd";
    const extraWidth = selected ? 1 : 0;
    ctx.lineWidth += extraWidth;

    ctx.strokeRect(
      x + extraWidth / 2,
      y + extraWidth / 2,
      w - extraWidth,
      h - extraWidth
    );
    ctx.restore();

    // text
    ctx.fillStyle = "#000";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right"; // align like .cell
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w - 4, y + h / 2); // 4px padding
  }

  getScaledCtx = (): CanvasRenderingContext2D => {
    const canvas = this.getCanvas();
    const viewportDims = this.getViewportDims();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = viewportDims.x * dpr;
    canvas.height = viewportDims.y * dpr;
    canvas.style.width = `${viewportDims.x}px`;
    canvas.style.height = `${viewportDims.y}px`;

    const ctx = SheetView.get2DContext(canvas);

    ctx.setTransform(dpr, 0, 0, dpr, -0.5 * dpr, -0.5 * dpr);
    return ctx;
  };

  draw = () => {
    requestAnimationFrame(() => {
      // stats.begin();
      // const nsv = this.getNativeSheetView();
      const ss = this.getSheetSurface();
      const ctx = this.getScaledCtx();
      if (ss == null) return;

      // draw cells
      let selI: number | undefined;
      let selJ: number | undefined;
      for (let i = ss.visRows - 1; i >= 0; --i) {
        for (let j = ss.visCols - 1; j >= 0; --j) {
          // const flags = nsv.getCellFlags(i, j);
          // const selected = Boolean(flags & 0x2);
          // if (selected) {
          //   selI = i;
          //   selJ = j;
          //   continue;
          // }
          // const highlighted = Boolean(flags & 0x1);
          const text = ss.getCellText(i, j);

          const x = ss.getColOffset(j) + CORNER_HEADER_DIMS.x;
          const w = ss.getColWidth(j);
          const h = ss.getRowHeight(i);
          const y = ss.getRowOffset(i) + CORNER_HEADER_DIMS.y;

          if (text != null) {
            SheetView.drawCell(
              ctx,
              x,
              y,
              w,
              h,
              String(text),
              false /*highlighted*/,
              false
            );
          }
        }
      }

      // if (selI != null && selJ != null) {
      //   // const flags = nsv.getCellFlags(selI, selJ);
      //   const highlighted = Boolean(flags & 0x1);
      //   const text = ss.getCellText(selI, selJ);
      //   // const cvPtr = nsv.getCellViewPtr(selI, selJ);
      //   // const text = decodeCString(cvPtr, nsv.memory.buffer);

      //   const x = ss.getColOffset(selJ) + CORNER_HEADER_DIMS.x;
      //   const y = ss.getRowOffset(selI) + CORNER_HEADER_DIMS.y;
      //   const w = ss.getColWidth(selJ);
      //   const h = ss.getRowHeight(selI);

      //   SheetView.drawCell(ctx, x, y, w, h, text, highlighted, true);
      // }

      // draw top column headers (scroll X, fixed Y)
      {
        // let xOffset = headerColWidth;
        for (let j = 0; j < ss.visCols; ++j) {
          const w = ss.getColWidth(j);
          const label = this.sheetSurface?.getHeaderText(j) ?? "";

          // apply horizontal scroll only
          let x = ss.getColOffset(j) + CORNER_HEADER_DIMS.x;

          ctx.fillStyle = "#f4f5f7";
          ctx.fillRect(x, 0, w, CORNER_HEADER_DIMS.y);

          ctx.strokeStyle = "#ccc";
          ctx.strokeRect(x, 0, w, CORNER_HEADER_DIMS.y);

          ctx.fillStyle = "#000";
          ctx.font = "600 14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, x + w / 2, CORNER_HEADER_DIMS.y / 2);

          // xOffset += w;
        }
      }

      // draw top column headers (scroll X, fixed Y)
      {
        // let xOffset = headerColWidth;
        for (let i = 0; i < ss.visRows; ++i) {
          const h = ss.getRowHeight(i);
          const label = String(ss.originRow + i + 1);

          // apply horizontal scroll only
          let y = ss.getRowOffset(i) + CORNER_HEADER_DIMS.y;

          ctx.fillStyle = "#f4f5f7";
          ctx.fillRect(0, y, CORNER_HEADER_DIMS.x, h);

          ctx.strokeStyle = "#ccc";
          ctx.strokeRect(0, y, CORNER_HEADER_DIMS.x, h);

          ctx.fillStyle = "#000";
          ctx.font = "14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, CORNER_HEADER_DIMS.x / 2, y + h / 2);

          // xOffset += w;
        }
      }

      // draw top-left corner
      ctx.fillStyle = "#D3D7CF";
      ctx.fillRect(0, 0, CORNER_HEADER_DIMS.x, CORNER_HEADER_DIMS.y);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0, 0, CORNER_HEADER_DIMS.x, CORNER_HEADER_DIMS.y);

      // stats.end();
    });
  };

  /* On insert of VNode */
  initView = (vnode: VNode) => {
    // query and set viewport dims;
    // const { width, height } = (vnode.elm as Element).getBoundingClientRect();
    // this.viewportDims = point({ x: width, y: height });
    // console.log(this.viewportDims);
    if (this.viewportDims) {
      this.updateViewportScroll(
        this.scroll.x,
        this.scroll.y,
        this.viewportDims.x,
        this.viewportDims.y
      );
      // initial render;
      // this.render();
      this.draw();
    }
  };

  render = () => {
    if (this.vnode == null) {
      throw Error(
        "Attempted to call render without first attaching to DOM tree, use view() instead in a parent node"
      );
    }
    this.vnode = patch(this.vnode, this.view());
  };

  view = () => {
    const viewportDims = this.getViewportDims();

    const children = [
      h("canvas", {
        style: {
          position: "absolute",
        },
        // TODO: think this can be removed
        // props: {
        //   width: viewportDims.x,
        //   height: viewportDims.y,
        // }
        ref: this.canvasRef,
        hook: {
          insert: this.initView,
        },
        on: {
          selectcells: (event) => {
            // console.log(event);
          },
          dragcells: (event) => {
            // console.log('dragcells');
            // console.log({ updateRectangleSelection });

            const updated = this.updateRectangleSelection(
              event.detail.startX,
              event.detail.startY,
              event.detail.currentX,
              event.detail.currentY
            );

            // console.log({ updated });

            if (updated) {
              this.draw();
            }
          },
          editcell: (event) => {
            console.log("editcell received");
            const [i, j] = this.sheetSurface?.getCellOverlappingPoint(
              event.detail.currentX,
              event.detail.currentY
            ) || [-1, -1];
            this.editing = point({ i, j });
            console.log(this.editing);
            this.render();
            const cell = point({ i, j });
            console.log({ cell });
          },
        },
      }),
      h(
        "div",
        {
          style: {
            position: "absolute",
            width: `${viewportDims.x - CORNER_HEADER_DIMS.x}px`,
            height: `${viewportDims.y - CORNER_HEADER_DIMS.y}px`,
            top: `${CORNER_HEADER_DIMS.y}px`,
            left: `${CORNER_HEADER_DIMS.x}px`,
            overflow: "auto",
          },
          on: {
            ...CreateDragHandlers(this.canvasRef),
            scroll: (e: Event) => {
              const target = e.currentTarget as HTMLDivElement;
              // console.log(e);

              this.scroll = point({
                x: target.scrollLeft,
                y: target.scrollTop,
              });
              // scroll = scroll.add(point({x: target.scrollLeft, y: target.scrollTop}));
              this.updateViewportScroll(
                this.scroll.x,
                this.scroll.y,
                viewportDims.x,
                viewportDims.y
              );
              this.draw();
              e.preventDefault();
            },
          },
        },
        [
          h("div#spacer", {
            style: {
              width: `${this.sheetSurface?.tableWidth || 0}px`,
              height: `${this.sheetSurface?.tableHeight || 0}px`,
            },
          }),
        ]
      ),
    ];

    if (this.editing) {
      const { i, j } = this.editing;
      children.push(
        CellInput(
          this.editing,
          this.sheetSurface!,
          (event: Event) => {
            console.log(
              "updating cell:",
              i,
              j,
              (event.target as HTMLInputElement).value
            );
            this.updateCell(i, j, (event.target as HTMLInputElement).value);
            this.editing = undefined;
            this.render();
          },
          (event: Event) => {
            this.editing = undefined;
            this.render();
          }
        )
      );
    }

    return h(
      "div.sheetview",
      {
        style: {
          position: "relative",
          width: `100%`,
          height: `100%`,
          overflow: `clip`,
          flexGrow: "1",
          // border: "1px solid #f00",
          // borderRadius: "5px"
          // flexGrow: '1'
        },
        props: { tabIndex: 0 },
        hook: {
          insert: (vnode) => {
            this.observer.observe(vnode.elm as HTMLElement);
            this.vnode = vnode;
            (this.vnode.elm as HTMLElement)?.focus();
          },
          destroy: (vnode) => this.observer.unobserve(vnode.elm as HTMLElement),
        },
        on: {
          keydown: (event: KeyboardEvent) => {
            // console.log("EVENT ", event)

            const dirOffsets = {
              ArrowLeft: point({ row: 0, col: -1 }),
              ArrowRight: point({ row: 0, col: 1 }),
              ArrowUp: point({ row: -1, col: 0 }),
              ArrowDown: point({ row: 1, col: 0 }),
            };

            const tag = (event.target as HTMLElement).tagName.toLowerCase();
            if (tag === "input" && event.key.length === 1) return;

            if (event.key === "Escape") {
              event.preventDefault();
              return;
            }

            // if (event.key === "Enter" || event.key.length === 1) {
            //   // if (this.editing) {
            //   // this.editing = undefined;
            //   // } else {
            //   this.editing = point({
            //     i: this.sheetSurface?.selI,
            //     j: this.sheetSurface?.selJ,
            //   });
            //   // }

            //   this.draw();
            //   this.render();

            //   // this.editing = getCellOverlappingPoint()
            //   // const input = document.querySelector(
            //   //   `input[data-row="${row}"][data-col="${col}"]`
            //   // ) as HTMLInputElement;
            //   // if (input !== document.activeElement) {
            //   //   if (event.key.length === 1) input.value = '';
            //   // }
            //   // return;
            // }

            // console.log(event.key);
            const offset = dirOffsets[event.key as keyof typeof dirOffsets];
            if (offset == null) return;

            event.preventDefault();

            this.handleKeyNavigation(
              offset.i,
              offset.j,
              event.getModifierState("Shift")
            );
            this.draw();
          },
        },
      },
      children
    );
  };
}
