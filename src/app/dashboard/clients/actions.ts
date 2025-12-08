'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
// import { type Profile } from '@/lib/auth' // Removed to avoid conflict

// Admin client for user management
function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

async function isCurrentUserAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

export type Profile = {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    role: 'admin' | 'client'
    api_key: string | null
    created_at: string
    tenant_id: string | null
    tenants?: { name: string } | null
}

export async function getAllClients(): Promise<Profile[]> {
    // First verify the requester is an admin
    if (!await isCurrentUserAdmin()) {
        return []
    }

    const adminClient = getAdminClient()

    // We use adminClient to bypass RLS if needed, though getAdminClient() usually implies service role
    const { data: profiles, error } = await adminClient
        .from('profiles')
        .select(`
            *,
            tenants (
                name
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }

    return profiles as Profile[]
}

export async function getTenantsList() {
    const adminClient = getAdminClient()
    const { data } = await adminClient.from('tenants').select('*').order('name')
    return data || []
}

export async function createClientUser(formData: FormData) {
    if (!await isCurrentUserAdmin()) {
        return { error: 'Not authorized' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string || 'client'
    const tenantId = formData.get('tenant_id') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const adminClient = getAdminClient()

    // 1. Create user in Auth (Trigger creates Profile)
    const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    if (data.user) {
        // 2. Update Profile with Role and Tenant
        const updateData: any = { role }

        if (tenantId && tenantId !== 'undefined') {
            updateData.tenant_id = tenantId
        }

        const { error: profileError } = await adminClient
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id)

        if (profileError) {
            console.error('Error updating profile role:', profileError)
        }
    }

    revalidatePath('/dashboard/clients')
    return { success: true, userId: data.user?.id }
}

export async function updateClientPassword(clientId: string, newPassword: string) {
    if (!await isCurrentUserAdmin()) {
        return { error: 'Not authorized' }
    }

    if (!newPassword || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const adminClient = getAdminClient()

    const { error } = await adminClient.auth.admin.updateUserById(clientId, {
        password: newPassword
    })

    if (error) {
        console.error('Error updating password:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function updateClient(formData: FormData) {
    if (!await isCurrentUserAdmin()) {
        return { error: 'Not authorized' }
    }

    const userId = formData.get('id') as string
    const fullName = formData.get('full_name') as string
    const companyName = formData.get('company_name') as string
    const email = formData.get('email') as string
    const tenantId = formData.get('tenant_id') as string

    const adminClient = getAdminClient()

    // 1. Update Profile fields
    const updateData: any = {
        full_name: fullName,
        company_name: companyName,
        updated_at: new Date().toISOString()
    }

    if (tenantId && tenantId !== 'undefined' && tenantId !== 'null') {
        updateData.tenant_id = tenantId
    }

    const { error: profileError } = await adminClient
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return { error: profileError.message }
    }

    // Update email in auth if changed
    if (email) {
        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
            email: email,
            email_confirm: true // Ensure email is confirmed if changing it
        })

        if (authError) {
            console.error('Error updating user email:', authError)
            // Don't fail completely, profile was updated
        }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function updateClientRole(clientId: string, newRole: 'admin' | 'client') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentProfile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', clientId)

    if (error) {
        console.error('Error updating client role:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function deleteClient(clientId: string) {
    try {
        if (!await isCurrentUserAdmin()) {
            return { error: 'Not authorized' }
        }

        const adminClient = getAdminClient()

        // 1. First delete all leads for this user to resolve FK constraints
        const { error: leadsError } = await adminClient
            .from('leads')
            .delete()
            .eq('user_id', clientId)

        if (leadsError) {
            console.error('Error deleting user leads:', leadsError)
            return { error: `Failed to delete leads: ${leadsError.message}` }
        }

        // 2. Delete user from auth (cascades to profile)
        const { error } = await adminClient.auth.admin.deleteUser(clientId)

        if (error) {
            console.error('Error deleting user:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/clients')
        return { success: true }

    } catch (err: any) {
        console.error('Error in deleteClient:', err)
        return { error: 'An unexpected error occurred' }
    }
}

export async function getLeadsCountByUser(userId: string): Promise<number> {
    const supabase = await createClient()

    const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    return count || 0
}
