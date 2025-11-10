import { type Ref } from "../../../util/util";
import { type VNode } from "snabbdom";

type Offset = { offsetX: number; offsetY: number };

const drawDebugDot = (
  parent: HTMLElement,
  { offsetX, offsetY }: Offset,
  color: string,
  z = 9999
) => {
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.width = "1px";
  dot.style.height = "1px";
  dot.style.top = `${offsetY}px`;
  dot.style.left = `${offsetX}px`;
  dot.style.backgroundColor = color;
  dot.style.pointerEvents = "none";
  dot.style.zIndex = `${z}`;
  parent.appendChild(dot);
  // toggle this to remove later if needed
  setTimeout(() => {
    parent.removeChild(dot);
  }, 1000);
};

const getOffset = (event: MouseEvent): Offset => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  return {
    offsetX: event.pageX - rect.left,
    offsetY: event.pageY - rect.top,
  };
};

export const CreateDragHandlers = (ref: Ref<EventTarget>) => {
  let startX: number;
  let startY: number;
  let dragging = false;

  return {
    mousedown: (event: MouseEvent) => {
      const offset = getOffset(event);
      // drawDebugDot(event.currentTarget as HTMLElement, offset, "limegreen");
      startX = offset.offsetX;
      startY = offset.offsetY;
      ref.current?.dispatchEvent(
        new CustomEvent("dragcells", {
          detail: {
            startX,
            startY,
            currentY: startY,
            currentX: startX,
            deltaX: 0,
            deltaY: 0,
          },
          bubbles: true,
          cancelable: true,
        })
      );
      dragging = true;
    },

    mousemove: (event: MouseEvent) => {
      if (!dragging) return;

      const offset = getOffset(event);
      // drawDebugDot(event.currentTarget as HTMLElement, offset, "yellow");

      const currentX = offset.offsetX;
      const currentY = offset.offsetY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      if (!ref.current) {
        console.log("fail");
      }

      ref.current?.dispatchEvent(
        new CustomEvent("dragcells", {
          detail: { startX, startY, currentX, currentY, deltaX, deltaY },
          bubbles: true,
          cancelable: true,
        })
      );
    },

    mouseup: (event: MouseEvent) => {
      if (!dragging) return;
      dragging = false;

      const offset = getOffset(event);
      // drawDebugDot(event.currentTarget as HTMLElement, offset, "green");

      const endX = offset.offsetX;
      const endY = offset.offsetY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      ref.current?.dispatchEvent(
        new CustomEvent("selectcells", {
          detail: { startX, startY, endX, endY, deltaX, deltaY },
          bubbles: true,
          cancelable: true,
        })
      );
    },

    dblclick: (event: MouseEvent) => {
      // if (!dragging) return;
      // dragging = false;
      console.log("dblclick");

      const offset = getOffset(event);

      const currentX = offset.offsetX;
      const currentY = offset.offsetY;

      ref.current?.dispatchEvent(
        new CustomEvent("editcell", {
          detail: { currentX, currentY },
          bubbles: true,
          cancelable: true,
        })
      );
    },
  };
};
