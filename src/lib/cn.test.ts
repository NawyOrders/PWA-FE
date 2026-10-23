import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("UT-CN-01 joins the class names with a single space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("UT-CN-02 drops the falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("UT-CN-03 keeps the given order", () => {
    expect(cn("z", "a", "m")).toBe("z a m");
  });

  it("UT-CN-04 returns an empty string when every value is falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("UT-CN-05 returns the single class name unchanged", () => {
    expect(cn("only")).toBe("only");
  });
});
