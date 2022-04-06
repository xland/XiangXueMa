import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
const external = require("./external");
let sirv = require("sirv");

const production = !process.env.ROLLUP_WATCH;

function startElectron() {
  let electronProcess = require("child_process").spawn(
    require("electron").toString(),
    ["./public/main.js"],
    {
      cwd: process.cwd(),
    }
  );
  electronProcess.on("close", () => {
    this.electronProcess.kill(0);
    process.exit();
  });
  electronProcess.stdout.on("error", (data) => {
    data = data.toString();
    console.log(data);
    console.log("error");
  });
  electronProcess.stdout.on("data", (data) => {
    data = data.toString();
    console.log(data);
  });
}

function serve() {
  let server;
  return {
    writeBundle() {
      if (server) return;
      let fn = sirv("public", { dev: true });
      server = require("http").createServer(fn);
      server.listen(5916, "localhost", (err) => {
        if (err) throw err;
        startElectron();
      });
    },
  };
}

export default {
  input: "src/renderer/rendererEntry.ts",
  output: {
    sourcemap: true,
    format: "cjs",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
  external,
};