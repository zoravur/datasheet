type SortDirection = "asc" | "desc";

// For APIs that allow sort=field or sort=field,-otherField
type SortParam = `${string}` | `-${string}`;

// For projection: comma-separated "fields=a,b,c" OR an array backend can accept
type FieldsParam = string | string[];

// Cursor pagination dominates offset pagination in grown-up systems
type CursorPagination = {
  cursor?: string; // Opaque token
  limit?: number; // Max page size
};

// Offset fallback for mock data or analytics-style scans
type OffsetPagination = {
  offset?: number;
  limit?: number;
};

// Simple equality filters: ?status=active&owner=zorv
// Range suffixes: created_after, created_before, etc.
type FilterOps =
  | `${string}` // Equals
  | `${string}_contains` // name_contains
  | `${string}_starts_with` // name_starts_with
  | `${string}_ends_with` // name_ends_with
  | `${string}_lt` // amount_lt
  | `${string}_lte`
  | `${string}_gt`
  | `${string}_gte`
  | `${string}_after` // time_after
  | `${string}_before`; // time_before

// Expand / include: "?include=author,comments"
type IncludeParam = string | string[];

// Full-text search
type SearchParam = string;

// Consistency checks
type ConsistencyParams = {
  since?: string; // ISO timestamp
  revision?: string | number; // Snapshot ID
};

// Debug / meta
type MetaParams = {
  debug?: boolean;
  trace_id?: string;
};

export type ReadQueryParams<T> = {
  sort?: SortParam | SortParam[];
  fields?: FieldsParam;
  include?: IncludeParam;
  q?: SearchParam;
} & CursorPagination &
  OffsetPagination &
  ConsistencyParams &
  MetaParams & {
    // The real meat: arbitrary filters
    [K in FilterOps]?: string | number | boolean;
  };
