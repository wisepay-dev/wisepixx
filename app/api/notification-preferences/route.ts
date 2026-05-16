import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationPreferenceSchema } from "@/lib/validation";

const schema = z.object({
  events: z.array(notificationPreferenceSchema).max(40)
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Dados inválidos. Envie as informações novamente." }, { status: 400 });
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

    await prisma.$transaction(
      parsed.data.events.map((event) =>
        prisma.notificationPreference.upsert({
          where: { userId_event: { userId: session.user.id, event: event.event } },
          update: event,
          create: { userId: session.user.id, ...event }
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("notification_preferences_error", error);
    return NextResponse.json({ error: "Não foi possível salvar notificações agora." }, { status: 500 });
  }
}
