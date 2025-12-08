'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeadStatus(leadId: string, newStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('leads')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead status:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/leads/kanban')
    return { success: true }
}
