import { h, type VNode } from "snabbdom";
import { Height, Width } from "../../../types";

export const Scroller = (tableWidth: Width, tableHeight: Height) => {
  return h(
    "div",
    {
      style: {
        position: "absolute",
        // width: `${viewportDims.x - CORNER_HEADER_DIMS.x}px`,
        // height: `${viewportDims.y - CORNER_HEADER_DIMS.y}px`,
        // top: `${CORNER_HEADER_DIMS.y}px`,
        // left: `${CORNER_HEADER_DIMS.x}px`,
        // overflow: "auto",
      },
      on: {
        // ...CreateDragHandlers(this.canvasRef),
        // scroll: (e: Event) => {
        //   const target = e.currentTarget as HTMLDivElement;
        //   // console.log(e);
        //   this.scroll = point({
        //     x: target.scrollLeft,
        //     y: target.scrollTop,
        //   });
        //   // scroll = scroll.add(point({x: target.scrollLeft, y: target.scrollTop}));
        //   this.updateViewportScroll(
        //     this.scroll.x,
        //     this.scroll.y,
        //     viewportDims.x,
        //     viewportDims.y
        //   );
        //   this.draw();
        //   e.preventDefault();
        // },
      },
    },
    h("div#spacer", {
      style: {
        width: `${tableWidth}px`,
        height: `${tableHeight}px`,
      },
    })
  );
};
