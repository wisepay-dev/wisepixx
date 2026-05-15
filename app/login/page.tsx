import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { auth } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f8fbff] px-4 py-10">
      <LoginForm callbackUrl={params.callbackUrl} />
      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        Ainda não tem conta? <Link href="/register" className="font-black text-wisepix-700">Criar agora</Link>
      </p>
    </main>
  );
}
