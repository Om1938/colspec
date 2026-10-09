import { describe, expect, it } from "vitest";
import {
  composeRegistries,
  createRegistry,
  REGISTRY_CATEGORIES,
  RegistryCollisionError,
} from "../src";

const first = () => 1;
const second = () => 2;

describe("registry", () => {
  it("fills in every category", () => {
    expect(Object.keys(createRegistry({ cells: { badge: first } }))).toEqual([
      ...REGISTRY_CATEGORIES,
    ]);
  });

  it("composes registries from separate modules", () => {
    const registry = composeRegistries([
      { cells: { a: first } },
      { cells: { b: second } },
    ]);
    expect(registry.cells).toEqual({ a: first, b: second });
  });

  it("rejects collisions by default", () => {
    expect(() =>
      composeRegistries([{ cells: { a: first } }, { cells: { a: second } }]),
    ).toThrow(RegistryCollisionError);
  });

  it("lets later registries win under the override policy", () => {
    const registry = composeRegistries(
      [{ cells: { a: first } }, { cells: { a: second } }],
      {
        onCollision: "override",
      },
    );
    expect(registry.cells.a).toBe(second);
  });
});
