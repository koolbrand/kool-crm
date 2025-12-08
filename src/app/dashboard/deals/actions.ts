'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Admin client helper
function getAdminClient() {

    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export type Deal = {
    id: string
    tenant_id: string
    title: string
    value: number
    currency: string
    stage: 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost'
    active: boolean
    close_date: string | null
    contact_id: string | null
    lead_id: string | null
    created_at: string
    profiles?: { full_name: string, email: string } | null
    leads?: { name: string, email: string, company: string } | null
    // Admin fields
    owner_email?: string
    owner_company?: string
}

export async function getAllDealsForAdmin(clientId?: string): Promise<Deal[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return getDeals()
    }

    const adminSupabase = getAdminClient()
    let query = adminSupabase
        .from('deals')
        .select(`
            *,
            profiles:contact_id (
                full_name,
                email
            ),
            leads:lead_id (
                name,
                email,
                company
            )
        `)
        .order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
        query = query.eq('tenant_id', clientId)
    }

    const { data: deals, error } = await query

    if (error) {
        console.error('Error fetching ALL deals:', error)
        return []
    }

    // We might need to join tenants manualy if we want company names, 
    // but the Deal type doesn't strictly require it unless shown in table. 
    // Existing getDeals doesn't return company name of the tenant.
    // But for admin view, knowing the tenant is useful?
    // Let's add tenant name if possible, similar to Leads.

    // For now, return as is, assuming UI might not show it yet or will use tenant_id.
    return deals as Deal[]
}

export async function getDeals() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('deals')
        .select(`
            *,
            profiles:contact_id (
                full_name,
                email
            ),
            leads:lead_id (
                name,
                email,
                company
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching deals:', error)
        return []
    }

    return data as Deal[]
}

export async function createDeal(formData: FormData) {
    const supabase = await createClient()

    // Get current user's tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) {
        return { error: 'No tenant found for user' }
    }

    const title = formData.get('title') as string
    const value = parseFloat(formData.get('value') as string) || 0
    const stage = formData.get('stage') as string || 'qualification'
    const contactId = formData.get('contact_id') as string
    const leadId = formData.get('lead_id') as string

    if (!title) {
        return { error: 'Title is required' }
    }

    const { error } = await supabase
        .from('deals')
        .insert({
            tenant_id: profile.tenant_id,
            title,
            value,
            stage,
            contact_id: contactId || null,
            lead_id: leadId || null,
            active: true
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}

export async function updateDealStage(dealId: string, newStage: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', dealId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}

export async function updateDeal(dealId: string, formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const value = parseFloat(formData.get('value') as string) || 0
    const stage = formData.get('stage') as string

    const { error } = await supabase
        .from('deals')
        .update({
            title,
            value,
            stage,
            updated_at: new Date().toISOString()
        })
        .eq('id', dealId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}

export async function deleteDeal(dealId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}
