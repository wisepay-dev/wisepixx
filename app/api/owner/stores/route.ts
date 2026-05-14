import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { canAccessOwner } from "@/lib/permissions";
import { isReservedSubdomain } from "@/lib/subdomains";
import { storeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!canAccessOwner(session?.user?.roles)) return NextResponse.json({ error: "Apenas OWNER" }, { status: 403 });

  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  const normalized = {
    ...payload,
    slug: payload.slug ?? payload.subdomain,
    saleFeePercent: Number(payload.saleFeePercent ?? 0),
    withdrawalFeePercent: Number(payload.withdrawalFeePercent ?? 0),
    themeId: payload.themeId || undefined
  };
  const parsed = storeSchema.safeParse(normalized);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  if (isReservedSubdomain(parsed.data.subdomain)) return NextResponse.json({ error: "Subdomínio reservado" }, { status: 400 });

  const store = await prisma.$transaction(async (tx) => {
    const created = await tx.store.create({
      data: {
        ownerId: parsed.data.ownerId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        subdomain: parsed.data.subdomain,
        saleFeePercent: parsed.data.saleFeePercent,
        withdrawalFeePercent: parsed.data.withdrawalFeePercent,
        themeId: parsed.data.themeId,
        verified: true,
        status: "ACTIVE"
      }
    });

    await tx.user.update({
      where: { id: parsed.data.ownerId },
      data: { roles: { push: UserRole.PARTNER } }
    }).catch(() => null);

    await tx.partnerAccount.upsert({
      where: { userId: parsed.data.ownerId },
      update: { storeId: created.id, active: true },
      create: { userId: parsed.data.ownerId, storeId: created.id }
    });

    const partnerBadge = await tx.badge.findUnique({ where: { slug: "parceiro-wisepix" } });
    if (partnerBadge) {
      await tx.userBadge.upsert({
        where: { userId_badgeId: { userId: parsed.data.ownerId, badgeId: partnerBadge.id } },
        update: {},
        create: { userId: parsed.data.ownerId, badgeId: partnerBadge.id, awardedBy: session?.user?.id }
      });
    }

    return created;
  });

  await auditLog({ actorId: session?.user?.id, action: "store.created", targetType: "Store", targetId: store.id });
  return NextResponse.json({ store }, { status: 201 });
}
