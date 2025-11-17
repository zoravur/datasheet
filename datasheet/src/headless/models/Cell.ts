import { I, J } from "../../types";

type Datum = string | number;

export type BorderStyle = "none" | "solid" | "dashed" | "dotted" | "double";

export type HorizontalAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";

export type WrapStrategy = "overflow" | "wrap" | "clip";

export type FontSpec = {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
};

export type BorderSpec = {
  style: BorderStyle;
  color: string;
  width: number; // px
};

export type AlignmentSpec = {
  horizontal: HorizontalAlign;
  vertical: VerticalAlign;
  wrap: WrapStrategy;
};

export type DataValidation =
  | { type: "none" }
  | { type: "dropdown"; values: string[] }
  | {
      type: "checkbox";
      trueLabel?: string;
      falseLabel?: string;
    };

export type FormatSpec = {
  font: FontSpec;
  fill: string | null;
  borders: {
    top: BorderSpec;
    right: BorderSpec;
    bottom: BorderSpec;
    left: BorderSpec;
  };
  alignment: AlignmentSpec;
  numberFormat?: string; // raw Excel-ish pattern
  conditional?: unknown; // your engine drives this anyway
  validation?: DataValidation;
  hidden?: boolean;
};

export type CellHandle<RH, CH> = {
  rh: RH;
  ch: CH;
};

export type CellViewModel<RH, CH> = {
  datum: Datum;
  formatting: FormatSpec;
  handle: CellHandle<RH, CH>;
};
