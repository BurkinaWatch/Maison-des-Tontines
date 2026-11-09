import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SasPayProvider } from "../../src/modules/payments/providers/saspay.provider.js";

describe("SasPayProvider", () => {
  const provider = new SasPayProvider();

  beforeAll(() => {
    process.env.SASPAY_API_KEY = "sk_live_unit_test";
    process.env.SASPAY_BASE_URL = "https://api.saspay.me/api/v1";
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a hosted checkout with the contribution amount and customer", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "session-123",
          status: "PENDING",
          checkout_url: "https://pay.saspay.me/checkout/session-123",
        }),
        { status: 201 }
      )
    );

    const result = await provider.initiatePayment({
      amount: 2500,
      currency: "XOF",
      phoneNumber: "+2250102030405",
      reference: "MDT-123",
      customerEmail: "member@example.com",
      customerName: "Awa Member",
    });

    expect(result).toMatchObject({
      success: true,
      providerRef: "session-123",
      status: "PENDING",
      checkoutUrl: "https://pay.saspay.me/checkout/session-123",
    });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.saspay.me/api/v1/checkout-sessions/");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      amount: "2500.00",
      currency: "XOF",
      customer_email: "member@example.com",
      customer_name: "Awa Member",
      customer_phone: "+2250102030405",
    });
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer sk_live_unit_test");
  });

  it("verifies paid checkout sessions and returns the amount for reconciliation", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ status: "PAID", transaction_id: "transaction-456" }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ status: "SUCCESS", requested_amount: "2500.00", currency: "XOF" }),
          { status: 200 }
        )
      );

    const result = await provider.checkPaymentStatus("session-123");

    expect(result).toMatchObject({
      status: "SUCCESS",
      amount: 2500,
      currency: "XOF",
      transactionId: "transaction-456",
    });
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe(
      "https://api.saspay.me/api/v1/payments/transaction-456/verify/"
    );
  });

  it("rejects checkout URLs outside SasPay HTTPS domains", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "session-123",
          checkout_url: "https://example.com/checkout/session-123",
        }),
        { status: 201 }
      )
    );

    const result = await provider.initiatePayment({
      amount: 2500,
      currency: "XOF",
      phoneNumber: "+2250102030405",
      reference: "MDT-123",
      customerEmail: "member@example.com",
      customerName: "Awa Member",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("invalid checkout URL");
  });
});
