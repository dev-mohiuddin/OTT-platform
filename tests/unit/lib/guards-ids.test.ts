import { describe, expect, it } from "vitest";

import { assertAnyRole, assertAuthenticated, hasRole, isAuthenticated } from "@/lib/guards/auth-guard";
import {
  assertActiveSubscription,
  assertMinimumSubscriptionTier,
  hasMinimumSubscriptionTier,
  isSubscriptionActive,
} from "@/lib/guards/subscription-guard";
import { createRequestId, ensureRequestId, isRequestId } from "@/lib/ids/request-id";
import { createTraceId, ensureTraceId, isTraceId } from "@/lib/ids/trace-id";
import { AppError } from "@/server/common/errors/app-error";

describe("lib/guards and ids", () => {
  it("generates and validates request IDs", () => {
    const requestId = createRequestId();

    expect(isRequestId(requestId)).toBe(true);
    expect(ensureRequestId(requestId)).toBe(requestId);
    expect(isRequestId(ensureRequestId(undefined))).toBe(true);
  });

  it("generates and validates trace IDs", () => {
    const traceId = createTraceId();

    expect(isTraceId(traceId)).toBe(true);
    expect(ensureTraceId(traceId)).toBe(traceId);
    expect(isTraceId(ensureTraceId(undefined))).toBe(true);
  });

  it("checks authentication and role assertions", () => {
    const user = {
      userId: "user_1",
      roles: ["admin"],
    };

    expect(isAuthenticated(user)).toBe(true);
    expect(hasRole(user, "admin")).toBe(true);
    expect(() => assertAuthenticated({ userId: null })).toThrow(AppError);
    expect(() => assertAnyRole(user, ["editor", "viewer"])).toThrow(AppError);
  });

  it("checks subscription state and tier guards", () => {
    const subscription = {
      isActive: true,
      tier: "premium" as const,
      expiresAt: "2099-01-01T00:00:00.000Z",
    };

    expect(isSubscriptionActive(subscription)).toBe(true);
    expect(hasMinimumSubscriptionTier(subscription, "standard")).toBe(true);
    expect(() => assertActiveSubscription(subscription)).not.toThrow();
    expect(() => assertMinimumSubscriptionTier(subscription, "premium")).not.toThrow();
    expect(() => assertMinimumSubscriptionTier(subscription, "free")).not.toThrow();
  });
});