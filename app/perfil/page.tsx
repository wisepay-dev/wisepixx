import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function ProfileRedirectPage() {
  const session = await auth();
  if (!session?.user?.username) redirect("/login");
  redirect(`/@${session.user.username}`);
}
