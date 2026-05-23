import { describe, expect, it } from "vitest";
import { actionError, err, isErr, isOk, ok } from "./result";

describe("Result", () => {
  it("ok carries the value and narrows correctly", () => {
    const r = ok({ message: "queued" });
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
    if (r.ok) {
      expect(r.value.message).toBe("queued");
    }
  });

  it("err carries the error and narrows correctly", () => {
    const r = err(actionError("invalid_input", "Bad email"));
    expect(isErr(r)).toBe(true);
    expect(isOk(r)).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("invalid_input");
      expect(r.error.message).toBe("Bad email");
    }
  });

  it("actionError shape stays minimal", () => {
    const e = actionError("rate_limited", "Too many requests");
    expect(Object.keys(e).sort()).toEqual(["code", "message"]);
  });
});
