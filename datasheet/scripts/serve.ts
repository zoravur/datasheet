import * as esbuild from "esbuild";
import { contextOpts } from "./build";

let ctx = await esbuild.context(contextOpts);

let { hosts, port } = await ctx.serve({
  servedir: "www",
});

console.log(`Running on ${hosts}:${port}`);
