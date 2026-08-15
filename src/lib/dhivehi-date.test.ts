import { describe, expect, it } from "vitest";
import {
  formatDhivehiDate,
  formatDhivehiRelativeTime,
} from "./dhivehi-date.ts";

describe("Dhivehi date formatting", () => {
  it("uses Dhivehi day and month names", () => {
    expect(formatDhivehiDate(new Date(2026, 7, 10, 12))).toBe(
      "ހޯމަ، 10 އޮގަސްޓް 2026",
    );
  });

  it("formats recent publication times in Dhivehi", () => {
    const now = new Date(2026, 7, 10, 12);
    expect(
      formatDhivehiRelativeTime(new Date(2026, 7, 10, 11, 55), now),
    ).toBe("5 މިނިޓު ކުރިން");
    expect(
      formatDhivehiRelativeTime(new Date(2026, 7, 10, 10), now),
    ).toBe("2 ގަޑިއިރު ކުރިން");
    expect(formatDhivehiRelativeTime(new Date(2026, 7, 9, 12), now)).toBe(
      "1 ދުވަސް ކުރިން",
    );
  });
});
