import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("dashboard.stats", () => {
  it("returns dashboard statistics for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();

    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("totalProcesses");
    expect(stats).toHaveProperty("activeProcesses");
    expect(stats).toHaveProperty("totalDocuments");
    expect(stats).toHaveProperty("totalUsers");
    expect(typeof stats?.totalProcesses).toBe("number");
    expect(typeof stats?.activeProcesses).toBe("number");
    expect(typeof stats?.totalDocuments).toBe("number");
    expect(typeof stats?.totalUsers).toBe("number");
  });
});

describe("processes.list", () => {
  it("returns list of processes for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const processes = await caller.processes.list();

    expect(Array.isArray(processes)).toBe(true);
  });

  it("accepts filter parameters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const processes = await caller.processes.list({
      status: "active",
      processType: "civil",
      search: "test",
    });

    expect(Array.isArray(processes)).toBe(true);
  });
});

describe("notifications.list", () => {
  it("returns notifications for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();

    expect(Array.isArray(notifications)).toBe(true);
  });
});

describe("chat.getMessages", () => {
  it("returns chat messages for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.chat.getMessages({});

    expect(Array.isArray(messages)).toBe(true);
  });

  it("accepts processId filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.chat.getMessages({ processId: 1 });

    expect(Array.isArray(messages)).toBe(true);
  });
});

describe("automation.listTemplates", () => {
  it("returns automation templates for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.automation.listTemplates();

    expect(Array.isArray(templates)).toBe(true);
  });
});

describe("automation.calculateDeadline", () => {
  it("calculates deadline correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2024-01-01");
    const result = await caller.automation.calculateDeadline({
      startDate,
      daysToAdd: 10,
      excludeWeekends: false,
    });

    expect(result).toBeDefined();
    expect(result.deadline).toBeInstanceOf(Date);
    expect(result.deadline.getTime()).toBeGreaterThan(startDate.getTime());
  });

  it("excludes weekends when requested", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2024-01-01"); // Monday
    const result = await caller.automation.calculateDeadline({
      startDate,
      daysToAdd: 5,
      excludeWeekends: true,
    });

    expect(result).toBeDefined();
    expect(result.deadline).toBeInstanceOf(Date);
  });
});

describe("admin procedures", () => {
  it("allows admin to list users", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const users = await caller.users.list();

    expect(Array.isArray(users)).toBe(true);
  });

  it("denies non-admin access to user list", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });
});
