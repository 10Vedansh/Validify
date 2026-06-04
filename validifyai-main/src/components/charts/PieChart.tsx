import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { chartSeries, chartTooltip } from "./theme";

export function PieChart({
  data,
  dataKey = "value",
  nameKey = "name",
  height = 260,
}: {
  data: Array<Record<string, unknown>>;
  dataKey?: string;
  nameKey?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={chartSeries[i % chartSeries.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}
