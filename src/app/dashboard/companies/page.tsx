import { getAllTenants } from './actions'
import { CompaniesTable } from './companies-table'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export default async function CompaniesPage() {
    const profile = await getProfile()

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard')
    }

    const tenants = await getAllTenants()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h2>
                <p className="text-muted-foreground">Gestiona tus empresas cliente y sus suscripciones.</p>
            </div>

            <CompaniesTable tenants={tenants} />
        </div>
    )
}
