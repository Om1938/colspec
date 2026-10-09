import { mkdirSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { tableContractSchema } from "../src/contract";

// Language-independent form of the contract, published next to the build.
const schema = z.toJSONSchema(tableContractSchema, { io: "input" });

mkdirSync("dist", { recursive: true });
writeFileSync(
  "dist/contract.schema.json",
  `${JSON.stringify(schema, null, 2)}\n`,
);
