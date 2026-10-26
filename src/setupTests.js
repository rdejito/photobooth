import '@testing-library/jest-dom/vitest';

// jsdom has no ResizeObserver, but the camera-stage sizing hook needs one.
// Tests that assert on observer behaviour install their own stub over this.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
