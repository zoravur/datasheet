// @ts-nocheck
import { h, VNode, VNodeChildren } from 'snabbdom';
import { Ref } from '../util';

export const ResizeHandleFactory = () => {
  const observer = new ResizeObserver((entries) => {
    for (const entr of entries) {
      const { width, height } = entr.contentRect;
      const resizeEvent = new CustomEvent('resize', {
        detail: { width, height, entry: entr },
        bubbles: true,
        cancelable: true
      });
      const parentElement = entr.target as HTMLDivElement;
      parentElement.dispatchEvent(resizeEvent);
    }
  });

  return (
    parentRef: Ref<VNode>,
    content: VNodeChildren,
    resizeDir: string = 'horizontal',
    index: number = -1
  ) => {
    const handle = h(
      'div',
      {
        style: {
          right: '0px',
          bottom: '0px',
          width: '100%',
          minHeight: '1.5em',
          resize: resizeDir,
          overflow: 'auto'
        },
        on: {
          resize: (event) => {
            // console.log(parentRef.current);
            if (!parentRef.current) return;
            const elm = parentRef.current.elm as HTMLElement;
            if (event.target instanceof HTMLDivElement) {
              // console.log({ event });
              event.detail.index = index;
              event.detail.resizeDir = resizeDir;
              requestAnimationFrame(() => {
                // console.log("UPDATING");

                elm.style.width = `${
                  event.detail?.width ?? event.target.getBoundingClientRect().width
                }px`;

                elm.style.height = `${
                  event.detail?.height ?? event.target.getBoundingClientRect().height
                }px`;

                // console.log(elm.style.width);
              });
            }
          }
        },
        hook: {
          insert: (vnode) => observer.observe(vnode.elm as HTMLElement),
          destroy: (vnode) => observer.unobserve(vnode.elm as HTMLElement)
        }
      },
      content
    );
    return handle;
  };
};

export const ResizeHandle = ResizeHandleFactory();
