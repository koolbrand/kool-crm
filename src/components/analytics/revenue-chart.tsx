"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface RevenueChartProps {
    data: { name: string; value: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[350px] flex items-center justify-center text-muted-foreground">Sin datos suficientes</div>
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                    itemStyle={{ color: '#22c55e' }}
                    formatter={(value: number) => [`€${value}`, 'Ingresos']}
                />
                <Bar
                    dataKey="value"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                    barSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
