import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canAccessOwner, hasRole } from "@/lib/permissions";

export async function requireUser(callbackUrl = "/dashboard") {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}

export async function requireAdmin(callbackUrl = "/admin") {
  const session = await requireUser(callbackUrl);
  if (!canAccessAdmin(session.user.roles)) redirect("/dashboard");
  return session;
}

export async function requireOwner(callbackUrl = "/owner") {
  const session = await requireUser(callbackUrl);
  if (!canAccessOwner(session.user.roles)) redirect("/dashboard");
  return session;
}

export async function requirePartnerOrOwner(callbackUrl = "/store/dashboard") {
  const session = await requireUser(callbackUrl);
  if (!hasRole(session.user.roles, UserRole.PARTNER) && !hasRole(session.user.roles, UserRole.OWNER)) {
    redirect("/dashboard");
  }
  return session;
}
