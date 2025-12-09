import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, TrendingUp, Euro } from "lucide-react"
import { getDashboardMetrics, getMonthComparison } from "./actions"
import { cookies } from 'next/headers'
import { getTenantSettings } from "./settings/actions"
import { ComparisonWidget } from "@/components/dashboard/comparison-widget"

interface DashboardPageProps {
    searchParams: Promise<{ client?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const params = await searchParams
    const cookieStore = await cookies()
    const savedClient = cookieStore.get('admin_tenant_filter')?.value
    const selectedClient = params.client || savedClient || 'all'

    // Fetch metrics with filter
    const { totalRevenue, activeLeads, salesCount, recentSales } = await getDashboardMetrics(selectedClient)
    const comparison = await getMonthComparison(selectedClient)

    // Fetch settings for currency
    const settings = await getTenantSettings()
    const currency = settings?.currency || 'EUR'
    const CurrencyIcon = currency === 'USD' ? DollarSign : Euro

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel Principal</h2>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <CurrencyIcon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor de vida (LTV)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLeads}</div>
                        <p className="text-xs text-muted-foreground">
                            En pipeline
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Realizadas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Deals ganados
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {salesCount + activeLeads > 0
                                ? Math.round((salesCount / (salesCount + activeLeads)) * 100) + '%'
                                : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ventas / (Ventas + Activos)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle>Este Mes vs Anterior</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ComparisonWidget data={comparison} currency={currency} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle>Ventas Recientes</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Deals ganados recientemente.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSales.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No se encontraron ventas recientes.</p>
                            ) : (
                                recentSales.map((sale: any) => (
                                    <div className="flex items-center" key={sale.id}>
                                        <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-xs">
                                            {sale.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {sale.email}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-primary">
                                            +{new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(sale.value)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
