type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-wisepix-950">{value}</p>
      {detail ? <p className="mt-1 text-sm font-medium text-slate-500">{detail}</p> : null}
    </div>
  );
}
