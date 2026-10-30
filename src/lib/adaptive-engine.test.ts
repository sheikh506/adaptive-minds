import { describe, expect, it } from "vitest";
import { adaptContinuous } from "./adaptive-engine";

describe("adaptContinuous", () => {
  it("waits for a little evidence", () => {
    expect(adaptContinuous(3, [true], 1).levelChange).toBe("same");
  });
  it("moves up after three correct answers in a row", () => {
    const r = adaptContinuous(3, [true, true, true], 3);
    expect(r.levelChange).toBe("up");
    expect(r.newLevel).toBe(4);
    expect(r.sinceChange).toBe(0);
  });
  it("does not climb again on the very next answer", () => {
    // five correct in a row overall, but only one answer since the last change
    expect(adaptContinuous(4, [true, true, true, true, true], 1).levelChange).toBe("same");
    expect(adaptContinuous(4, [true, true, true, true, true], 2).levelChange).toBe("same");
  });
  it("only counts answers since the last change", () => {
    // earlier misses are ignored: 3 answers since change, all correct
    expect(adaptContinuous(4, [false, false, true, true, true], 3).levelChange).toBe("up");
  });
  it("eases off after two misses in a row", () => {
    const r = adaptContinuous(5, [true, true, false, false], 4);
    expect(r.levelChange).toBe("down");
    expect(r.newLevel).toBe(4);
  });
  it("eases off when accuracy is low over a few answers", () => {
    expect(adaptContinuous(5, [false, true, false], 3).levelChange).toBe("down");
  });
  it("stays within 1..10", () => {
    expect(adaptContinuous(10, [true, true, true], 3).newLevel).toBe(10);
    expect(adaptContinuous(1, [false, false, false], 3).newLevel).toBe(1);
  });
  it("uses encouraging, non-shaming wording", () => {
    const down = adaptContinuous(5, [false, false], 2);
    expect(down.message).not.toMatch(/\b(wrong|fail|failed|bad|stupid)\b/i);
  });
});
