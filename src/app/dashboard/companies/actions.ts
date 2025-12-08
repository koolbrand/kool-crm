'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Admin client for bypassing RLS
function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

async function isCurrentUserAdmin() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

// Define Tenant type
export type Tenant = {
    id: string
    name: string
    status: 'active' | 'trial' | 'past_due' | 'cancelled'
    plan: 'starter' | 'pro' | 'enterprise'
    meta_page_id: string | null
    created_at: string
}

export async function getAllTenants() {
    // Read operations can use RLS (assuming policies are correct for SELECT)
    // But consistent admin access is safer for admin dashboard.
    if (!await isCurrentUserAdmin()) return []

    const adminClient = getAdminClient()

    const { data, error } = await adminClient
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tenants:', error)
        return []
    }

    return data as Tenant[]
}

export async function createTenant(formData: FormData) {
    if (!await isCurrentUserAdmin()) return { error: 'Not authorized' }

    const adminClient = getAdminClient()

    const name = formData.get('name') as string
    const status = formData.get('status') as string || 'active'
    const plan = formData.get('plan') as string || 'starter'
    const meta_page_id = (formData.get('meta_page_id') as string) || null

    if (!name) {
        return { error: 'Company name is required' }
    }

    const { error } = await adminClient
        .from('tenants')
        .insert({ name, status, plan, meta_page_id })

    if (error) {
        console.error('Error creating tenant:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/companies')
    return { success: true }
}

export async function updateTenant(formData: FormData) {
    if (!await isCurrentUserAdmin()) return { error: 'Not authorized' }

    const adminClient = getAdminClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const plan = formData.get('plan') as string
    const meta_page_id = (formData.get('meta_page_id') as string) || null

    if (!id || !name) {
        return { error: 'ID and Name are required' }
    }

    const { error } = await adminClient
        .from('tenants')
        .update({ name, status, plan, meta_page_id })
        .eq('id', id)

    if (error) {
        console.error('Error updating tenant:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/companies')
    return { success: true }
}

export async function deleteTenant(tenantId: string) {
    if (!await isCurrentUserAdmin()) return { error: 'Not authorized' }

    const adminClient = getAdminClient()

    const { error } = await adminClient
        .from('tenants')
        .delete()
        .eq('id', tenantId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/companies')
    return { success: true }
}
