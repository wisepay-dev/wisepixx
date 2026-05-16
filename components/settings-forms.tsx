"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, Toast } from "@/components/ui/primitives";

type ProfileFormProps = {
  user: {
    name: string | null;
    username: string | null;
    email: string | null;
    image: string | null;
    profile: { displayName: string | null; bio: string | null; avatarUrl: string | null; bannerUrl: string | null; websiteUrl: string | null } | null;
  };
};

type NotificationPref = {
  id: string;
  event: string;
  site: boolean;
  push: boolean;
  discordDm: boolean;
  email: boolean;
  marketing: boolean;
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function ProfileSettingsForm({ user }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        username: formData.get("username"),
        displayName: formData.get("displayName"),
        bio: formData.get("bio"),
        avatarUrl: formData.get("avatarUrl"),
        bannerUrl: formData.get("bannerUrl"),
        websiteUrl: formData.get("websiteUrl")
      })
    });
    const body = await safeJson(response);
    setLoading(false);

    if (!response.ok) {
      setError(body?.error ?? "Não foi possível salvar seu perfil.");
      return;
    }

    setMessage("Perfil salvo com sucesso.");
  }

  return (
    <form action={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <Input name="name" defaultValue={user.name ?? ""} required minLength={2} />
        </Field>
        <Field label="Username" hint="Use letras, números e underline. Esse nome aparece no seu perfil público.">
          <Input name="username" defaultValue={user.username ?? ""} required minLength={3} />
        </Field>
      </div>
      <Field label="Nome público">
        <Input name="displayName" defaultValue={user.profile?.displayName ?? user.name ?? ""} />
      </Field>
      <Field label="Bio">
        <Textarea name="bio" defaultValue={user.profile?.bio ?? ""} rows={4} maxLength={360} placeholder="Conte o que você vende, como entrega e por que compradores podem confiar em você." />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Avatar">
          <Input name="avatarUrl" type="url" defaultValue={user.profile?.avatarUrl ?? user.image ?? ""} placeholder="https://..." />
        </Field>
        <Field label="Banner">
          <Input name="bannerUrl" type="url" defaultValue={user.profile?.bannerUrl ?? ""} placeholder="https://..." />
        </Field>
      </div>
      <Field label="Site ou rede principal">
        <Input name="websiteUrl" type="url" defaultValue={user.profile?.websiteUrl ?? ""} placeholder="https://..." />
      </Field>
      {message ? <Toast>{message}</Toast> : null}
      {error ? <Toast tone="red">{error}</Toast> : null}
      <Button disabled={loading}>{loading ? "Salvando..." : "Salvar perfil"}</Button>
    </form>
  );
}

export function PasswordSettingsForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword")
      })
    });
    const body = await safeJson(response);
    setLoading(false);
    if (!response.ok) {
      setError(body?.error ?? "Não foi possível alterar a senha.");
      return;
    }
    setMessage("Senha alterada com sucesso.");
  }

  return (
    <form action={submit} className="grid gap-4">
      <Field label="Senha atual">
        <Input name="currentPassword" type="password" minLength={8} required />
      </Field>
      <Field label="Nova senha">
        <Input name="newPassword" type="password" minLength={8} required />
      </Field>
      {message ? <Toast>{message}</Toast> : null}
      {error ? <Toast tone="red">{error}</Toast> : null}
      <Button variant="dark" disabled={loading}>{loading ? "Alterando..." : "Alterar senha"}</Button>
    </form>
  );
}

export function NotificationSettingsForm({ preferences }: { preferences: NotificationPref[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const events = preferences.map((preference) => ({
      event: preference.event,
      site: formData.get(`${preference.event}:site`) === "on",
      push: formData.get(`${preference.event}:push`) === "on",
      discordDm: formData.get(`${preference.event}:discordDm`) === "on",
      email: formData.get(`${preference.event}:email`) === "on",
      marketing: preference.event === "marketing" ? formData.get(`${preference.event}:marketing`) === "on" : false
    }));
    const response = await fetch("/api/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events })
    });
    const body = await safeJson(response);
    setLoading(false);
    if (!response.ok) {
      setError(body?.error ?? "Não foi possível salvar as notificações.");
      return;
    }
    setMessage("Preferências salvas.");
  }

  return (
    <form action={submit} className="space-y-3">
      {preferences.map((preference) => (
        <div key={preference.id} className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-wisepix-950">{eventLabel(preference.event)}</p>
              <p className="text-sm font-medium text-slate-500">{eventDescription(preference.event)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-slate-700 sm:flex">
              <Toggle name={`${preference.event}:site`} label="Site" defaultChecked={preference.site} />
              <Toggle name={`${preference.event}:push`} label="Push" defaultChecked={preference.push} />
              <Toggle name={`${preference.event}:discordDm`} label="Discord" defaultChecked={preference.discordDm} />
              <Toggle name={`${preference.event}:email`} label="Email" defaultChecked={preference.email} />
              {preference.event === "marketing" ? <Toggle name={`${preference.event}:marketing`} label="Marketing" defaultChecked={preference.marketing} /> : null}
            </div>
          </div>
        </div>
      ))}
      {message ? <Toast>{message}</Toast> : null}
      {error ? <Toast tone="red">{error}</Toast> : null}
      <Button disabled={loading}>{loading ? "Salvando..." : "Salvar notificações"}</Button>
    </form>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="rounded border-blue-200 text-wisepix-600 focus:ring-wisepix-200" />
      {label}
    </label>
  );
}

function eventLabel(event: string) {
  const labels: Record<string, string> = {
    "sale.new": "Nova venda",
    "order.opened": "Pedido aberto",
    "payment.paid": "Pagamento aprovado",
    "chat.message": "Mensagem no chat",
    "withdrawal.settled": "Saque pago",
    "dispute.opened": "Disputa",
    "badge.awarded": "Badge",
    "level.changed": "Nível",
    marketing: "Marketing"
  };
  return labels[event] ?? event;
}

function eventDescription(event: string) {
  if (event === "marketing") return "Novidades e campanhas. Fica desativado por padrão.";
  if (event.includes("withdrawal")) return "Atualizações importantes sobre saques.";
  if (event.includes("payment") || event.includes("sale")) return "Avisos sobre pagamento, pedido e venda.";
  return "Atualizações úteis para acompanhar sua conta.";
}
