import { prisma } from "@/lib/prisma";

export async function auditLog(input: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata === undefined ? undefined : JSON.parse(JSON.stringify(input.metadata))
    }
  });
}
