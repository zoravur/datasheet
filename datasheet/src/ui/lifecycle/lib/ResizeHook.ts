import type { VNode } from "snabbdom";

// Define the state shape
interface ResizeState {
  observer: ResizeObserver;
  currentCallback: (entry: ResizeObserverEntry) => void;
}

// Static module-level storage.
// Since it is a WeakMap, it does not count as "global state" pollution
// because the data dies when the DOM element dies.
const resizeState = new WeakMap<Node, ResizeState>();

export const ResizeHook = {
  insert: (vnode: VNode) => {
    const callback = vnode.data?.props?.onResize;
    if (!callback || !vnode.elm) return;

    const elm = vnode.elm;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Get the latest state for this specific element
        const state = resizeState.get(elm);
        if (state) {
          state.currentCallback(entry);
        }
      }
    });

    ro.observe(elm as Element);

    // Save to WeakMap
    resizeState.set(elm, {
      observer: ro,
      currentCallback: callback,
    });
  },

  update: (_: VNode, newVnode: VNode) => {
    if (!newVnode.elm) return;

    const state = resizeState.get(newVnode.elm);
    const newCallback = newVnode.data?.props?.onResize;

    if (state && newCallback) {
      // Update the ref so the existing observer calls the new function
      state.currentCallback = newCallback;
    }
  },

  destroy: (vnode: VNode) => {
    if (!vnode.elm) return;

    const state = resizeState.get(vnode.elm);
    if (state) {
      state.observer.disconnect();
      resizeState.delete(vnode.elm);
    }
  },
};
