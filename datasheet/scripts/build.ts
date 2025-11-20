import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

export const contextOpts = {
  entryPoints: ["demo/app.ts"],
  bundle: true,
  outdir: "www/js",
  sourcemap: true, // ← add this
  sourcesContent: true, // optional but recommended
  legalComments: "none" as "none", // optional: keeps maps tidy
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
