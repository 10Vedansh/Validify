/**
 * Shared chart theme tokens. Centralizing here so all charts read from
 * the same palette and we never sprinkle inline oklch() literals across
 * the codebase.
 */
export const chartColors = {
  primary: "oklch(0.68 0.18 268)",
  accent: "oklch(0.64 0.14 230)",
  positive: "oklch(0.70 0.14 175)",
  warning: "oklch(0.76 0.12 90)",
  magenta: "oklch(0.60 0.16 310)",
  grid: "oklch(1 0 0 / 0.05)",
  axis: "oklch(0.60 0.012 260)",
};

export const chartSeries = [
  chartColors.primary,
  chartColors.accent,
  chartColors.positive,
  chartColors.warning,
  chartColors.magenta,
];

export const chartTooltip = {
  background: "oklch(0.175 0.004 270)",
  border: "1px solid oklch(1 0 0 / 0.06)",
  borderRadius: 8,
  fontSize: 12,
};
