export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
