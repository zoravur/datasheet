import { type Module, type VNode, type VNodeData } from "snabbdom";

type Ref<T = Element> = { current: T | null };

/* one tiny helper so we don’t repeat ourselves */
function set(el: Element | null, ref?: Ref) {
  if (ref) ref.current = el as any;
}

const updateRefs =
  (lifecycle: string) =>
  (oldVnode: VNode, vnode?: VNode): void => {
    const oldRef = (oldVnode.data as VNodeData).ref;
    const ref = vnode && (vnode.data as VNodeData).ref;
    const elm: Element = (vnode && vnode.elm) as Element;
    let name: string;

    if (oldRef) {
      if (oldRef.current === oldVnode.elm) {
        set(null, oldRef);
      }
    }

    if (ref) {
      set(elm, ref);
    }
  };

export const refModule: Module = {
  /* new vnode created */
  create: updateRefs("CREATE"),
  /* same dom node reused, but its data object may have a new ref */
  update: updateRefs("UPDATE"),
  /* node is nuked */
  destroy: updateRefs("DESTROY"),
};
