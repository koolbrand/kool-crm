import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { getProfile } from "@/lib/auth"
import { getClientsForFilter } from "@/app/dashboard/leads/actions"
import { TenantFilter } from "@/components/layout/tenant-filter"

import { cookies } from 'next/headers'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await getProfile()
    const isAdmin = profile?.role === 'admin'

    // Fetch tenants for filter if admin
    const clients = isAdmin ? await getClientsForFilter() : []
    const tenantOptions = clients.map(c => ({ id: c.id, name: c.company_name || 'Sin Nombre' }))

    // Read saved filter from cookie
    const cookieStore = await cookies()
    const savedClient = cookieStore.get('admin_tenant_filter')?.value || 'all'

    return (
        <div className="h-full relative bg-background">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-sidebar">
                <Sidebar isAdmin={isAdmin} />
            </div>
            <main className="md:pl-72 h-full min-h-screen flex flex-col">
                {/* Topbar */}
                <div className="flex items-center p-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <MobileSidebar isAdmin={isAdmin} />
                    <div className="ml-auto flex items-center gap-x-4">
                        {isAdmin && tenantOptions.length > 0 && (
                            <TenantFilter tenants={tenantOptions} initialValue={savedClient} />
                        )}
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-xs">
                            {profile?.email?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
