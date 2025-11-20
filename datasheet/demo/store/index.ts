import { newApi } from "../mockApi";
import { Datum } from "../mockApi/FieldTypes";
import { Store } from "./store";

export type Column = string;
export type Row = Array<Datum>;

export type SheetData = {
  columns: Column[];
  rows: Row[];
};

export type State = {
  data: SheetData;
  loading: number;
};

function makeState(): State {
  const state = {
    data: {
      columns: [],
      rows: [],
    },
    loading: 0,
    // viewing: null,
    // [Workspace.sliceKey]: Workspace.makeSlice(),
    // [Sidebar.sliceKey]: Sidebar.makeSlice(), // ensure presence
  } satisfies State;

  return state;
}

export const store = new Store(makeState());

export async function setupStore() {
  const api = await newApi(1337);

  store.on(
    "api/fetch",
    (state, _action) => {
      return { ...state, loading: state.loading + 1 };
    },
    async (action, _state) => {
      const { resource } = action.payload as {
        resource: keyof typeof api;
      };

      const data = await api[resource].read({});

      store.dispatch({ type: "api/data", payload: data });
    }
  );

  store.on("api/data", (state, action) => {
    return { ...state, data: action.payload.data };
  });
}

// store.on(Sidebar.reducerMatchPattern, Sidebar.reduce, Sidebar.effects);
// store.on(Workspace.reducerMatchPattern, Workspace.reduce, Workspace.effects);
