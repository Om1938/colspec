import { defineConfig } from "tsdown";
import { baseConfig } from "../../tsdown.base.ts";

export default defineConfig({
  ...baseConfig,
  exports: {
    customExports: {
      // Written by scripts/json-schema.ts after the bundle.
      "./contract.schema.json": "./dist/contract.schema.json",
    },
  },
});
