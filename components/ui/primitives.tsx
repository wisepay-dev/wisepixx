import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "danger";
};

const buttonVariants = {
  primary: "bg-wisepix-600 text-white shadow-sm hover:bg-wisepix-700",
  secondary: "border border-blue-100 bg-white text-wisepix-900 hover:border-wisepix-200 hover:bg-wisepix-50",
  ghost: "text-wisepix-900 hover:bg-wisepix-50",
  dark: "bg-premium-black text-white hover:bg-slate-900",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-wisepix-200 disabled:pointer-events-none disabled:opacity-55",
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonProps["variant"] }) {
  return (
    <Link
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-wisepix-200",
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

const fieldClass =
  "w-full rounded-lg border-blue-100 bg-white text-sm text-wisepix-950 shadow-sm transition placeholder:text-slate-400 focus:border-wisepix-500 focus:ring-wisepix-200";

export function Input(props: ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={clsx("h-11", fieldClass, props.className)} />;
}

export function Textarea(props: ComponentPropsWithoutRef<"textarea">) {
  return <textarea {...props} className={clsx(fieldClass, props.className)} />;
}

export function Select(props: ComponentPropsWithoutRef<"select">) {
  return <select {...props} className={clsx("h-11", fieldClass, props.className)} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Card({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx("rounded-lg border border-blue-100 bg-white shadow-sm", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={clsx("rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:p-5", className)} {...props} />;
}

export function Badge({ className, tone = "blue", ...props }: ComponentPropsWithoutRef<"span"> & { tone?: "blue" | "slate" | "green" | "amber" }) {
  const tones = {
    blue: "bg-wisepix-50 text-wisepix-800",
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800"
  };
  return <span className={clsx("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black", tones[tone], className)} {...props} />;
}

export function Avatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  return (
    <div className={clsx("grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-premium-black text-sm font-black text-white", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="h-full w-full object-cover" />
      ) : (
        name?.[0]?.toUpperCase() ?? "W"
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-normal text-wisepix-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-black tracking-normal text-wisepix-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-slate-100", className)} />;
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-wisepix-950">{value}</p>
          {detail ? <p className="mt-1 text-sm font-medium text-slate-500">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-wisepix-50 text-wisepix-700">
            <Icon size={19} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function Tabs({ items, active }: { items: { href: string; label: string }[]; active: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-blue-100 bg-white p-1 shadow-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold transition",
            active === item.href ? "bg-wisepix-600 text-white" : "text-slate-600 hover:bg-wisepix-50 hover:text-wisepix-900"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="relative">
      <summary className="list-none cursor-pointer rounded-lg focus:outline-none focus:ring-4 focus:ring-wisepix-200">{label}</summary>
      <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-blue-100 bg-white p-2 shadow-soft">{children}</div>
    </details>
  );
}

export function Modal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black text-wisepix-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function Toast({ tone = "green", children }: { tone?: "green" | "red" | "blue"; children: ReactNode }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-100 bg-wisepix-50 text-wisepix-900"
  };
  return <p className={clsx("rounded-lg border p-3 text-sm font-bold", tones[tone])}>{children}</p>;
}

export function PolishedEmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-blue-200 bg-white p-7 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-wisepix-50 text-wisepix-700">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-xl font-black text-wisepix-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function asComponent<T extends ElementType>(component: T) {
  return component;
}
