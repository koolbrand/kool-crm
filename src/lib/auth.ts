import { createClient } from '@/lib/supabase/server'

export type Profile = {
    id: string
    email: string | null
    full_name: string | null
    company_name: string | null
    role: 'admin' | 'client'
    api_key: string
    tenant_id: string | null
    created_at: string
    updated_at: string
}

export async function getProfile(): Promise<(Profile & { tenant_name?: string | null }) | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            tenants (
                name
            )
        `)
        .eq('id', user.id)
        .single()

    if (!profile) return null

    // Return profile with tenant_name
    return {
        ...profile,
        tenant_name: profile.tenants?.name || null
    }
}

export async function isAdmin(): Promise<boolean> {
    const profile = await getProfile()
    return profile?.role === 'admin'
}

export async function getProfileByApiKey(apiKey: string): Promise<Profile | null> {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('api_key', apiKey)
        .single()

    return profile
}

export async function regenerateApiKey(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Generate new UUID for API key
    const newApiKey = crypto.randomUUID()

    const { error } = await supabase
        .from('profiles')
        .update({ api_key: newApiKey, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        console.error('Error regenerating API key:', error)
        return null
    }

    return newApiKey
}
