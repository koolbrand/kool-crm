'use client'

import { Lead } from '@/app/dashboard/leads/actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, User, Globe, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface LeadProfileProps {
    lead: Lead
}

export function LeadProfile({ lead }: LeadProfileProps) {
    const statusColors = {
        new: 'bg-blue-500/20 text-blue-500',
        contacted: 'bg-yellow-500/20 text-yellow-500',
        qualified: 'bg-purple-500/20 text-purple-500',
        proposal: 'bg-orange-500/20 text-orange-500',
        won: 'bg-green-500/20 text-green-500',
        lost: 'bg-red-500/20 text-red-500',
    } as const

    return (
        <Card className="bg-card border-border h-fit sticky top-6">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">{lead.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            <span>Lead</span>
                        </div>
                    </div>
                    <Badge className={`${statusColors[lead.status] || 'bg-secondary'} border-0 capitalize`}>
                        {lead.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Estimated Value</p>
                            <p className="font-bold text-lg">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.value)}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                        {lead.email && (
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">{lead.email}</a>
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${lead.phone}`} className="hover:text-primary transition-colors">{lead.phone}</a>
                            </div>
                        )}
                        {lead.company && (
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{lead.company}</span>
                            </div>
                        )}
                        {lead.source && (
                            <div className="flex items-center gap-3 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">Source: {lead.source}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Added {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions could go here (Edit, Convert, Delete) */}
            </CardContent>
        </Card>
    )
}
