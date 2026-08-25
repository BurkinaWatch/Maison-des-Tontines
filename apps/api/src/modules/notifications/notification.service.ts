import { getPrisma } from "../../config/database.js";
import { PushChannel } from "./channels/push.channel.js";

const pushChannel = new PushChannel();

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const existing = await getPrisma().notification.findFirst({
    where: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (existing) return existing;

  const notification = await getPrisma().notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      channel: "PUSH",
      title: input.title,
      body: input.body,
      data: JSON.stringify(input.data ?? {}),
      status: "PENDING",
    },
  });
  const delivery = await pushChannel.send(input);
  if (delivery.success) {
    await getPrisma().notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }
  return notification;
}