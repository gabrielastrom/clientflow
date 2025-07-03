"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Label } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { financialData } from "@/lib/data";

const chartData = financialData.revenueByClient;

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  ...chartData.reduce((acc, client) => {
    acc[client.name as keyof typeof acc] = {
      label: client.name,
      color: client.fill,
    };
    return acc;
  }, {} as { [key: string]: { label: string, color: string } }),
} satisfies ChartConfig;

export default function RevenueByClientChart() {
  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, []);

  return (
    <div className="h-[350px] w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="revenue"
            nameKey="name"
            innerRadius="60%"
            strokeWidth={5}
            stroke="hsl(var(--background))"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        dy="-0.5em"
                        className="text-2xl font-bold"
                        fill="hsl(var(--foreground))"
                      >
                        {totalRevenue.toLocaleString()} kr
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        dy="1.2em"
                        className="text-sm"
                        fill="hsl(var(--muted-foreground))"
                      >
                        This Month
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
          <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
