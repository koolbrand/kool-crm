'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Quote = {
    id: string
    lead_id: string
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
    total_amount: number
    valid_until: string | null
    created_at: string
    leads?: {
        name: string
        email: string
    }
}

export type QuoteItem = {
    id: string
    quote_id: string
    product_id: string | null
    description: string
    quantity: number
    unit_price: number
    total: number
}

export async function getQuotes() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('quotes')
        .select(`
            *,
            leads (
                name,
                email
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching quotes:', error)
        return []
    }

    // Explicitly cast or map to ensure type safety if needed, 
    // but Typescript might infer 'leads' as array or object depending on relation.
    // It's usually object for fkey.
    return data as Quote[]
}

export async function createQuote(leadId: string) {
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

    const { data, error } = await supabase
        .from('quotes')
        .insert({
            tenant_id: profile.tenant_id,
            lead_id: leadId,
            status: 'draft',
            total_amount: 0,
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days default
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating quote:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/quotes')
    return { success: true, quoteId: data.id }
}

export async function getQuoteDetails(id: string) {
    const supabase = await createClient()

    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
            *,
            leads (
                name,
                email,
                company
            )
        `)
        .eq('id', id)
        .single()

    if (quoteError) return { error: quoteError.message }

    const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', id)
        .order('created_at')

    if (itemsError) return { error: itemsError.message }

    return { quote: quote as Quote, items: items as QuoteItem[] }
}

export async function addQuoteItem(quoteId: string, productId: string | null, description: string, quantity: number, unitPrice: number) {
    const supabase = await createClient()

    // Calculate total
    const total = quantity * unitPrice

    const { error } = await supabase
        .from('quote_items')
        .insert({
            quote_id: quoteId,
            product_id: productId === 'custom' ? null : productId,
            description,
            quantity,
            unit_price: unitPrice,
            total
        })

    if (error) return { error: error.message }

    await calculateQuoteTotal(quoteId)
    revalidatePath(`/dashboard/quotes/${quoteId}`)
    return { success: true }
}

export async function deleteQuoteItem(itemId: string, quoteId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', itemId)

    if (error) return { error: error.message }

    await calculateQuoteTotal(quoteId)
    revalidatePath(`/dashboard/quotes/${quoteId}`)
    return { success: true }
}

async function calculateQuoteTotal(quoteId: string) {
    const supabase = await createClient()

    // Sum items
    const { data, error } = await supabase
        .from('quote_items')
        .select('total')
        .eq('quote_id', quoteId)

    if (error) return

    const total = data.reduce((sum, item) => sum + (item.total || 0), 0)

    await supabase
        .from('quotes')
        .update({ total_amount: total })
        .eq('id', quoteId)
}

export async function updateQuote(id: string, status: Quote['status'], validUntil: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quotes')
        .update({
            status,
            valid_until: validUntil,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/quotes/${id}`)
    revalidatePath('/dashboard/quotes')
    return { success: true }
}
