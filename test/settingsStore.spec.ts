import { describe, it, expect, beforeEach } from "vitest";
import {
  loadSettings,
  saveSettings,
  setSessionKeys,
  getSessionKeys,
} from "../src/settings/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    delete (globalThis as any).__OPFS_CONFIG;
  });

  it("loadSettings returns defaults when none persisted", async () => {
    const s = await loadSettings();
    expect(s.chunkSize).toBe(512);
  });

  it("saveSettings persists and loadSettings reads back", async () => {
    await saveSettings({ topK: 10 });
    const s = await loadSettings();
    expect(s.topK).toBe(10);
  });

  it("session keys stored in memory only", () => {
    setSessionKeys({ openaiKey: "abc" });
    const k = getSessionKeys();
    expect(k.openaiKey).toBe("abc");
  });
});
