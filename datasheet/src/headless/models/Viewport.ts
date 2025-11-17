import { Brand, Width, Height, X, Y, A, R, I, J, As } from "../../types";

export type ViewportModel = {
  sx: A<X>; // scroll offset x (absolute);
  sy: A<Y>; // scroll offset y (absolute);
  w: Width; // viewport width;
  h: Height; // viewport height;
};

export const makeViewportModel = () => {
  return {
    sx: As.Ax(0),
    sy: As.Ay(0),
    w: As.Width(100), // easy to see default; resized on first render anyway
    h: As.Height(100), // as above
  };
};
