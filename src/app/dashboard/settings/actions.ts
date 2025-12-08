'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type Profile } from '@/lib/auth'

export async function getProfileAction(): Promise<Profile | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updates = {
        full_name: formData.get('full_name') as string || null,
        company_name: formData.get('company_name') as string || null,
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function regenerateApiKeyAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const newApiKey = crypto.randomUUID()

    const { error } = await supabase
        .from('profiles')
        .update({ api_key: newApiKey, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        console.error('Error regenerating API key:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true, api_key: newApiKey }
}

export type TenantSettings = {
    currency: string
    language: string
    meta_page_id: string | null
}

export async function getTenantSettings(): Promise<TenantSettings | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return null

    const { data: tenant } = await supabase
        .from('tenants')
        .select('currency, language, meta_page_id')
        .eq('id', profile.tenant_id)
        .single()

    return tenant || { currency: 'EUR', language: 'es', meta_page_id: null }
}

export async function updateTenantSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) {
        return { error: 'No tenant found' }
    }

    if (profile.role !== 'admin') {
        return { error: 'Only admins can change global settings' }
    }

    const currency = formData.get('currency') as string
    const language = formData.get('language') as string
    const meta_page_id = (formData.get('meta_page_id') as string) || null

    const { error } = await supabase
        .from('tenants')
        .update({
            currency,
            language,
            meta_page_id: meta_page_id,
            updated_at: new Date().toISOString()
        })
        .eq('id', profile.tenant_id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true }
}
