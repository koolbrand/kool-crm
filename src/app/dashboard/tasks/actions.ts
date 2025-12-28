'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Task = {
    id: string
    title: string
    description: string | null
    due_date: string | null
    type: 'call' | 'email' | 'meeting' | 'todo'
    status: 'pending' | 'completed'
    priority: 'low' | 'medium' | 'high'
    user_id: string
    tenant_id: string
    lead_id: string | null
    deal_id: string | null
    created_at: string
    // Joined data
    lead?: { name: string; phone?: string | null; email?: string | null } | null
    deal?: { title: string } | null
}

export async function getTasks(): Promise<Task[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch tasks for the user (or tenant? For now, personal dashboard = user tasks)
    // Actually, "My Day" implies user's tasks.
    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            lead:leads(name, phone, email),
            deal:deals(title)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return (data || []) as unknown as Task[] // Supabase types inference helper needed usually, but casting for speed
}

export async function createTask(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Get tenant_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { error: 'No tenant found' }

    const title = formData.get('title') as string
    const dueDate = formData.get('due_date') as string // YYYY-MM-DD
    const type = formData.get('type') as string || 'todo'
    const leadId = formData.get('lead_id') as string || null
    const dealId = formData.get('deal_id') as string || null

    if (!title) return { error: 'Title is required' }

    const { error } = await supabase
        .from('tasks')
        .insert({
            title,
            due_date: dueDate || null,
            type,
            user_id: user.id,
            tenant_id: profile.tenant_id,
            lead_id: leadId,
            deal_id: dealId,
            status: 'pending'
        })

    if (error) {
        console.error('Error creating task:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/deals')

    if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
    if (dealId) revalidatePath(`/dashboard/deals/${dealId}`)

    return { success: true }
}

export async function toggleTaskStatus(id: string, currentStatus: 'pending' | 'completed') {
    const supabase = await createClient()
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'

    // We need to fetch the task to know what to revalidate
    const { data: task } = await supabase.from('tasks').select('lead_id, deal_id').eq('id', id).single()

    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/deals')

    if (task) {
        if (task.lead_id) revalidatePath(`/dashboard/leads/${task.lead_id}`)
        if (task.deal_id) revalidatePath(`/dashboard/deals/${task.deal_id}`)
    }
    return { success: true }
}

export async function deleteTask(id: string) {
    const supabase = await createClient()

    // Fetch context before deletion
    const { data: task } = await supabase.from('tasks').select('lead_id, deal_id').eq('id', id).single()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/deals')

    if (task) {
        if (task.lead_id) revalidatePath(`/dashboard/leads/${task.lead_id}`)
        if (task.deal_id) revalidatePath(`/dashboard/deals/${task.deal_id}`)
    }
    return { success: true }
}
