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
        return { error: 'Unauthorized' }
    }

    const content = formData.get('content') as string
    const type = formData.get('type') as ActivityType
    const leadId = formData.get('leadId') as string
    const dealId = formData.get('dealId') as string

    if (!content) {
        return { error: 'Content is required' }
    }

    const { error } = await supabase.from('notes').insert({
        content,
        type: type || 'note',
        lead_id: leadId || null,
        deal_id: dealId || null,
        user_id: profile.id,
        tenant_id: profile.tenant_id
    })

    if (error) {
        console.error('Error creating note:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getNotes(entityType: 'lead' | 'deal', entityId: string): Promise<Note[]> {
    const supabase = await createClient()

    const column = entityType === 'lead' ? 'lead_id' : 'deal_id'

    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            user:user_id (
                full_name,
                email
            )
        `)
        .eq(column, entityId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    // Map the user relation correctly if it comes back as an array or object
    // Supabase join returns user as an object usually if it's a single relation
    return (data as any[]).map(note => ({
        ...note,
        user: note.user // Assuming Supabase returns the joined user data
    })) as Note[]
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
