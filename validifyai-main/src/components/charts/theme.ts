/**
 * Shared chart theme tokens. Centralizing here so all charts read from
 * the same palette and we never sprinkle inline oklch() literals across
 * the codebase.
 */
export const chartColors = {
  primary: "oklch(0.70 0.16 268)",
  accent: "oklch(0.66 0.12 230)",
  positive: "oklch(0.72 0.13 175)",
  warning: "oklch(0.78 0.11 90)",
  magenta: "oklch(0.62 0.14 310)",
  grid: "oklch(1 0 0 / 0.06)",
  axis: "oklch(0.66 0.012 260)",
};

export const chartSeries = [
  chartColors.primary,
  chartColors.accent,
  chartColors.positive,
  chartColors.warning,
  chartColors.magenta,
];

export const chartTooltip = {
  background: "oklch(0.18 0.005 270)",
  border: "1px solid oklch(1 0 0 / 0.08)",
  borderRadius: 10,
  fontSize: 12,
};
