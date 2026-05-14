import { NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotifyInput = {
  userId: string;
  event: string;
  title: string;
  body: string;
  url?: string;
  metadata?: unknown;
};

export async function notifyUser(input: NotifyInput) {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_event: { userId: input.userId, event: input.event } }
  });

  const channels: NotificationChannel[] = [];
  if (pref?.site ?? true) channels.push(NotificationChannel.SITE);
  if (pref?.push ?? true) channels.push(NotificationChannel.PUSH);
  if (pref?.discordDm ?? true) channels.push(NotificationChannel.DISCORD_DM);
  if (pref?.email ?? false) channels.push(NotificationChannel.EMAIL);
  if (input.event.startsWith("marketing") && !pref?.marketing) channels.length = 0;

  if (!channels.length) return null;

  return prisma.notification.create({
    data: {
      userId: input.userId,
      event: input.event,
      title: input.title,
      body: input.body,
      url: input.url,
      channels,
      metadata: input.metadata === undefined ? undefined : JSON.parse(JSON.stringify(input.metadata))
    }
  });
}
