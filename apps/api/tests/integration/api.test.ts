import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/index.js";
import { getPrisma } from "../../src/config/database.js";
import { getEnv } from "../../src/config/env.js";

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

describe("Notifications Routes", () => {
  it("lists, counts, reads, and deletes only the signed-in user's notifications", async () => {
    const suffix = Date.now().toString();
    const createUser = (label: string, lastDigit: string) =>
      getPrisma().user.create({
        data: {
          phone: `+22177${suffix.slice(-6)}${lastDigit}`,
          email: `notifications-${label}-${suffix}@example.com`,
          name: `Notifications ${label}`,
          passwordHash: "unused-test-password-hash",
        },
      });
    const owner = await createUser("owner", "1");
    const other = await createUser("other", "2");
    const ownerToken = jwt.sign(
      { sub: owner.id, role: owner.role },
      getEnv().JWT_ACCESS_SECRET,
      { expiresIn: "5m" },
    );
    const otherToken = jwt.sign(
      { sub: other.id, role: other.role },
      getEnv().JWT_ACCESS_SECRET,
      { expiresIn: "5m" },
    );
    const devicePushToken = `ExponentPushToken[test-device-${suffix}]`;
    const registeredDevice = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ token: devicePushToken, platform: "android" });
    expect(registeredDevice.status).toBe(200);

    const otherUserDisable = await request(app)
      .post("/api/v1/notifications/device-token/disable")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ token: devicePushToken });
    expect(otherUserDisable.body.disabled).toBe(false);
    expect((await getPrisma().deviceToken.findUnique({ where: { token: devicePushToken } }))?.enabled)
      .toBe(true);

    const ownerDisable = await request(app)
      .post("/api/v1/notifications/device-token/disable")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ token: devicePushToken });
    expect(ownerDisable.body.disabled).toBe(true);
    const reenabledDevice = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ token: devicePushToken, platform: "android" });
    expect(reenabledDevice.body.deviceToken.enabled).toBe(true);

    const ownerNotification = await getPrisma().notification.create({
      data: {
        userId: owner.id,
        type: "INVITATION",
        channel: "PUSH",
        title: "Tontine invitation",
        body: "You have been invited.",
        data: "{}",
        status: "SENT",
      },
    });
    const otherNotification = await getPrisma().notification.create({
      data: {
        userId: other.id,
        type: "VOTE",
        channel: "PUSH",
        title: "New vote",
        body: "A vote is open.",
        data: "{}",
        status: "SENT",
      },
    });
    const list = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.notifications.map((item: { id: string }) => item.id)).toEqual([
      ownerNotification.id,
    ]);

    const invalidLimit = await request(app)
      .get("/api/v1/notifications?limit=101")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(invalidLimit.status).toBe(400);

    const unread = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(unread.body.count).toBe(1);

    const markRead = await request(app)
      .post("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(markRead.status).toBe(200);
    const unreadAfterRead = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(unreadAfterRead.body.count).toBe(0);

    const forbiddenDelete = await request(app)
      .delete(`/api/v1/notifications/${otherNotification.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(forbiddenDelete.status).toBe(404);
    expect(await getPrisma().notification.findUnique({ where: { id: otherNotification.id } }))
      .not.toBeNull();

    const deletion = await request(app)
      .delete(`/api/v1/notifications/${ownerNotification.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(deletion.status).toBe(204);
  });
});