export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatPercent(value: number) {
  return `${Math.round(value || 0)}%`;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not yet logged";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
