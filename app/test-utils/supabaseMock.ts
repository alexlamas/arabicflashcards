import { vi } from "vitest";

/**
 * Creates a chainable mock for Supabase query builder
 * Supports: .from().select().eq().order().single().insert().update().delete()
 */
export function createSupabaseMock() {
  const mockResult: { data: unknown; error: unknown; count?: number | null } = { data: null, error: null };

  const chainableMock = {
    from: vi.fn(() => chainableMock),
    select: vi.fn(() => chainableMock),
    insert: vi.fn(() => chainableMock),
    update: vi.fn(() => chainableMock),
    delete: vi.fn(() => chainableMock),
    upsert: vi.fn(() => chainableMock),
    eq: vi.fn(() => chainableMock),
    neq: vi.fn(() => chainableMock),
    in: vi.fn(() => chainableMock),
    not: vi.fn(() => chainableMock),
    lte: vi.fn(() => chainableMock),
    gte: vi.fn(() => chainableMock),
    lt: vi.fn(() => chainableMock),
    gt: vi.fn(() => chainableMock),
    is: vi.fn(() => chainableMock),
    or: vi.fn(() => chainableMock),
    order: vi.fn(() => chainableMock),
    limit: vi.fn(() => chainableMock),
    single: vi.fn(() => Promise.resolve(mockResult)),
    maybeSingle: vi.fn(() => Promise.resolve(mockResult)),
    then: vi.fn((resolve) => resolve(mockResult)),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  // Make the chainable mock thenable (for await)
  const thenableMock = new Proxy(chainableMock, {
    get(target, prop) {
      if (prop === "then") {
        return (resolve: (value: typeof mockResult) => void) => resolve(mockResult);
      }
      return target[prop as keyof typeof target];
    },
  });

  // Store original mocks for reset
  const originalThenMock = chainableMock.then;
  const originalSingleMock = chainableMock.single;
  const originalMaybeSingleMock = chainableMock.maybeSingle;
  const originalRpcMock = chainableMock.rpc;

  return {
    mock: thenableMock,
    mockResult,
    setResult: (data: unknown, error: unknown = null) => {
      mockResult.data = data as null;
      mockResult.error = error as null;
    },
    setUser: (user: { id: string; email?: string } | null) => {
      chainableMock.auth.getUser.mockResolvedValue({
        data: { user: user as null },
        error: null,
      });
    },
    setCountResult: (count: number | null, error: unknown = null) => {
      mockResult.count = count;
      mockResult.data = null;
      mockResult.error = error;
    },
    /**
     * Reset the mock to its initial state.
     * Call this in beforeEach after vi.clearAllMocks() to ensure
     * any overridden mock implementations are restored.
     */
    reset: () => {
      mockResult.data = null;
      mockResult.error = null;
      mockResult.count = undefined;
      // Restore original mocks (in case they were replaced, not just re-implemented)
      chainableMock.then = originalThenMock;
      chainableMock.single = originalSingleMock;
      chainableMock.maybeSingle = originalMaybeSingleMock;
      chainableMock.rpc = originalRpcMock;
      // Also reset the implementations to defaults
      chainableMock.then.mockImplementation((resolve) => resolve(mockResult));
      chainableMock.single.mockImplementation(() => Promise.resolve(mockResult));
      chainableMock.maybeSingle.mockImplementation(() => Promise.resolve(mockResult));
      chainableMock.rpc.mockImplementation(() => Promise.resolve({ data: null, error: null }));
    },
  };
}

/**
 * Helper to mock the createClient import
 */
export function mockCreateClient(supabaseMock: ReturnType<typeof createSupabaseMock>) {
  return vi.fn(() => supabaseMock.mock);
}
