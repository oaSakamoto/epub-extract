import { defineConfig } from "vitest/config";
import path from "path";
import packageJson from "./package.json";
import tsconfigPaths from "vite-tsconfig-paths";

const getPackageName = () => {
  return packageJson.name;
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
  } catch {
    throw new Error("Name property in package.json is missing");
  }
};

const fileName = {
  es: `${getPackageName()}.js`,
  iife: `${getPackageName()}.iife.js`,
  cjs: `${getPackageName()}.cjs.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  plugins: [tsconfigPaths()],
  build: {
    outDir: "./dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats,
      fileName: (format) => fileName[format],
    },
  },
  test: {
    globals: true,
    watch: true,
    typecheck: {
      tsconfig: path.resolve(__dirname, "tsconfig.test.json"),
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
});
