import type { Hooks } from "snabbdom";
import type { ViewModel } from "../../headless/Headless";

export const CanvasLifecycleHook: Hooks = {
  insert: (vnode) => {},
};

const insertHook =
  <RH, CH>(viewModel: ViewModel): InsertHook =>
  (vnode) => {
    viewModel.updateViewportScroll();
  };
