import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText, slugify } from "@/lib/sanitize";

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
  displayName: z.string().max(80).optional().nullable(),
  bio: z.string().max(360).optional().nullable(),
  avatarUrl: z.string().url().optional().or(z.literal("")).nullable(),
  bannerUrl: z.string().url().optional().or(z.literal("")).nullable(),
  websiteUrl: z.string().url().optional().or(z.literal("")).nullable(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).max(128).optional()
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

    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, passwordHash: true, username: true } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    if (parsed.data.newPassword) {
      if (!parsed.data.currentPassword) return NextResponse.json({ error: "Informe sua senha atual." }, { status: 400 });
      if (!user.passwordHash) return NextResponse.json({ error: "Esta conta usa login social. Defina senha pelo fluxo de recuperação futuramente." }, { status: 400 });
      const valid = await compare(parsed.data.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Senha atual inválida." }, { status: 400 });
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(parsed.data.newPassword, 12) } });
      return NextResponse.json({ ok: true });
    }

    const username = parsed.data.username ? slugify(parsed.data.username).replace(/-/g, "_") : undefined;
    if (username && username !== user.username) {
      const exists = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (exists) return NextResponse.json({ error: "Esse username já está em uso." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name ? sanitizeText(parsed.data.name) : undefined,
        username,
        image: parsed.data.avatarUrl || undefined,
        profile: {
          upsert: {
            create: {
              displayName: parsed.data.displayName ? sanitizeText(parsed.data.displayName) : parsed.data.name ? sanitizeText(parsed.data.name) : undefined,
              bio: parsed.data.bio ? sanitizeText(parsed.data.bio) : null,
              avatarUrl: parsed.data.avatarUrl || null,
              bannerUrl: parsed.data.bannerUrl || null,
              websiteUrl: parsed.data.websiteUrl || null
            },
            update: {
              displayName: parsed.data.displayName === undefined ? undefined : parsed.data.displayName ? sanitizeText(parsed.data.displayName) : null,
              bio: parsed.data.bio === undefined ? undefined : parsed.data.bio ? sanitizeText(parsed.data.bio) : null,
              avatarUrl: parsed.data.avatarUrl === undefined ? undefined : parsed.data.avatarUrl || null,
              bannerUrl: parsed.data.bannerUrl === undefined ? undefined : parsed.data.bannerUrl || null,
              websiteUrl: parsed.data.websiteUrl === undefined ? undefined : parsed.data.websiteUrl || null
            }
          }
        }
      },
      select: { id: true, name: true, username: true, image: true, profile: true }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("profile_update_error", error);
    return NextResponse.json({ error: "Não foi possível salvar agora. Tente novamente em instantes." }, { status: 500 });
  }
}
