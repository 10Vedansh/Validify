import {
  ResponsiveContainer,
  RadarChart as RRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { chartColors } from "./theme";

export function RadarChart({
  data,
  height = 240,
  dataKey = "v",
  angleKey = "axis",
}: {
  data: Array<Record<string, unknown>>;
  height?: number;
  dataKey?: string;
  angleKey?: string;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RRadarChart data={data}>
          <PolarGrid stroke={chartColors.grid} />
          <PolarAngleAxis dataKey={angleKey} tick={{ fill: chartColors.axis, fontSize: 11 }} />
          <Radar
            dataKey={dataKey}
            stroke={chartColors.primary}
            fill={chartColors.primary}
            fillOpacity={0.18}
          />
        </RRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
