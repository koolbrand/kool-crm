import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, TrendingUp, Euro } from "lucide-react"
import { getDashboardMetrics, seedLeads } from "./actions"
import { Button } from "@/components/ui/button"
import { cookies } from 'next/headers'
import { getTenantSettings } from "./settings/actions"

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

    // Fetch settings for currency
    const settings = await getTenantSettings()
    const currency = settings?.currency || 'EUR'
    const CurrencyIcon = currency === 'USD' ? DollarSign : Euro

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel Principal</h2>
                <form action={seedLeads}>
                    <Button type="submit" variant="outline" size="sm">
                        Generar Datos Demo
                    </Button>
                </form>
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
                        <CardTitle>Resumen General</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Chart Placeholder */}
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed border-border/50 rounded-md bg-background/20">
                            Gráfico de Datos Próximamente
                        </div>
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
