"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Disc3, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    if (result?.error) setError("Email ou senha inválidos.");
    else router.push("/");
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-wisepix-950">Entrar na WisePix</h1>
        <p className="text-sm font-medium text-slate-600">Acesse sua loja, pedidos, chat e saldo.</p>
      </div>
      <button onClick={() => signIn("discord", { callbackUrl: "/" })} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5865f2] font-bold text-white">
        <Disc3 size={20} /> Entrar com Discord
      </button>
      <form action={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <input name="email" type="email" required className="mt-1 h-12 w-full rounded-lg border-blue-100" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Senha</span>
          <input name="password" type="password" minLength={8} required className="mt-1 h-12 w-full rounded-lg border-blue-100" />
        </label>
        {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-wisepix-600 font-bold text-white">
          <Mail size={19} /> Entrar com email
        </button>
      </form>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Não foi possível criar a conta.");
      return;
    }
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-black text-wisepix-950">Criar conta</h1>
      <form action={onSubmit} className="mt-5 space-y-3">
        <input name="name" placeholder="Nome público" required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="username" placeholder="username" minLength={3} required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="email" type="email" placeholder="email@exemplo.com" required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="password" type="password" minLength={8} placeholder="Senha" required className="h-12 w-full rounded-lg border-blue-100" />
        {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        <button className="h-12 w-full rounded-lg bg-wisepix-600 font-bold text-white">Começar</button>
      </form>
    </div>
  );
}
