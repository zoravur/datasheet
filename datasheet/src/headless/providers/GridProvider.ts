import { Brand, Width, Height, X, Y, A, R, I, J } from "../../types";
import { ViewportModel } from "../models/Viewport";

type GridSliceModel = {
  top: R<Y>;
  left: R<X>;
  startI: I;
  endI: I;
  startJ: J;
  endJ: J;
  hs: Array<Height>; // invariant: hs.length == endI - startI;
  ws: Array<Width>; // invariant: ws.length == endJ - startJ;
};

type GridProvider = {
  measureGrid(vp: ViewportModel): GridSliceModel;
};

type EditableGrid = {};

export const makeGridProvider = {};
