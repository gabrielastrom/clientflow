"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";

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
  "Glamour Inc.": {
    label: "Glamour Inc.",
    color: "hsl(var(--chart-1))",
  },
  "Peak Fitness": {
    label: "Peak Fitness",
    color: "hsl(var(--chart-2))",
  },
  "Coffee House": {
    label: "Coffee House",
    color: "hsl(var(--chart-3))",
  },
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
          </Pie>
          <foreignObject
              width="100%"
              height="100%"
              className="[&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:flex-col [&>div]:items-center [&>div]:justify-center [&>div]:text-center"
          >
              <div>
                  <p className="text-2xl font-bold">
                      {totalRevenue.toLocaleString()} kr
                  </p>
                  <p className="text-sm text-muted-foreground">This Month</p>
              </div>
          </foreignObject>
          <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
