import { prisma } from "@/lib/prisma";

export async function getDiscordRoleConfig() {
  const rows = await prisma.discordRoleConfig.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.roleId]));
}

export async function queueDiscordRoleSync(userId: string) {
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "discord.role_sync_requested",
      targetType: "User",
      targetId: userId
    }
  });
}
