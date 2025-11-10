import type { ResourceMap } from "./resources";

type ServerManagedKey = string;

export type IdKey = `${string}Id`;

// export type PrimaryIdKey<T extends keyof ResourceMap> = {
//   [K in keyof ResourceMap[T]]: K extends `${T}Id` ? K : never;
// }[keyof ResourceMap[T]];

// Primary id key for a resource name K ("user" -> "userId"),
// but only if it exists.
export type PrimaryIdKey<K extends keyof ResourceMap> = `${K &
  string}Id` extends keyof ResourceMap[K]
  ? `${K & string}Id`
  : never;

// export type CreateBody<T> = Omit<T, PrimaryIdKey<T> | ServerManagedKey>;

// export type UpdateBody<T> = Partial<Omit<T, IdKey | ServerManagedKey>>;
