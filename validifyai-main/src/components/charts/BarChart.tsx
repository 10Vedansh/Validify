import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { chartColors, chartTooltip } from "./theme";

export function BarChart<T extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  height = 240,
  color = chartColors.primary,
}: {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RBarChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
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
          <Tooltip contentStyle={chartTooltip} cursor={{ fill: chartColors.grid }} />
          <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
