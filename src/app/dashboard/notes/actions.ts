'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type ActivityType = 'note' | 'call' | 'email' | 'meeting'

export interface Note {
    id: string
    content: string
    type: ActivityType
    created_at: string
    user_id: string
    tenant_id: string
    lead_id?: string
    deal_id?: string
    user?: {
        full_name: string
        email: string
    }
}

export async function createNote(formData: FormData) {
    const supabase = await createClient()
    const profile = await getProfile()

    if (!profile) {
        console.error('createNote: No profile found')
        return { error: 'Unauthorized' }
    }

    const content = formData.get('content') as string
    const type = formData.get('type') as ActivityType
    const leadId = formData.get('leadId') as string

    console.log('createNote: Attempting insert', { content, type, leadId, userId: profile.id, tenantId: profile.tenant_id })

    if (!content) {
        return { error: 'Content is required' }
    }

    if (!profile.tenant_id) {
        console.error('createNote: Profile has no tenant_id')
        return { error: 'User has no tenant assigned' }
    }

    const insertData = {
        content,
        type: type || 'note',
        lead_id: leadId,
        user_id: profile.id,
        tenant_id: profile.tenant_id
    }

    console.log('createNote: Insert data:', insertData)

    const { data, error } = await supabase.from('activities').insert(insertData).select()

    if (error) {
        console.error('createNote: Error:', error)
        return { error: error.message }
    }

    console.log('createNote: Success, inserted:', data)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/leads')
    return { success: true }
}

export async function getNotes(entityType: 'lead' | 'deal', entityId: string): Promise<Note[]> {
    const supabase = await createClient()

    const column = entityType === 'lead' ? 'lead_id' : 'deal_id'

    // First get activities
    const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq(column, entityId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching activities:', error)
        return []
    }

    if (!activities || activities.length === 0) {
        return []
    }

    // Get user profiles for the activities
    const userIds = [...new Set(activities.map(a => a.user_id))]
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    return activities.map(activity => ({
        ...activity,
        user: profileMap.get(activity.user_id) || { full_name: 'Usuario', email: '' }
    })) as Note[]
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/leads')
    return { success: true }
}
