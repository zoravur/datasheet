import { type VNode } from "snabbdom";
import { drawCell } from "./canvas/canvasRenderer";
import { CellInput } from "./html/cellinput";
import type {
  ViewModel,
  Cursor,
  ViewController,
} from "../../headless/Headless";
import { Canvas } from "./html/canvas";
import { Scroller } from "./html/scroller";
import { Container } from "./html/container";
import { As } from "../../types";

export const Datasheet = <RH, CH>(
  model: ViewModel<RH, CH, Cursor<RH, CH>>,
  controller: ViewController<RH, CH, Cursor<RH, CH>>
) => {
  const canvas = Canvas();

  const tableWidth = As.Width(10000); // TODO: Fetch actual total heights from viewmodel x and y indexes
  const tableHeight = As.Height(10000);
  const scroller = Scroller(tableWidth, tableHeight);

  const children = [canvas, scroller];

  return Container(children);
};
