import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { chartColors, chartSeries, chartTooltip } from "./theme";

export type AreaSeries = { key: string; label?: string; color?: string };

export function AreaChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 280,
}: {
  data: T[];
  xKey: keyof T & string;
  series: AreaSeries[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RechartsAreaChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`area-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={s.color ?? chartSeries[i % chartSeries.length]}
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor={s.color ?? chartSeries[i % chartSeries.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={chartColors.axis}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={chartColors.axis}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip contentStyle={chartTooltip} cursor={{ stroke: chartColors.grid }} />
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color ?? chartSeries[i % chartSeries.length]}
              strokeWidth={1.5}
              fill={`url(#area-${s.key})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
