'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Quote, createQuote } from './actions'
import { Lead } from '../leads/actions'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface QuotesTableProps {
    quotes: Quote[]
    leads: Lead[]
}

export function QuotesTable({ quotes, leads }: QuotesTableProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [selectedLeadId, setSelectedLeadId] = useState<string>('')
    const [isPending, startTransition] = useTransition()

    const filteredQuotes = quotes.filter(q =>
        q.leads?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.includes(searchQuery)
    )

    async function handleCreateQuote() {
        if (!selectedLeadId) return

        startTransition(async () => {
            const result = await createQuote(selectedLeadId)
            if (result.success && result.quoteId) {
                setCreateModalOpen(false)
                router.push(`/dashboard/quotes/${result.quoteId}`)
            } else {
                alert('Error creating quote')
            }
        })
    }

    const statusColors = {
        draft: 'bg-gray-500/10 text-gray-500',
        sent: 'bg-blue-500/10 text-blue-500',
        accepted: 'bg-green-500/10 text-green-500',
        rejected: 'bg-red-500/10 text-red-500',
        expired: 'bg-orange-500/10 text-orange-500',
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search quotes by lead..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Quote
                </Button>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Number</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Lead</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No quotes found. Create your first quote!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-mono text-xs">
                                        {quote.id.substring(0, 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {quote.leads?.name || 'Unknown Lead'}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.total_amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${statusColors[quote.status]} capitalize`}>
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/dashboard/quotes/${quote.id}`}>
                                                <FileText className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Quote</DialogTitle>
                        <DialogDescription>Select a lead to create a quote for.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a lead..." />
                            </SelectTrigger>
                            <SelectContent>
                                {leads.map(lead => (
                                    <SelectItem key={lead.id} value={lead.id}>
                                        {lead.name} {lead.company ? `(${lead.company})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateQuote} disabled={!selectedLeadId || isPending}>
                            {isPending ? 'Creating...' : 'Create Draft'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
