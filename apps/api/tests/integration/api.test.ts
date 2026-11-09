import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/index.js";
import { getPrisma } from "../../src/config/database.js";

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

  it.each([
    {
      type: "ROTATIVE",
      rules: { payoutOrder: "organizer-first", totalCycles: 5, allowLatePayment: true },
    },
    {
      type: "SAVINGS",
      rules: {
        savingsTarget: 500000,
        savingsTargetDate: "2027-06-30",
        allowEarlyWithdrawal: false,
        totalCycles: 5,
      },
    },
    {
      type: "GOAL",
      rules: {
        investmentProject: "Community shop",
        investmentTarget: 2000000,
        investmentRisk: "medium",
        investmentDuration: "12",
        profitSharing: "Pro-rata to contributions",
        totalCycles: 5,
      },
    },
    {
      type: "HYBRID",
      rules: {
        socialAidType: "emergency",
        socialBeneficiary: "Awa",
        socialUrgency: "normal",
        socialTarget: 300000,
        totalCycles: 5,
      },
    },
  ])("persists and returns $type rules after reading the tontine", async ({ type, rules }) => {
    const suffix = `${Date.now()}-${type.toLowerCase()}`;
    const registration = await request(app)
      .post("/api/v1/auth/register")
      .send({
        phone: `+22177${suffix.replace(/\D/g, "").slice(-7).padStart(7, "0")}`,
        email: `tontine-rules-${suffix}@example.com`,
        name: "Rules Test User",
        password: "password123",
      });
    expect(registration.status).toBe(201);
    const accessToken = registration.body.accessToken;

    const creation = await request(app)
      .post("/api/v1/tontines")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: `Rules ${type} ${suffix}`,
        description: "",
        type,
        contributionAmount: 35000,
        currency: "XOF",
        frequency: "monthly",
        maxMembers: 5,
        startDate: "2026-12-01T00:00:00.000Z",
        rules,
      });

    expect(creation.status).toBe(201);
    const tontineId = creation.body.tontine.id;
    expect(tontineId).toEqual(expect.any(String));
    expect(creation.body.tontine.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: registration.body.user.id,
          role: "ORGANIZER",
          status: "ACTIVE",
          payoutOrder: 0,
        }),
      ]),
    );

    const read = await request(app)
      .get(`/api/v1/tontines/${tontineId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(read.status).toBe(200);
    expect(read.body.tontine.type).toBe(type);
    expect(read.body.tontine.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: registration.body.user.id,
          role: "ORGANIZER",
          status: "ACTIVE",
          payoutOrder: 0,
        }),
      ]),
    );
    expect(read.body.tontine.rules).toEqual(
      expect.arrayContaining(
        Object.entries(rules).map(([key, value]) =>
          expect.objectContaining({
            key,
            value: String(value),
            type:
              typeof value === "number"
                ? "NUMBER"
                : typeof value === "boolean"
                  ? "BOOLEAN"
                  : "STRING",
          }),
        ),
      ),
    );
  });

  it.skipIf(!process.env.DATABASE_URL?.startsWith("file:"))(
    "rolls back the tontine and rules when organizer membership insertion fails",
    async () => {
      const suffix = Date.now().toString();
      const tontineName = `Rollback tontine ${suffix}`;
      const registration = await request(app)
        .post("/api/v1/auth/register")
        .send({
          phone: `+22177${suffix.slice(-7).padStart(7, "0")}`,
          email: `tontine-rollback-${suffix}@example.com`,
          name: "Rollback Test User",
          password: "password123",
        });
      expect(registration.status).toBe(201);

      const triggerName = `fail_tontine_member_${suffix}`;
      let triggerCreated = false;
      try {
        await getPrisma().$executeRawUnsafe(
          `CREATE TRIGGER "${triggerName}" BEFORE INSERT ON "TontineMember" BEGIN SELECT RAISE(ABORT, 'forced organizer insert failure'); END;`,
        );
        triggerCreated = true;

        const creation = await request(app)
          .post("/api/v1/tontines")
          .set("Authorization", `Bearer ${registration.body.accessToken}`)
          .send({
            name: tontineName,
            description: "",
            type: "ROTATIVE",
            contributionAmount: 35000,
            currency: "XOF",
            frequency: "monthly",
            maxMembers: 5,
            startDate: "2026-12-01T00:00:00.000Z",
            rules: { payoutOrder: "organizer-first", totalCycles: 5 },
          });

        expect(creation.status).toBe(500);
        expect(creation.body.message).toBe("Internal server error");

        const tontines = await getPrisma().tontine.findMany({
          where: { name: tontineName },
          include: { rules: true },
        });
        expect(tontines).toHaveLength(0);
        expect(await getPrisma().tontineMember.count({
          where: { userId: registration.body.user.id },
        })).toBe(0);
      } finally {
        if (triggerCreated) {
          await getPrisma().$executeRawUnsafe(`DROP TRIGGER IF EXISTS "${triggerName}"`);
        }
      }
    },
  );
});