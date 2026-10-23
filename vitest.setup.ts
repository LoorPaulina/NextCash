import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// server-only throws when imported outside a React Server Component.
// Tests exercise server modules directly, so the guard is replaced with a no-op.
vi.mock("server-only", () => ({}));
