import { vi } from "vitest";

// Replaces revalidatePath from next/cache so tests can assert on cache invalidation.
export const revalidatePathMock = vi.fn();
