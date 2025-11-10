import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
} from "snabbdom";
import store from "./store";

const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
]);

function view(state) {}

function setup() {
  const container = document.getElementById("demo");

  patch();
}
