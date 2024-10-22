import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/*.ts"],
  format: ["esm"],
  shims: true,
  skipNodeModulesBundle: true,
});
