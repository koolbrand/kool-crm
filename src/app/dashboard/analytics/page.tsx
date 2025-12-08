import { getAnalyticsData } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { SourcesChart } from '@/components/analytics/sources-chart'
import { Euro, TrendingUp, Users, Target } from 'lucide-react'

export default async function AnalyticsPage() {
    // Fetch data server-side
    const data = await getAnalyticsData()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Analítica</h2>
                <p className="text-muted-foreground">Visión general del rendimiento de tu negocio.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales (LTV)</CardTitle>
                        <Euro className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            De {data.wonDealsCount} deals ganados
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.avgTicket)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Promedio por venta
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                        <Target className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Deals ganados / cerrados
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deals Ganados</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.wonDealsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Clientes cerrados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Tendencia de Ingresos</CardTitle>
                        <CardDescription>
                            Rendimiento mensual de los últimos 6 meses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueChart data={data.revenueByMonth} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Fuentes de Leads</CardTitle>
                        <CardDescription>
                            Orígenes más efectivos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SourcesChart data={data.leadSourceData} />
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Chart */}
            <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Embudo de Ventas (Pipeline)</CardTitle>
                    <CardDescription>
                        Distribución de deals por etapa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <FunnelChart data={data.funnelData} />
                </CardContent>
            </Card>
        </div>
    )
}
