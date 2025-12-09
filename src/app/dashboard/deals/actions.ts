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

    leads?: { name: string, email: string, company: string, phone: string | null } | null

    // Admin fields
    owner_email?: string
    owner_company?: string
}

const PIPELINE_STATUSES = ['qualified', 'proposal', 'negotiation', 'won', 'lost']

function mapLeadToDeal(lead: any): Deal {
    const interest = lead.deal || 'Oportunidad General'
    const entityName = lead.company || lead.name

    // CRM Best Practice: Title should be the Opportunity Name (Interest), Contact is the Person.
    // However, to avoid duplicate "Blanqueamiento" cards, we can prefix properly or let the user decide.
    // For now, let's try Title = "Interest" and let the Subtitle be "Name".
    // If interest is generic, maybe prepend Name?
    // "Name - Interest" is the safest unique title.

    const title = `${entityName} - ${interest}`

    // Lead status: new, contacted, qualified, proposal, negotiation, won, lost
    // Deal stage: qualification, proposal, negotiation, won, lost

    let stage = lead.status
    if (stage === 'qualified') stage = 'qualification'

    // Fallback if status is not in pipeline stages (e.g. 'new')
    if (!PIPELINE_STATUSES.includes(stage) && stage !== 'qualification') {
        stage = 'qualification'
    }

    return {
        id: lead.id,
        tenant_id: lead.tenant_id,
        title: title,
        value: lead.value || 0,
        currency: 'EUR',
        stage: stage,
        active: true,
        close_date: null,
        contact_id: null,
        lead_id: lead.id,
        created_at: lead.created_at,
        leads: {
            name: lead.name, // The Person
            email: lead.email,
            company: lead.company, // The Company
            phone: lead.phone
        },
    }
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
        .from('leads')
        .select('*')
        .in('status', PIPELINE_STATUSES) // Only pipeline leads
        .order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
        query = query.eq('tenant_id', clientId)
    }

    const { data: leads, error } = await query

    if (error) {
        console.error('Error fetching ALL deals (from leads):', error)
        return []
    }

    return leads.map(mapLeadToDeal)
}

export async function getDeals() {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .in('status', PIPELINE_STATUSES)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching deals (from leads):', error)
        return []
    }

    return leads.map(mapLeadToDeal)
}

// Create Deal -> Create Lead in Qualified Status?
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

    // We need to parse title back to name/company? 
    // Or just put it in name/deal?
    // Let's assume title is 'Name' for now if specific format not required.
    // Or we ask user for Name and Deal separately in the form? 
    // The current DealForm has 'title'. 

    // Mapping: Title -> Name (or Deal field?) 
    // Let's use Title as Deal Name (field 'deal') and 'Unknown' as name?
    // Or 'Title' as Name?

    // Better: Title -> 'deal' field. Name -> 'New Prospect'.

    const statusMap: Record<string, string> = {
        'qualification': 'qualified',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'won': 'won',
        'lost': 'lost'
    }

    const { error } = await supabase
        .from('leads')
        .insert({
            tenant_id: profile.tenant_id,
            name: title, // Use title as name for simplicity or split it?
            value,
            status: statusMap[stage] || 'qualified',
            deal: '', // Or title?
            user_id: user.id // Assign to creator?
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}

export async function updateDealStage(dealId: string, newStage: string) {
    // dealId is leadId
    const supabase = await createClient()

    const statusMap: Record<string, string> = {
        'qualification': 'qualified',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'won': 'won',
        'lost': 'lost'
    }

    const { error } = await supabase
        .from('leads')
        .update({ status: statusMap[newStage] }) // removed updated_at as it might not distinguish
        // .update({ status: statusMap[newStage], updated_at: new Date().toISOString() })
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

    const statusMap: Record<string, string> = {
        'qualification': 'qualified',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'won': 'won',
        'lost': 'lost'
    }

    const { error } = await supabase
        .from('leads')
        .update({
            name: title, // Mapping title back to name?
            value,
            status: statusMap[stage],
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
        .from('leads')
        .delete()
        .eq('id', dealId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/deals')
    return { success: true }
}
