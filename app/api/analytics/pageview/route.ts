import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordPageView } from "@/lib/analytics";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const session = await auth();
  await recordPageView(request, session?.user?.id);
  return NextResponse.json({ ok: true });
}
