'use client'

import { useState } from 'react'
import { Deal, updateDealStage } from '../actions'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { Loader2, Phone, Mail } from 'lucide-react'
import { DealForm } from '../deal-form'

interface KanbanBoardProps {
    initialDeals: Deal[]
    currency?: string
}

const STAGES = {
    qualification: { label: 'Cualificación', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
    proposal: { label: 'Propuesta', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' },
    negotiation: { label: 'Negociación', color: 'bg-orange-500/10 border-orange-500/20 text-orange-500' },
    won: { label: 'Ganado', color: 'bg-green-500/10 border-green-500/20 text-green-500' },
    lost: { label: 'Perdido', color: 'bg-red-500/10 border-red-500/20 text-red-500' },
}

export function KanbanBoard({ initialDeals, currency = 'EUR' }: KanbanBoardProps) {
    const router = useRouter()
    const [deals, setDeals] = useState(initialDeals)
    const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
    const [formOpen, setFormOpen] = useState(false)

    // Group deals by stage
    const columns = Object.keys(STAGES).map(stage => ({
        id: stage,
        label: STAGES[stage as keyof typeof STAGES].label,
        color: STAGES[stage as keyof typeof STAGES].color,
        deals: deals.filter(d => d.stage === stage)
    }))

    function handleDragStart(e: React.DragEvent, dealId: string) {
        e.dataTransfer.setData('dealId', dealId)
        setDraggedDealId(dealId)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
    }

    async function handleDrop(e: React.DragEvent, targetStage: string) {
        e.preventDefault()
        const dealId = e.dataTransfer.getData('dealId')

        if (!dealId || isUpdating) return

        const deal = deals.find(d => d.id === dealId)
        if (!deal || deal.stage === targetStage) return

        // Optimistic update
        const originalStage = deal.stage
        setDeals(deals.map(d => d.id === dealId ? { ...d, stage: targetStage as any } : d))
        setIsUpdating(dealId)

        const result = await updateDealStage(dealId, targetStage)

        if (!result.success) {
            // Revert on failure
            setDeals(deals.map(d => d.id === dealId ? { ...d, stage: originalStage } : d))
            alert('Failed to move deal')
        }

        setIsUpdating(null)
        setDraggedDealId(null)
        router.refresh()
    }

    return (
        <div className="flex h-full gap-4 pb-4 min-w-[1000px]">
            {columns.map(column => (
                <div
                    key={column.id}
                    className={cn(
                        "flex-1 flex flex-col rounded-lg border bg-card/30 backdrop-blur-sm transition-colors",
                        column.color
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="p-3 font-semibold text-sm uppercase tracking-wider flex justify-between items-center border-b border-border/50 bg-background/20">
                        {column.label}
                        <Badge variant="secondary" className="bg-background/50">{column.deals.length}</Badge>
                    </div>

                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {column.deals.map(deal => (
                            <Card
                                key={deal.id}
                                draggable={!isUpdating}
                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                className={cn(
                                    "cursor-move hover:shadow-md transition-all border-border/50 bg-card py-0",
                                    isUpdating === deal.id && "opacity-50 pointer-events-none",
                                    draggedDealId === deal.id && "opacity-50 scale-105 shadow-lg ring-2 ring-primary/50"
                                )}
                                onClick={() => {
                                    setEditingDeal(deal)
                                    setFormOpen(true)
                                }}
                            >
                                <div className="p-3 space-y-2">
                                    {/* Name */}
                                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                        {deal.leads?.name || deal.title}
                                    </p>

                                    {/* Contact Info */}
                                    <div className="space-y-0.5 overflow-hidden">
                                        {deal.leads?.phone && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 overflow-hidden">
                                                <Phone className="w-3 h-3 flex-shrink-0 opacity-70" />
                                                <span className="truncate">{deal.leads.phone}</span>
                                            </div>
                                        )}
                                        {deal.leads?.email && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 overflow-hidden">
                                                <Mail className="w-3 h-3 flex-shrink-0 opacity-70" />
                                                <span className="truncate" title={deal.leads.email}>{deal.leads.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Deal / Interest Badge */}
                                    <span className="inline-block text-[10px] font-medium text-primary px-1.5 py-0.5 rounded-sm bg-primary/10 truncate max-w-full">
                                        {deal.title.split(' - ')[1] || deal.title}
                                    </span>

                                    {/* Value */}
                                    <div className="flex items-center justify-end pt-1.5 border-t border-border/30">
                                        <span className="text-xs font-bold text-foreground tabular-nums">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'EUR', maximumFractionDigits: 0 }).format(deal.value)}
                                        </span>
                                        {isUpdating === deal.id && <Loader2 className="h-3 w-3 animate-spin ml-2 text-muted-foreground" />}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <DealForm
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingDeal(null) // Reset on close
                }}
                deal={editingDeal}
                currency={currency}
            />
        </div>
    )
}
