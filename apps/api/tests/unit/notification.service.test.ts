import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  notificationFindFirst: vi.fn(),
  notificationCreate: vi.fn(),
  notificationUpdate: vi.fn(),
  pushSend: vi.fn(),
}));

vi.mock("../../src/config/database.js", () => ({
  getPrisma: () => ({
    notification: {
      findFirst: mocks.notificationFindFirst,
      create: mocks.notificationCreate,
      update: mocks.notificationUpdate,
    },
  }),
}));

vi.mock("../../src/modules/notifications/channels/push.channel.js", () => ({
  PushChannel: class {
    send(input: unknown) {
      return mocks.pushSend(input);
    }
  },
}));

import { notifyUser } from "../../src/modules/notifications/notification.service.js";

describe("notifyUser inbox persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notificationFindFirst.mockResolvedValue(null);
    mocks.notificationCreate.mockResolvedValue({ id: "notification-1" });
  });

  it("keeps the in-app notification when push delivery fails", async () => {
    mocks.pushSend.mockResolvedValue({ success: false, error: "Expo rejected the ticket" });

    await expect(
      notifyUser({
        userId: "user-1",
        type: "VOTE",
        title: "New vote",
        body: "A vote is open.",
      }),
    ).resolves.toEqual({ id: "notification-1" });

    expect(mocks.notificationCreate).toHaveBeenCalledOnce();
    expect(mocks.notificationUpdate).not.toHaveBeenCalled();
  });
});
