"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface CustomChartProps {
  data: any[];
  type: "bar" | "pie" | "line" | "area";
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  height?: number;
  colors?: string[];
  title?: string;
  formatter?: (value: any) => string;
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function CustomChart({
  data,
  type,
  xKey = "name",
  yKey = "value",
  nameKey = "name",
  valueKey = "value",
  height = 300,
  colors = DEFAULT_COLORS,
  title,
  formatter
}: CustomChartProps) {
  const formatTooltip = (value: any, name?: string) => {
    if (formatter) {
      return [formatter(value), name];
    }
    return [value, name];
  };

  const renderChart = (): React.ReactElement | null => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey={yKey} fill={colors[0]} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatTooltip} />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatTooltip} />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]} 
              fill={colors[0]} 
              fillOpacity={0.6} 
            />
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p>Nenhum dado disponível para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() || <div>Nenhum gráfico disponível</div>}
      </ResponsiveContainer>
    </div>
  );
}


