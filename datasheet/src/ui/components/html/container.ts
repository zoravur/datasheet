import { h, type VNode } from "snabbdom";

const makeContainerStyles = () => {
  return {
    position: "relative",
    width: `100%`,
    height: `100%`,
    overflow: `clip`,
    flexGrow: "1",

    // next two are together
    border: "1px solid #f00",
    boxSizing: "border-box",

    // borderRadius: "5px"
    // flexGrow: '1'
  };
};

export const Container = (children: Array<VNode>) => {
  return h(
    "div.sheetview",
    {
      style: makeContainerStyles(),
      // props: { tabIndex: 0 },
      hook: {
        insert: (vnode) => {
          const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect;
            }
          });
        },
      },
      on: {
        //
      },
    },
    children
  );
};
