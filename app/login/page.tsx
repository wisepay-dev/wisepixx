import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-4 py-10">
      <LoginForm />
      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        Ainda não tem conta? <Link href="/register" className="font-black text-wisepix-700">Criar agora</Link>
      </p>
    </main>
  );
}
