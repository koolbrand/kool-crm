'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'

export type AnalyticsData = {
    totalRevenue: number
    conversionRate: number
    avgTicket: number
    wonDealsCount: number
    revenueByMonth: { name: string; value: number }[]
    funnelData: { name: string; value: number }[]
    leadSourceData: { name: string; value: number }[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    const supabase = await createClient()
    const profile = await getProfile()

    if (!profile) throw new Error('Not authenticated')

    // Base query builder
    let query = supabase.from('deals').select('*')

    // Add tenant filter if needed (assuming RLS handles strict tenant isolation, but good to be explicit if tenant_id is available)
    if (profile.tenant_id) {
        query = query.eq('tenant_id', profile.tenant_id)
    } else {
        // Fallback for non-tenant users (e.g. personal usage if any) or admin view override
        // For now rely on RLS
    }

    const { data: deals, error: dealsError } = await query

    if (dealsError) throw new Error(dealsError.message)

    // Calculate KPIs
    const wonDeals = deals.filter(d => d.stage === 'won')
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0)
    const wonDealsCount = wonDeals.length
    const totalClosed = deals.filter(d => ['won', 'lost'].includes(d.stage)).length

    const conversionRate = totalClosed > 0
        ? Math.round((wonDealsCount / totalClosed) * 100)
        : 0

    const avgTicket = wonDealsCount > 0
        ? Math.round(totalRevenue / wonDealsCount)
        : 0

    // Chart: Revenue by Month (Last 6 months)
    const months = new Map<string, number>()
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = d.toLocaleString('es-ES', { month: 'short' })
        months.set(key, 0)
    }

    wonDeals.forEach(deal => {
        if (!deal.created_at) return
        const date = new Date(deal.created_at)
        // Only count if within last 6 months approx (simplification)
        const key = date.toLocaleString('es-ES', { month: 'short' })
        if (months.has(key)) {
            months.set(key, (months.get(key) || 0) + (deal.value || 0))
        }
    })

    const revenueByMonth = Array.from(months.entries()).map(([name, value]) => ({ name, value }))

    // Chart: Funnel
    const stages = ['qualification', 'proposal', 'negotiation', 'won', 'lost']
    // Translation map for display
    const stageLabels: Record<string, string> = {
        'qualification': 'Cualificación',
        'proposal': 'Propuesta',
        'negotiation': 'Negociación',
        'won': 'Ganado',
        'lost': 'Perdido'
    }

    const funnelData = stages.map(stage => ({
        name: stageLabels[stage] || stage,
        value: deals.filter(d => d.stage === stage).length
    }))

    // Chart: Lead Sources (Need to fetch leads linked to deals or just raw leads?)
    // Let's fetch ALL leads for source analysis
    const { data: leads } = await supabase.from('leads').select('source')

    const sourceCounts = new Map<string, number>()
    leads?.forEach(lead => {
        const source = lead.source || 'Desconocido'
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
    })

    // Top 5 sources
    const leadSourceData = Array.from(sourceCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    return {
        totalRevenue,
        conversionRate,
        avgTicket,
        wonDealsCount,
        revenueByMonth,
        funnelData,
        leadSourceData
    }
}
