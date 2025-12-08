'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client helper
function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function getDashboardMetrics(clientId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { totalRevenue: 0, activeLeads: 0, salesCount: 0, recentSales: [] }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    // If Admin, use AdminClient to access all data or filtered data
    // If Not Admin, use standard Client (RLS)
    const client = isAdmin ? getAdminClient() : supabase

    // Helper to apply filter
    const applyFilter = (query: any) => {
        if (isAdmin && clientId && clientId !== 'all') {
            return query.eq('tenant_id', clientId)
        }
        return query
    }

    // 1. Total Revenue (Value of all 'won' deals)
    let revenueQuery = client.from('leads').select('value').eq('status', 'won')
    revenueQuery = applyFilter(revenueQuery)
    const { data: revenueData } = await revenueQuery

    const totalRevenue = revenueData?.reduce((acc: any, curr: any) => acc + (Number(curr.value) || 0), 0) || 0

    // 2. Active Leads (Not won or lost)
    let activeLeadsQuery = client.from('leads').select('*', { count: 'exact', head: true }).not('status', 'in', '("won","lost")')
    activeLeadsQuery = applyFilter(activeLeadsQuery)
    const { count: activeLeads } = await activeLeadsQuery

    // 3. Sales Count (Won deals)
    let salesQuery = client.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'won')
    salesQuery = applyFilter(salesQuery)
    const { count: salesCount } = await salesQuery

    // 4. Recent Sales (Last 5 won deals)
    let recentSalesQuery = client.from('leads').select('*').eq('status', 'won').order('updated_at', { ascending: false }).limit(5)
    recentSalesQuery = applyFilter(recentSalesQuery)
    const { data: recentSales } = await recentSalesQuery

    return {
        totalRevenue,
        activeLeads: activeLeads || 0,
        salesCount: salesCount || 0,
        recentSales: recentSales || []
    }
}

export async function seedLeads(formData: FormData) {
    console.log("Seeding leads triggered...")
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error("Seeding auth error:", authError)
        console.error("Seeding auth error:", authError)
        return
    }
    console.log("User authenticated:", user.id)

    const dummyLeads = [
        { name: 'Olivia Martin', email: 'olivia.martin@email.com', company: 'Global Dynamics', value: 1999.00, status: 'won', user_id: user.id },
        { name: 'Jackson Lee', email: 'jackson.lee@email.com', company: 'Isotronic', value: 3900.00, status: 'new', user_id: user.id },
        { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', company: 'Quantum Corp', value: 299.00, status: 'lost', user_id: user.id },
        { name: 'William Kim', email: 'will@email.com', company: 'TechNova', value: 99.00, status: 'won', user_id: user.id },
        { name: 'Sofia Davis', email: 'sofia.davis@email.com', company: 'SoftWorks', value: 39.00, status: 'won', user_id: user.id },
        { name: 'Ethan Hunt', email: 'ethan@imf.org', company: 'IMF', value: 15000.00, status: 'proposal', user_id: user.id },
    ]

    const { error } = await supabase.from('leads').insert(dummyLeads)

    if (error) {
        console.error("Error seeding:", error)
        console.error("Error seeding:", error)
        return
    }

    console.log("Seeding successful for user:", user.id)
    revalidatePath('/dashboard')
    return
}
