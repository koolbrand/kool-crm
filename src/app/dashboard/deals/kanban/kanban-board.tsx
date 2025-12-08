'use client'

import { useState, useRef } from 'react'
import { Deal, updateDealStage } from '../actions'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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
                                    "cursor-move hover:shadow-md transition-all border-border/50 bg-card/80",
                                    isUpdating === deal.id && "opacity-50 pointer-events-none",
                                    draggedDealId === deal.id && "opacity-50 rotate-2"
                                )}
                                onClick={() => {
                                    setEditingDeal(deal)
                                    setFormOpen(true)
                                }}
                            >
                                <CardHeader className="p-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-sm font-medium leading-none mb-1 truncate">
                                                {deal.title}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {deal.profiles?.full_name || deal.leads?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        {isUpdating === deal.id && <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />}
                                    </div>
                                    <div className="text-xs font-semibold text-foreground mt-3">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD', maximumFractionDigits: 0 }).format(deal.value)}
                                    </div>
                                </CardHeader>
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
