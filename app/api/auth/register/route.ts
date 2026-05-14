import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/analytics";


export async function POST(request: NextRequest) {
  const limited = rateLimit(`register:${getClientIp(request) ?? "unknown"}`, 5, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  const username = parsed.data.username.toLowerCase();
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { username }] },
    select: { id: true }
  });
  if (exists) return NextResponse.json({ error: "Email ou username já está em uso." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      username,
      passwordHash: await hash(parsed.data.password, 12),
      profile: {
        create: {
          displayName: parsed.data.name,
          bio: "Começando minha loja digital na WisePix."
        }
      },
      settings: { create: {} },
      notificationPrefs: {
        create: [
          { event: "sale.new" },
          { event: "order.opened" },
          { event: "payment.paid" },
          { event: "chat.message" },
          { event: "withdrawal.settled" },
          { event: "dispute.opened" },
          { event: "badge.awarded" },
          { event: "level.changed" },
          { event: "marketing", site: false, push: false, discordDm: false, email: false, marketing: false }
        ]
      }
    },
    select: { id: true, email: true, username: true }
  });

  return NextResponse.json({ user }, { status: 201 });
}
