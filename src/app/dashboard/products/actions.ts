'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Product = {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    active: boolean
    created_at: string
}

export async function getProducts() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

export async function createProduct(formData: FormData) {
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

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const currency = formData.get('currency') as string || 'USD'

    if (!name) return { error: 'Name is required' }

    const { error } = await supabase
        .from('products')
        .insert({
            tenant_id: profile.tenant_id,
            name,
            description,
            price,
            currency
        })

    if (error) {
        console.error('Error creating product:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    return { success: true }
}

export async function updateProduct(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const currency = formData.get('currency') as string
    const active = formData.get('active') !== null

    if (!id || !name) return { error: 'ID and Name are required' }

    const { error } = await supabase
        .from('products')
        .update({
            name,
            description,
            price,
            currency,
            active,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating product:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    return { success: true }
}
