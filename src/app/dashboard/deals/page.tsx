import { getDeals, getAllDealsForAdmin } from './actions'
import { DealsTable } from './deals-table'
import { getAllClients } from '../clients/actions'
import { getProfile } from '@/lib/auth'
import { cookies } from 'next/headers'

import { getTenantSettings } from '../settings/actions'

interface DealsPageProps {
    searchParams: Promise<{ client?: string }>
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
    const profile = await getProfile()
    const isAdmin = profile?.role === 'admin'
    const params = await searchParams

    const cookieStore = await cookies()
    const savedClient = cookieStore.get('admin_tenant_filter')?.value
    const selectedClient = params.client || savedClient || 'all'

    const deals = isAdmin
        ? await getAllDealsForAdmin(selectedClient)
        : await getDeals()

    const clients = await getAllClients()
    const settings = await getTenantSettings()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Oportunidades</h2>
                <p className="text-muted-foreground">Gestiona tu embudo de ventas y oportunidades.</p>
            </div>

            <DealsTable
                initialDeals={deals}
                clients={clients}
                currency={settings?.currency || 'EUR'}
            />
        </div>
    )
}
