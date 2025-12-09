'use client'

import { type MonthComparison } from '@/app/dashboard/actions'
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Users, Euro } from 'lucide-react'

interface ComparisonWidgetProps {
    data: MonthComparison
    currency: string
}

export function ComparisonWidget({ data, currency }: ComparisonWidgetProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    const metrics = [
        {
            label: 'Leads',
            current: data.thisMonth.leads,
            previous: data.lastMonth.leads,
            format: (v: number) => v.toString(),
            icon: Users,
        },
        {
            label: 'Ingresos',
            current: data.thisMonth.revenue,
            previous: data.lastMonth.revenue,
            format: formatCurrency,
            icon: Euro,
        },
        {
            label: 'Ganados',
            current: data.thisMonth.won,
            previous: data.lastMonth.won,
            format: (v: number) => v.toString(),
            icon: TrendingUp,
        },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Este mes</span>
                <span>vs Mes anterior</span>
            </div>
            <div className="space-y-3">
                {metrics.map((metric) => {
                    const change = calcChange(metric.current, metric.previous)
                    const isPositive = change > 0
                    const isNegative = change < 0
                    const isNeutral = change === 0

                    return (
                        <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/50">
                            <div className="flex items-center gap-3">
                                <metric.icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                                    <p className="font-semibold">{metric.format(metric.current)}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
                                }`}>
                                {isPositive && <ArrowUpRight className="h-4 w-4" />}
                                {isNegative && <ArrowDownRight className="h-4 w-4" />}
                                {isNeutral && <Minus className="h-4 w-4" />}
                                <span>{isPositive ? '+' : ''}{change}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Mes anterior: {data.lastMonth.leads} leads, {formatCurrency(data.lastMonth.revenue)}
            </p>
        </div>
    )
}
