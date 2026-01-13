import { vi } from "vitest";

/**
 * Mock for Next.js App Router navigation hooks
 * Use with: vi.mock("next/navigation", () => routerMock)
 */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

export const mockPathname = "/";
export const mockSearchParams = new URLSearchParams();

export const createRouterMock = (options?: {
  pathname?: string;
  searchParams?: URLSearchParams;
}) => ({
  useRouter: () => mockRouter,
  usePathname: () => options?.pathname ?? mockPathname,
  useSearchParams: () => options?.searchParams ?? mockSearchParams,
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
});

/**
 * Default router mock export for vi.mock()
 */
export const routerMock = createRouterMock();

/**
 * Reset all router mock functions
 */
export function resetRouterMock() {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.prefetch.mockReset();
  mockRouter.back.mockReset();
  mockRouter.forward.mockReset();
  mockRouter.refresh.mockReset();
}
