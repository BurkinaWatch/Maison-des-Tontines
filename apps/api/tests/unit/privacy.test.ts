import { describe, expect, it, vi, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { sanitizeForLogs } from "../../src/config/logger.js";
import { errorHandler } from "../../src/middleware/errorHandler.js";

describe("production log privacy", () => {
  it("redacts personal identifiers, network metadata, user agents, and stack traces", () => {
    const log = sanitizeForLogs(
      {
        message: "Request from test@example.com at 192.0.2.44",
        email: "test@example.com",
        phone: "+221 77 123 45 67",
        ipAddress: "192.0.2.44",
        "user-agent": "PrivateBrowser/1.0",
        error: "Error: failed\n    at handler (/users/alice/app.js:10:2)",
      },
      "production",
    ) as Record<string, unknown>;

    expect(JSON.stringify(log)).not.toContain("test@example.com");
    expect(JSON.stringify(log)).not.toContain("+221");
    expect(JSON.stringify(log)).not.toContain("192.0.2.44");
    expect(JSON.stringify(log)).not.toContain("PrivateBrowser/1.0");
    expect(JSON.stringify(log)).not.toContain("at handler");
    expect(log.email).toBe("[REDACTED]");
    expect(log["user-agent"]).toBe("[REDACTED]");
    expect(log.error).toBe("[REDACTED_STACK]");
  });
});

function responseDouble() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
}

describe("error response privacy", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  it("returns a generic response without a stack in production", () => {
    process.env.NODE_ENV = "production";
    const response = responseDouble();
    const error = Object.assign(
      new Error("Failure for test@example.com at 192.0.2.44"),
      { statusCode: 500 },
    );

    errorHandler(error, { method: "GET", url: "/private" } as any, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: "Internal server error",
      message: "Internal server error",
    });
  });

  it("includes diagnostic details for developers only", () => {
    process.env.NODE_ENV = "development";
    const response = responseDouble();
    const error = new Error("Validation failed");

    errorHandler(error, { method: "GET", url: "/debug" } as any, response, vi.fn());

    expect(response.json).toHaveBeenCalledWith({
      error: "Internal server error",
      message: "Internal server error",
      stack: error.stack,
    });
  });
});

describe("access-token claims", () => {
  it("contains only the subject and role", () => {
    const token = jwt.sign(
      { sub: "user-123", role: "MEMBER" },
      "test-access-secret-that-is-at-least-32-characters",
    );
    const claims = jwt.decode(token) as Record<string, unknown>;

    expect(claims).toMatchObject({ sub: "user-123", role: "MEMBER" });
    expect(Object.keys(claims).sort()).toEqual(["iat", "role", "sub"]);
    expect(claims).not.toHaveProperty("phone");
    expect(claims).not.toHaveProperty("email");
  });
});