import { describe, it, expect } from "vitest";
import { importCardFile } from "./upload.ts";
import { ImportError } from "./errors.ts";

describe("importCardFile size guard", () => {
  it("rejects an oversized file before reading any bytes", async () => {
    const file = new File(["%PDF-1.4"], "huge.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 64 * 1024 * 1024 }); // pretend 64 MB
    await expect(importCardFile(file)).rejects.toMatchObject({ code: "unreadable" });
  });

  it("rejects an unrecognised (non-PDF/FDF) file", async () => {
    const file = new File(["just some text"], "notes.txt", { type: "text/plain" });
    await expect(importCardFile(file)).rejects.toThrow(ImportError);
  });
});
