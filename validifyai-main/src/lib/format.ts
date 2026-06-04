export const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

export const formatCompact = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
