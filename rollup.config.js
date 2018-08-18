import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";

let baseConfig = {
  input: "src/index.ts",
  external: ["react", "react-dom"]
};

let cjsEsConfig = Object.assign({}, baseConfig, {
  plugins: [typescript(), nodeResolve(), commonjs()],
  output: [
    {
      file: "lib/react-table-container.js",
      format: "cjs"
    },
    {
      file: "es/react-table-container.js",
      format: "es"
    }
  ]
});

let umdConfig = Object.assign({}, baseConfig, {
  plugins: [typescript(), nodeResolve(), commonjs()],
  output: {
    globals: {
      react: "React",
      "react-dom": "ReactDOM"
    },
    file: "dist/react-table-container.js",
    format: "umd",
    name: "ReactTableContainer"
  }
});

let umdMinConfig = Object.assign({}, umdConfig, {
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  ],
  output: Object.assign({}, umdConfig.output, {
    file: "dist/react-table-container.min.js"
  })
});

export default [cjsEsConfig, umdConfig, umdMinConfig];
