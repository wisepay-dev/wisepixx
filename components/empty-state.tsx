import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
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
