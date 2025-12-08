import { getLeads, getAllLeadsForAdmin, getClientsForFilter, getAllProfilesForAdmin } from './actions'
import { getTenantSettings } from '../settings/actions'
import { LeadsTable } from './leads-table'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, Target, Euro } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { cookies } from 'next/headers'

interface LeadsPageProps {
    searchParams: Promise<{ client?: string }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
    const profile = await getProfile()
    const isAdmin = profile?.role === 'admin'
    const params = await searchParams

    const cookieStore = await cookies()
    const savedClient = cookieStore.get('admin_tenant_filter')?.value
    const selectedClient = params.client || savedClient || 'all'

    const settings = await getTenantSettings()

    // Get leads based on role
    const leads = isAdmin
        ? await getAllLeadsForAdmin(selectedClient)
        : await getLeads()

    // Get clients for filter (only for admin)
    const clients = isAdmin ? await getClientsForFilter() : []

    // Get all users for assignment (only for admin)
    const users = isAdmin ? await getAllProfilesForAdmin() : []

    // Calculate stats
    const totalLeads = leads.length
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length
    const pipelineValue = leads.filter(l => !['won', 'lost'].includes(l.status)).reduce((sum, l) => sum + l.value, 0)
    const conversionRate = totalLeads > 0
        ? Math.round((leads.filter(l => l.status === 'won').length / totalLeads) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Leads</h2>
                    <p className="text-muted-foreground">
                        {isAdmin ? 'Ver y gestionar leads de todos los clientes.' : 'Gestiona y sigue tus oportunidades de venta.'}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLeads}</div>
                        <p className="text-xs text-muted-foreground">
                            {selectedClient !== 'all' ? 'Filtrado' : 'Histórico total'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
                        <Target className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLeads}</div>
                        <p className="text-xs text-muted-foreground">En pipeline</p>
                    </CardContent>
                </Card>



                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor en Pipeline</CardTitle>
                        {settings?.currency === 'USD' ? (
                            <DollarSign className="h-4 w-4 text-primary" />
                        ) : (
                            <Euro className="h-4 w-4 text-primary" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: settings?.currency || 'EUR', maximumFractionDigits: 0 }).format(pipelineValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">Deals activos</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">Ganados / Total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Table */}
            <LeadsTable
                leads={leads}
                showOwner={isAdmin}
                clients={clients}
                users={users}
                currency={settings?.currency || 'EUR'}
            />
        </div>
    )
}
