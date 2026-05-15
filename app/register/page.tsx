import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#f8fbff] px-4 py-10">
      <RegisterForm />
      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        Já tem conta? <Link href="/login" className="font-black text-wisepix-700">Entrar</Link>
      </p>
    </main>
  );
}
