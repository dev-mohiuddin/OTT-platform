import { describe, expect, it } from "vitest";

import type { PaymentProviderAdapter } from "@/lib/payment/contracts/provider.contract";
import { createIdempotencyKey, truncateIdempotencyKey } from "@/lib/payment/utils/idempotency-key";
import { PaymentProviderRegistry } from "@/lib/payment/utils/provider-registry";

describe("lib/payment utilities", () => {
  const provider: PaymentProviderAdapter = {
    name: "stripe",
    async createCheckoutSession() {
      return {
        provider: "stripe",
        transactionId: "txn_1",
        checkoutUrl: "https://checkout.example.com",
        status: "pending",
      };
    },
    async verifyTransaction() {
      return {
        id: "txn_1",
        provider: "stripe",
        amount: 100,
        currency: "USD",
        status: "succeeded",
        customerId: "cus_1",
        referenceId: "sub_1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async refundTransaction() {
      return {
        id: "refund_1",
        transactionId: "txn_1",
        provider: "stripe",
        amount: 100,
        currency: "USD",
        status: "succeeded",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async parseWebhook() {
      return {
        provider: "stripe",
        eventId: "evt_1",
        eventType: "payment.succeeded",
        occurredAt: new Date().toISOString(),
        rawPayload: {},
      };
    },
  };

  it("registers and resolves provider adapters", () => {
    const registry = new PaymentProviderRegistry();

    registry.register(provider);

    expect(registry.has("stripe")).toBe(true);
    expect(registry.get("stripe")).toBe(provider);
    expect(registry.list()).toEqual(["stripe"]);
  });

  it("blocks duplicate provider registrations unless overwrite is enabled", () => {
    const registry = new PaymentProviderRegistry();

    registry.register(provider);
    expect(() => registry.register(provider)).toThrow();

    registry.register(provider, { overwrite: true });
    expect(registry.get("stripe")).toBe(provider);
  });

  it("creates stable idempotency keys", () => {
    const key = createIdempotencyKey({
      prefix: "payment",
      scope: "checkout",
      subjectId: "user_123",
      requestId: "req_abc1234567",
    });

    expect(key).toContain("payment:checkout:user-123:req-abc1234567");
    expect(key.length).toBeLessThanOrEqual(255);
    expect(truncateIdempotencyKey("a".repeat(300), 50)).toHaveLength(50);
  });
});