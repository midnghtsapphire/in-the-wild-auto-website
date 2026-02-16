import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(tier: "free" | "pro" | "business" = "free"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("generation.generate", () => {
  it("rejects prompts that are too short", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.generation.generate({
        prompt: "short",
      })
    ).rejects.toThrow();
  });

  it("accepts valid prompts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail without a real database, but tests the input validation
    try {
      await caller.generation.generate({
        prompt: "A simple todo app with user authentication and task management",
        projectName: "test-todo-app",
      });
    } catch (error: any) {
      // Expected to fail without database, but should not be a validation error
      expect(error.message).not.toContain("at least 10 characters");
    }
  });
});

describe("billing.getPlans", () => {
  it("returns subscription plans", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.billing.getPlans();

    expect(plans).toHaveLength(3);
    expect(plans[0]?.id).toBe("free");
    expect(plans[1]?.id).toBe("pro");
    expect(plans[2]?.id).toBe("business");
  });

  it("free plan has correct limits", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.billing.getPlans();
    const freePlan = plans.find((p) => p.id === "free");

    expect(freePlan?.monthlyTokens).toBe(50000);
    expect(freePlan?.price).toBe(0);
  });
});
