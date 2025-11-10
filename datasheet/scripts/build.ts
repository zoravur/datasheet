import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

export const contextOpts = {
  entryPoints: ["demo/app.ts"],
  bundle: true,
  outdir: "www/js/demo.js",
  // outfile: ["js/demo.js"],
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./public/*"],
        to: ["./www"],
      },
    }),
  ],
};

await esbuild.build(contextOpts);
