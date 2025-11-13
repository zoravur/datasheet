import { Store } from "./store";

type Column = string;
type Row = Array<Datum>;

type SheetData = {
  columns: Column[];
  rows: Row[];
};

export type State = {
  data: SheetData;
};

function makeState(): State {
  const state = {
    // viewing: null,
    // [Workspace.sliceKey]: Workspace.makeSlice(),
    // [Sidebar.sliceKey]: Sidebar.makeSlice(), // ensure presence
  } satisfies State;

  return state;
}

export const store = new Store(makeState());

// store.on(Sidebar.reducerMatchPattern, Sidebar.reduce, Sidebar.effects);
// store.on(Workspace.reducerMatchPattern, Workspace.reduce, Workspace.effects);
