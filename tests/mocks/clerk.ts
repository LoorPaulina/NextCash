import { vi } from "vitest";

// Replaces auth() from @clerk/nextjs/server. Tests set the resolved session per case.
export const authMock = vi.fn();
