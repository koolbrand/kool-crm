import { getAllClients, getTenantsList } from './actions'
import { ClientsTable } from './clients-table'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export default async function ClientsPage() {
    const profile = await getProfile()

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard')
    }

    const [clients, tenants] = await Promise.all([
        getAllClients(),
        getTenantsList()
    ])

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h2>
                <p className="text-muted-foreground">Gestiona los usuarios de tu organización, incluyendo administradores y clientes.</p>
            </div>

            {/* Clients Table */}
            <ClientsTable clients={clients} tenants={tenants} />
        </div>
    )
}
