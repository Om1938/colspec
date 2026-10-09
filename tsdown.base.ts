import type { UserConfig } from "tsdown";

/** Build settings shared by every publishable package. */
export const baseConfig: UserConfig = {
  entry: "src/index.ts",
  dts: true,
  exports: true,
};
