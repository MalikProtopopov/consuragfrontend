import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * In-memory localStorage/sessionStorage.
 *
 * Node 25 экспонирует собственный экспериментальный `globalThis.localStorage`,
 * который без `--localstorage-file` бросает на каждый вызов и затеняет реализацию
 * jsdom. Перекрываем оба хранилища детерминированным in-memory стабом, чтобы
 * модули, читающие localStorage на этапе импорта (`apiUrlManager`, `tokenManager`),
 * работали в тестах.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function installStorage(name: "localStorage" | "sessionStorage") {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, name, {
    value: storage,
    writable: true,
    configurable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, name, {
      value: storage,
      writable: true,
      configurable: true,
    });
  }
}

installStorage("localStorage");
installStorage("sessionStorage");

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Unmount React trees and clean up the DOM after every test.
afterEach(() => {
  cleanup();
});
