"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/components/currency-provider";

interface IncomeVsExpenseChartProps {
  data: {
    date: string;
    income: number;
    expense: number;
  }[];
}

export function IncomeVsExpenseChart({ data }: IncomeVsExpenseChartProps) {
  const { convert, formatPrice, currency: currentCurrency } = useCurrency();

  const convertedData = data.map(d => ({
    ...d,
    income: convert(d.income, "VND", currentCurrency),
    expense: convert(d.expense, "VND", currentCurrency),
  }));

  return (
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium">So sánh Thu nhập & Chi tiêu (30 ngày)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-[350px] pt-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">
            Chưa có biểu đồ
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={convertedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatPrice(val, currentCurrency)}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                cursor={false}
                formatter={(value: any) => [formatPrice(Number(value || 0), currentCurrency), ""]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar
                dataKey="income"
                name="Thu nhập"
                fill="oklch(0.65 0.18 160)" // Emerald
                radius={[6, 6, 0, 0]}
                barSize={16}
                activeBar={{ fill: 'oklch(0.7 0.2 160)' }}
              />
              <Bar
                dataKey="expense"
                name="Chi tiêu"
                fill="oklch(0.6 0.18 20)" // Rose-ish
                radius={[6, 6, 0, 0]}
                barSize={16}
                activeBar={{ fill: 'oklch(0.65 0.2 20)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
