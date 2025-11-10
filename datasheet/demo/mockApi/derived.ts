import { Id, Datum } from "./FieldTypes";
import { ConditionalExcept, ConditionalKeys, Except } from "type-fest";
import { ReadQueryParams } from "./ReadQueryParams";
import { ResourceMap } from "./resources";

// type ApiData<R, Cols extends readonly (keyof R)[]> = {
//   columns: Cols;
//   rows: Array<{ [I in keyof Cols]: R[Cols[I]] }>;
// };

type ApiData<R> = R[];

export type NonIdFields<R> = ConditionalExcept<R, Id>;
// export type AtField<R> = {
//   [K in keyof R]: K extends `${infer Stem}At` ? K : never;
// }[keyof R];
// export type IdField<R> = {
//   [K in keyof R]: K extends `${infer Stem}Id` ? K : never;
// }[keyof R];

// Small, predictable utilities
type IdField<R> = Extract<keyof R, `${string}Id`>;
type AtField<R> = Extract<keyof R, `${string}At`>;
export type PrimaryIdKey<Name extends string, R> = `${Name}Id` & keyof R;

export type ServerManagedField<Name extends string, R> =
  | PrimaryIdKey<Name, R>
  | AtField<R>;
export type ClientImmutableField<R> = AtField<R> | IdField<R>;

export type CreateOrUpdateResponse<Name extends string, R> = { [K in Name]: R };
export const DeleteStatus = {
  SUCCESS: "STATUS_SUCCESS",
  NO_SUCH_RESOURCE: "STATUS_NO_SUCH_RESOURCE",
  ERROR: "STATUS_ERROR",
} as const;
export type DeleteResponse = (typeof DeleteStatus)[keyof typeof DeleteStatus];
// export type CreateBodyFields< = ConditionalExcept<ServerManagedField

export type ResourceApi<Name extends string, R> = {
  create(
    body: Omit<R, ServerManagedField<Name, R>>
  ): Promise<CreateOrUpdateResponse<Name, R>>;
  read(query: ReadQueryParams<R>): Promise<ApiData<R>>;
  update(
    id: R[PrimaryIdKey<Name, R>],
    body: Partial<Except<R, ClientImmutableField<R>>>
  ): Promise<CreateOrUpdateResponse<Name, R>>;
  delete(primaryId: R[PrimaryIdKey<Name, R>]): Promise<DeleteResponse>;
};
