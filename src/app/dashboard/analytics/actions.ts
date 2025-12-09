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

// Pipeline statuses (leads that are in the sales funnel)
const PIPELINE_STATUSES = ['qualified', 'proposal', 'negotiation', 'won', 'lost']

export async function getAnalyticsData(): Promise<AnalyticsData> {
    const supabase = await createClient()
    const profile = await getProfile()

    if (!profile) throw new Error('Not authenticated')

    // Build query for leads - RLS will filter by tenant automatically for clients
    // But we explicitly filter for clarity and for admins who might want all data
    let query = supabase.from('leads').select('*')

    // If client (not admin), RLS will filter by tenant_id
    // For admins without a specific tenant filter, we get all leads
    // This relies on the RLS policies we set up

    const { data: leads, error: leadsError } = await query

    if (leadsError) throw new Error(leadsError.message)

    // Filter to pipeline leads only for funnel calculations
    const pipelineLeads = leads.filter(l => PIPELINE_STATUSES.includes(l.status))

    // Calculate KPIs
    const wonLeads = leads.filter(l => l.status === 'won')
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0)
    const wonDealsCount = wonLeads.length
    const totalClosed = leads.filter(l => ['won', 'lost'].includes(l.status)).length

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

    wonLeads.forEach(lead => {
        if (!lead.created_at) return
        const date = new Date(lead.created_at)
        const key = date.toLocaleString('es-ES', { month: 'short' })
        if (months.has(key)) {
            months.set(key, (months.get(key) || 0) + (lead.value || 0))
        }
    })

    const revenueByMonth = Array.from(months.entries()).map(([name, value]) => ({ name, value }))

    // Chart: Funnel - using lead statuses
    const stages = ['qualified', 'proposal', 'negotiation', 'won', 'lost']
    const stageLabels: Record<string, string> = {
        'qualified': 'Cualificación',
        'proposal': 'Propuesta',
        'negotiation': 'Negociación',
        'won': 'Ganado',
        'lost': 'Perdido'
    }

    const funnelData = stages.map(stage => ({
        name: stageLabels[stage] || stage,
        value: leads.filter(l => l.status === stage).length
    }))

    // Chart: Lead Sources - from same leads data (already filtered by RLS)
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

