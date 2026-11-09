import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  deviceTokenFindMany: vi.fn(),
  deviceTokenUpdateMany: vi.fn(),
}));

vi.mock("../../src/config/database.js", () => ({
  getPrisma: () => ({
    deviceToken: {
      findMany: prismaMocks.deviceTokenFindMany,
      updateMany: prismaMocks.deviceTokenUpdateMany,
    },
  }),
}));

import { PushChannel } from "../../src/modules/notifications/channels/push.channel.js";

const notification = {
  userId: "user-1",
  title: "New update",
  body: "There is an update.",
  data: { category: "updates" },
};

describe("PushChannel Expo ticket handling", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    prismaMocks.deviceTokenUpdateMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports success when Expo accepts a ticket", async () => {
    prismaMocks.deviceTokenFindMany.mockResolvedValue([
      { id: "device-1", token: "ExponentPushToken[device-1]" },
    ]);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: "ok", id: "ticket-1" }] }),
    });

    await expect(new PushChannel().send(notification)).resolves.toEqual({ success: true });
    expect(prismaMocks.deviceTokenUpdateMany).not.toHaveBeenCalled();
  });

  it("disables only the device whose Expo ticket is unregistered", async () => {
    prismaMocks.deviceTokenFindMany.mockResolvedValue([
      { id: "device-invalid", token: "ExponentPushToken[invalid]" },
      { id: "device-valid", token: "ExponentPushToken[valid]" },
    ]);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { status: "error", message: "Device not registered", details: { error: "DeviceNotRegistered" } },
          { status: "ok", id: "ticket-valid" },
        ],
      }),
    });

    await expect(new PushChannel().send(notification)).resolves.toEqual({ success: true });
    expect(prismaMocks.deviceTokenUpdateMany).toHaveBeenCalledTimes(1);
    expect(prismaMocks.deviceTokenUpdateMany).toHaveBeenCalledWith({
      where: { id: "device-invalid", userId: "user-1" },
      data: { enabled: false },
    });
  });

  it("does not report accepted delivery when every Expo ticket fails", async () => {
    prismaMocks.deviceTokenFindMany.mockResolvedValue([
      { id: "device-1", token: "ExponentPushToken[device-1]" },
    ]);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: "error", message: "Message rate exceeded" }],
      }),
    });

    await expect(new PushChannel().send(notification)).resolves.toMatchObject({ success: false });
    expect(prismaMocks.deviceTokenUpdateMany).not.toHaveBeenCalled();
  });

  it("splits requests into Expo's 100-message batches", async () => {
    prismaMocks.deviceTokenFindMany.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        id: `device-${index}`,
        token: `ExponentPushToken[device-${index}]`,
      })),
    );
    fetchMock.mockImplementation(async (_url: string, options: RequestInit) => {
      const messages = JSON.parse(String(options.body)) as unknown[];
      return {
        ok: true,
        json: async () => ({ data: messages.map((_, index) => ({ status: "ok", id: `ticket-${index}` })) }),
      };
    });

    await expect(new PushChannel().send(notification)).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toHaveLength(100);
    expect(JSON.parse(String(fetchMock.mock.calls[1][1].body))).toHaveLength(1);
  });
});
