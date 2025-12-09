import { getDeals, getAllDealsForAdmin } from '../actions'
import { KanbanBoard } from './kanban-board'
import { getProfile } from '@/lib/auth'
import { cookies } from 'next/headers'

import { getTenantSettings } from '../../settings/actions'

interface KanbanPageProps {
    searchParams: Promise<{ client?: string }>
}

export default async function KanbanPage({ searchParams }: KanbanPageProps) {
    const profile = await getProfile()
    const isAdmin = profile?.role === 'admin'
    const params = await searchParams

    const cookieStore = await cookies()
    const savedClient = cookieStore.get('admin_tenant_filter')?.value
    const selectedClient = params.client || savedClient || 'all'

    const deals = isAdmin
        ? await getAllDealsForAdmin(selectedClient)
        : await getDeals()

    const settings = await getTenantSettings()

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-none p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            Funnel
                        </h1>
                        <p className="text-muted-foreground">
                            Arrastra y suelta las tarjetas para actualizar su estado.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <KanbanBoard initialDeals={deals} currency={settings?.currency || 'EUR'} />
            </div>
        </div>
    )
}
