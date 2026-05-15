import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Wrench } from "lucide-react";

type UnderConstructionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export function UnderConstruction({ title, description, icon: Icon = Wrench }: UnderConstructionProps) {
  return (
    <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-wisepix-50 text-wisepix-700">
        <Icon size={22} />
      </div>
      <h1 className="mt-4 text-2xl font-black text-wisepix-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description ?? "Esta área está em construção e será liberada em breve."}
      </p>
      <Link href="/dashboard" className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-wisepix-600 px-4 text-sm font-bold text-white">
        Voltar ao dashboard
      </Link>
    </section>
  );
}
