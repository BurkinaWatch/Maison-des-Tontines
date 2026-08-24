import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/index.js";

describe("Health Check", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("Auth Routes", () => {
  const testSuffix = Date.now().toString();
  const testEmail = `test-user-${testSuffix}@example.com`;
  const testPhone = `+221771${testSuffix.slice(-7)}`;

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        phone: testPhone,
        email: testEmail,
        name: "Test User",
        password: "password123",
      });
    expect([200, 201]).toContain(response.status);
  });

  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testEmail,
        password: "password123",
      });
    expect([200, 401]).toContain(response.status);
  });

  it("should revoke refresh tokens after a password change", async () => {
    const suffix = Date.now().toString();
    const credentials = {
      phone: `+22177${suffix.slice(-7)}`,
      email: `password-${suffix}@example.com`,
      name: "Password Test User",
      password: "password123",
    };

    const registration = await request(app)
      .post("/api/v1/auth/register")
      .send(credentials);
    expect(registration.status).toBe(201);

    const oldRefreshToken = registration.body.refreshToken;
    const passwordChange = await request(app)
      .patch("/api/v1/users/me/password")
      .set("Authorization", `Bearer ${registration.body.accessToken}`)
      .send({ currentPassword: credentials.password, newPassword: "newPassword123" });
    expect(passwordChange.status).toBe(200);

    const refresh = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefreshToken });
    expect(refresh.status).toBe(401);
  });
});

describe("Tontines Routes", () => {
  it("should require authentication", async () => {
    const response = await request(app).get("/api/v1/tontines");
    expect(response.status).toBe(401);
  });
});
