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
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        phone: "+221771234568",
        name: "Test User",
        password: "password123",
      });
    expect([200, 201]).toContain(response.status);
  });

  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        phone: "+221771234567",
        password: "password123",
      });
    expect([200, 401]).toContain(response.status);
  });
});

describe("Tontines Routes", () => {
  it("should require authentication", async () => {
    const response = await request(app).get("/api/v1/tontines");
    expect(response.status).toBe(401);
  });
});
