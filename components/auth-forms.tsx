"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Disc3, Mail } from "lucide-react";

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as { error?: string; [key: string]: unknown };
  } catch {
    return null;
  }
}

function safeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function LoginForm({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const nextUrl = safeCallbackUrl(callbackUrl);

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    if (result?.error) setError("Email ou senha inválidos.");
    else router.push(nextUrl);
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-wisepix-950">Entrar na WisePix</h1>
        <p className="text-sm font-medium text-slate-600">Acesse sua loja, pedidos, chat e saldo.</p>
      </div>
      <button onClick={() => signIn("discord", { callbackUrl: nextUrl })} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5865f2] font-bold text-white">
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
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
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
      const body = await safeJson(response);

      if (!response.ok) {
        setError(body?.error ?? "Não foi possível criar a conta. Tente novamente.");
        return;
      }

      setSuccess("Conta criada com sucesso. Bem-vindo à WisePix.");
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false
      });

      if (result?.error) {
        setError("Conta criada. Entre com seu email e senha para continuar.");
        router.push("/login?callbackUrl=/dashboard");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
    } catch {
      setError("Não foi possível criar a conta agora. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-black text-wisepix-950">Criar conta</h1>
      <form action={onSubmit} className="mt-5 space-y-3">
        <input name="name" placeholder="Nome público" required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="username" placeholder="username" minLength={3} required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="email" type="email" placeholder="email@exemplo.com" required className="h-12 w-full rounded-lg border-blue-100" />
        <input name="password" type="password" minLength={8} placeholder="Senha" required className="h-12 w-full rounded-lg border-blue-100" />
        {success ? <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</p> : null}
        {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        <button disabled={submitting} className="h-12 w-full rounded-lg bg-wisepix-600 font-bold text-white disabled:opacity-60">
          {submitting ? "Criando conta..." : "Começar"}
        </button>
      </form>
    </div>
  );
}
