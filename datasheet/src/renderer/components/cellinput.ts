import { h, VNodeStyle, type VNode } from "snabbdom";
import { CellViewModel } from "../../headless/models/Cell";
import { A, X, Y, Width, Height } from "../../types";

const makeCellPositioning = (
  x: A<X>,
  y: A<Y>,
  w: Width,
  h: Height
): VNodeStyle => {
  return {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    width: `${w}px`,
    height: `${h}px`,
  };
};

export const CellInput = <RH, CH>(
  cell: CellViewModel<RH, CH>,
  onChange: (event: Event) => void,
  onFocusOut: (event: Event) => void
) => {
  const { x, y, w, h: cellHeight } = cell.dims; // naming conflict
  return h(
    "textarea",
    {
      on: {
        change: onChange,
        blur: onFocusOut,
      },
      props: {
        value: cell.datum,
      },
      style: makeCellPositioning(x, y, w, cellHeight),
      hook: {
        // TODO: hooks could be cleaner;
        // - don't like the ?. pattern
        // - onFocusOut could handle focusing the parent instead
        insert: (vnode: VNode) => {
          (vnode.elm as HTMLElement)?.focus();
        },
        destroy: (vnode: VNode) => {
          vnode.elm?.parentElement?.focus();
        },
      },
    },
    []
  );
};
