
"use client";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

type RevenueChartProps = {
  data: { month: string; revenue: number }[];
};

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${Number(value) / 1000}k kr`} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
