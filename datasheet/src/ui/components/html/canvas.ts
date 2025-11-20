import { h, type VNode } from "snabbdom";

export const Canvas = () => {
  return h("canvas", {
    style: {
      position: "absolute",
    },
    // ref: canvasRef,
    hook: {
      insert: initView,
    },
    on: {
      // ...
    },
  });
};
