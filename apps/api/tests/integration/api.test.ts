import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/index.js";

describe("Health Check", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("Auth Routes", () => {
  it("should register a user and allow that user to sign in", async () => {
    const suffix = Date.now().toString();
    const email = `auth-test-${suffix}@example.com`;
    const password = "password123";
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        phone: `+221771${suffix.slice(-7)}`,
        email,
        name: "Test User",
        password,
      });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toEqual(expect.any(String));
    expect(loginResponse.body.user.email).toBe(email);
  });

  it("should return a clear error for invalid sign-in credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "missing@example.com",
        password: "wrongpass",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email address or password");
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
      .send({
        currentPassword: credentials.password,
        newPassword: "newPassword123",
      });
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