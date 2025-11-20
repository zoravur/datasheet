import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
  toVNode,
} from "snabbdom";
import { setupStore, store } from "./store";
import type { Row, SheetData, State } from "./store";
import { As } from "../src/types";
import type { A, Brand, Datum, Height, I, J, Width, X, Y } from "../src/types";
import type {
  DataProvider,
  FormatProvider,
  HeadlessDatasheet,
  ViewModel,
} from "../src/headless/Headless";
import { makeHeadlessDatasheet } from "../src/headless/Headless";
import { Datasheet } from "../src/ui/components/SheetView";
import type { FormatSpec } from "../src/headless/models/Cell";
import { ArrayIndex } from "../src/headless/ArrayIndex";
import type { Index } from "../src/headless/Index";
// import { Column}

const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
]);

type RowHandle = Brand<number, "RowHandle">;
type ColHandle = Brand<string, "ColHandle">;

const DATUM_UNDEFINED = "DATUM_UNDEFINED";

const makeDataProvider = (
  sheetData: SheetData
): DataProvider<RowHandle, ColHandle> => {
  return {
    getDatum(row: RowHandle, col: ColHandle): Datum {
      const colIdx = sheetData.columns.indexOf(col);

      if (colIdx == -1) {
        return DATUM_UNDEFINED;
      }

      return sheetData.rows[row]?.[colIdx] ?? DATUM_UNDEFINED;
    },
    updateDatum(row: RowHandle, col: ColHandle, datum: Datum) {
      console.log(`UPDATE row=${row} col=${col} datum=${datum}`);
    },
  };
};

const makeFormatProvider = (): FormatProvider<RowHandle, ColHandle> => {
  const defaultFormatSpec: FormatSpec = {
    font: {
      family: "sans-serif",
      size: 14,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: "#000000",
    },

    fill: "#ffffff", // white background (standard grid default)

    borders: {
      top: {
        style: "solid",
        color: "#dddddd",
        width: 1,
      },
      right: {
        style: "solid",
        color: "#dddddd",
        width: 1,
      },
      bottom: {
        style: "solid",
        color: "#dddddd",
        width: 1,
      },
      left: {
        style: "solid",
        color: "#dddddd",
        width: 1,
      },
    },

    alignment: {
      horizontal: "left",
      vertical: "middle",
      wrap: "overflow", // Excel-like “just spill unless clipped”
    },

    // numberFormat: undefined, // render raw text unless user specifies format
    // conditional: undefined,
    validation: { type: "none" },
    hidden: false,
  };

  return {
    getFormat(row, col, value) {
      return defaultFormatSpec;
    },
  };
};

async function setup() {
  await setupStore();

  const dataProvider = makeDataProvider(store.state.data);
  const formatProvider = makeFormatProvider();
  const horizontalIndex = new ArrayIndex<Width, ColHandle, A<X>>();
  const verticalIndex = new ArrayIndex<Height, RowHandle, A<Y>>();

  const headlessDatasheet = makeHeadlessDatasheet<RowHandle, ColHandle>(
    dataProvider,
    formatProvider,
    horizontalIndex,
    verticalIndex,
    {
      rowHeight: As.Height(25),
      columnWidth: As.Width(100),
    }
  );

  const containerEl = document.getElementById("demo");
  if (containerEl) {
    let container = toVNode(containerEl);

    function view(
      state: State,
      headlessDatasheet: HeadlessDatasheet<
        RowHandle,
        ColHandle,
        Index<Width, ColHandle, A<X>>,
        Index<Height, RowHandle, A<Y>>
      >
    ) {
      return h("div#demo", [
        h(
          "button",
          {
            on: {
              click(ev, vnode) {
                store.dispatch({
                  type: "api/fetch",
                  payload: { resource: "user" },
                });
              },
            },
          },
          "Query"
        ),
        Datasheet(headlessDatasheet.view()),
      ]);
    }

    function render() {
      container = patch(container, view(store.state, headlessDatasheet));
    }

    render();
    store.subscribe(() => {
      // console.log("render");
      render();
    });
  }
}

setup();
