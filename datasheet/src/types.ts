export type Brand<T, U> = T & { __brand: U };
export type Width = number & { __brand: "Width" };
export type Height = number & { __brand: "Height" };
export type X = Brand<number, "X">;
export type Y = Brand<number, "Y">;
export type A<X> = Brand<number, Brand<X, "Absolute">>;
export type R<X> = Brand<number, Brand<X, "Relative">>;

export type I = Brand<number, "I">;
export type J = Brand<number, "J">;

export const As = {
  Height(n: number): Height {
    return n as Height;
  },
  Width(n: number): Width {
    return n as Width;
  },
  Ax(n: number): A<X> {
    return n as A<X>;
  },
  Ay(n: number): A<Y> {
    return n as A<Y>;
  },
  Rx(n: number): R<X> {
    return n as R<X>;
  },
  Ry(n: number): R<Y> {
    return n as R<Y>;
  },
};
