'use client'

import { useState, useTransition } from 'react'
import { type Lead } from '../actions'
import { updateLeadStatus } from './actions'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, DollarSign } from 'lucide-react'

const columns = [
    { id: 'new', title: 'New', color: 'bg-blue-500', borderColor: 'border-t-blue-500' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500', borderColor: 'border-t-yellow-500' },
    { id: 'qualified', title: 'Qualified', color: 'bg-purple-500', borderColor: 'border-t-purple-500' },
    { id: 'proposal', title: 'Proposal', color: 'bg-orange-500', borderColor: 'border-t-orange-500' },
    { id: 'won', title: 'Won', color: 'bg-green-500', borderColor: 'border-t-green-500' },
    { id: 'lost', title: 'Lost', color: 'bg-red-500', borderColor: 'border-t-red-500' },
]

interface KanbanBoardProps {
    leads: Lead[]
}

export function KanbanBoard({ leads: initialLeads }: KanbanBoardProps) {
    const [leads, setLeads] = useState(initialLeads)
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
    const [isPending, startTransition] = useTransition()

    function getLeadsByStatus(status: string) {
        return leads.filter(lead => lead.status === status)
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value)
    }

    function handleDragStart(e: React.DragEvent, lead: Lead) {
        setDraggedLead(lead)
        e.dataTransfer.effectAllowed = 'move'
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    function handleDrop(e: React.DragEvent, newStatus: string) {
        e.preventDefault()

        if (!draggedLead || draggedLead.status === newStatus) {
            setDraggedLead(null)
            return
        }

        // Optimistic update
        const updatedLeads = leads.map(lead =>
            lead.id === draggedLead.id
                ? { ...lead, status: newStatus as Lead['status'] }
                : lead
        )
        setLeads(updatedLeads)

        // Server update
        startTransition(async () => {
            const result = await updateLeadStatus(draggedLead.id, newStatus)
            if (result.error) {
                // Revert on error
                setLeads(leads)
            }
        })

        setDraggedLead(null)
    }

    function getColumnTotal(status: string) {
        return getLeadsByStatus(status).reduce((sum, lead) => sum + lead.value, 0)
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(column => (
                <div
                    key={column.id}
                    className="flex-shrink-0 w-72"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className={`rounded-t-lg border-t-4 ${column.borderColor} bg-card/60 backdrop-blur-sm p-3 border-x border-border`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                <h3 className="font-semibold">{column.title}</h3>
                                <Badge variant="secondary" className="ml-1">
                                    {getLeadsByStatus(column.id).length}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(getColumnTotal(column.id))}
                        </p>
                    </div>

                    {/* Column Content */}
                    <div className="bg-muted/20 rounded-b-lg border border-t-0 border-border min-h-[500px] p-2 space-y-2">
                        {getLeadsByStatus(column.id).map(lead => (
                            <Card
                                key={lead.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, lead)}
                                className={`bg-card border-border cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all ${isPending && draggedLead?.id === lead.id ? 'opacity-50' : ''
                                    }`}
                            >
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{lead.name}</p>
                                            {lead.source && (
                                                <p className="text-xs text-muted-foreground">{lead.source}</p>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-primary">
                                            {formatCurrency(lead.value)}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {lead.company && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Building2 className="h-3 w-3" />
                                                {lead.company}
                                            </div>
                                        )}
                                        {lead.email && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {lead.email}
                                            </div>
                                        )}
                                        {lead.phone && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                {lead.phone}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {getLeadsByStatus(column.id).length === 0 && (
                            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                Drop leads here
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
