import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const subscription = (await request.json()) as { endpoint?: string; keys?: unknown };
  if (!subscription.endpoint || !subscription.keys) return NextResponse.json({ error: "Subscription inválida" }, { status: 400 });

  await prisma.pwaSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { keys: JSON.parse(JSON.stringify(subscription.keys)), active: true },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      keys: JSON.parse(JSON.stringify(subscription.keys))
    }
  });

  return NextResponse.json({ ok: true });
}
