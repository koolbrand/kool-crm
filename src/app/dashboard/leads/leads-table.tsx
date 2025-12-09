'use client'

import { useState, useTransition } from 'react'
import { type Lead, deleteLead } from './actions'
import { LeadForm } from './lead-form'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Building2, Plus, Search, ArrowRightLeft, Instagram, Facebook, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    new: { label: 'Nuevo', variant: 'default', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    contacted: { label: 'Contactado', variant: 'secondary', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    qualified: { label: 'Cualificado', variant: 'secondary', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    proposal: { label: 'Propuesta', variant: 'secondary', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    negotiation: { label: 'Negociación', variant: 'secondary', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    won: { label: 'Ganado', variant: 'default', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    lost: { label: 'Perdido', variant: 'destructive', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

interface LeadsTableProps {
    leads: Lead[]
    showOwner?: boolean
    clients?: { id: string; company_name: string | null; email: string | null }[]
    users?: { id: string; email: string; tenant_id: string }[]
    currency: string
}

export function LeadsTable({ leads: initialLeads, showOwner = false, clients = [], users = [], currency }: LeadsTableProps) {
    // const [leads] = useState(initialLeads) // Removed to allow server updates
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')
    const [formOpen, setFormOpen] = useState(false)
    const [editingLead, setEditingLead] = useState<Lead | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const filteredLeads = initialLeads.filter((lead) => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

        // Date filtering
        let matchesDate = true
        if (dateFrom) {
            const leadDate = new Date(lead.created_at)
            const fromDate = new Date(dateFrom)
            fromDate.setHours(0, 0, 0, 0)
            matchesDate = matchesDate && leadDate >= fromDate
        }
        if (dateTo) {
            const leadDate = new Date(lead.created_at)
            const toDate = new Date(dateTo)
            toDate.setHours(23, 59, 59, 999)
            matchesDate = matchesDate && leadDate <= toDate
        }

        return matchesSearch && matchesStatus && matchesDate
    })

    function handleEdit(lead: Lead) {
        setEditingLead(lead)
        setFormOpen(true)
    }

    function handleDelete(id: string) {
        if (confirm('¿Estás seguro de que deseas eliminar este lead?')) {
            startTransition(async () => {
                await deleteLead(id)
            })
        }
    }

    function handleFormClose(open: boolean) {
        setFormOpen(open)
        if (!open) {
            setEditingLead(null)
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
        }).format(value)
    }

    function formatDate(dateString: string) {
        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateString))
    }

    function exportToCSV() {
        const headers = ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Valor', 'Estado', 'Fuente', 'Deal', 'Fecha']
        const rows = filteredLeads.map(lead => [
            lead.name,
            lead.email || '',
            lead.phone || '',
            lead.company || '',
            lead.value?.toString() || '0',
            statusConfig[lead.status]?.label || lead.status,
            lead.source || '',
            lead.deal || '',
            formatDate(lead.created_at)
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] bg-background/50">
                            <SelectValue placeholder="Filtrar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            {Object.entries(statusConfig).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" onClick={exportToCSV} disabled={filteredLeads.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                        </Button>
                        <Button onClick={() => setFormOpen(true)} className="shadow-[0_0_20px_-5px_var(--color-primary)]">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Lead
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-muted-foreground">Nombre</TableHead>
                            {showOwner && (
                                <TableHead className="text-muted-foreground">Cliente / Propietario</TableHead>
                            )}
                            <TableHead className="text-muted-foreground hidden md:table-cell">Contacto</TableHead>
                            <TableHead className="text-muted-foreground">Deal</TableHead>
                            <TableHead className="text-muted-foreground">Etapa</TableHead>
                            <TableHead className="text-muted-foreground hidden lg:table-cell">Empresa</TableHead>
                            <TableHead className="text-muted-foreground hidden sm:table-cell">Creado</TableHead>
                            <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showOwner ? 8 : 7} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? 'No se encontraron leads con esa búsqueda.' : 'No hay leads aún. ¡Añade el primero!'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.id} className="border-border hover:bg-muted/30">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-sm">
                                                {lead.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => handleEdit(lead)}
                                                    className="font-medium text-foreground hover:underline hover:text-primary transition-colors text-left"
                                                >
                                                    {lead.name}
                                                </button>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {lead.source?.toLowerCase().includes('instagram') ? (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-pink-500/50 bg-pink-500/10 text-pink-500 gap-1">
                                                            <Instagram className="w-3 h-3" />
                                                            Instagram
                                                        </Badge>
                                                    ) : lead.source?.toLowerCase().includes('facebook') ? (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-blue-600/50 bg-blue-600/10 text-blue-600 gap-1">
                                                            <Facebook className="w-3 h-3" />
                                                            Facebook
                                                        </Badge>
                                                    ) : lead.source?.toLowerCase().includes('meta') ? (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-blue-500/50 bg-blue-500/10 text-blue-500 gap-1">
                                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                            Meta
                                                        </Badge>
                                                    ) : (
                                                        <SourceBadge source={lead.source} />
                                                    )}

                                                    {lead.metadata?.campaign_name && (
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={lead.metadata.campaign_name}>
                                                            {lead.metadata.campaign_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {showOwner && (
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="font-medium text-foreground">{lead.owner_company || 'Sin Empresa'}</p>
                                                {lead.owner_email && <p className="text-xs text-muted-foreground">{lead.owner_email}</p>}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="hidden md:table-cell">
                                        <div className="space-y-1">
                                            {lead.email && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {lead.email}
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {lead.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{formatCurrency(lead.value)}</span>
                                            {lead.deal && (
                                                <span className="text-xs text-muted-foreground">{lead.deal}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={statusConfig[lead.status]?.variant || 'secondary'}
                                            className={`${statusConfig[lead.status]?.className || ''} border`}
                                        >
                                            {statusConfig[lead.status]?.label || lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {lead.company && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Building2 className="h-3 w-3" />
                                                {lead.company}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                                        {formatDate(lead.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card border-border">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Stats Footer */}
            <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                <span>
                    {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                    {searchQuery && ` encontrados`}
                </span>
                <span>
                    Total Pipeline: {formatCurrency(filteredLeads.reduce((sum, lead) => sum + lead.value, 0))}
                </span>
            </div>

            {/* Lead Form Modal */}
            <LeadForm
                open={formOpen}
                onOpenChange={handleFormClose}
                lead={editingLead}
                clients={clients}
                users={users}
                currency={currency}
            />
        </div>
    )
}

function SourceBadge({ source }: { source: string | null }) {
    if (!source) return null

    // Simple check to avoid complex logic issues or hydration mismatches
    const s = source.toLowerCase()
    const isTikTok = s.includes('tiktok') || s.includes('tik tok')

    if (isTikTok) {
        return (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 gap-1 h-5" style={{ borderColor: 'rgba(0,0,0,0.2)', backgroundColor: 'rgba(0,0,0,0.05)', color: 'inherit' }}>
                {/* Standard SVG without 'tiktok' in class names or IDs */}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12-1.09-1.07-1.57-2.6-1.78-4.08h-4.04v13.51c0 2.27-1.66 4.14-3.92 4.14-2.26 0-3.92-1.87-3.92-4.14 0-2.27 1.66-4.14 3.92-4.14.7.01 1.39.21 2.01.57l-.02-4.12c-3.86.07-7.05 3.3-6.98 7.21.07 3.91 3.3 7.05 7.21 6.98 3.91-.07 7.05-3.3 6.98-7.21V3.91c0-.05-.01-.09-.01-.14-.05-.8-.32-1.57-.75-2.24-.65-1.02-1.7-1.58-2.77-1.51z" /></svg>
                <span>Tik-Tok</span>
            </div>
        )
    }

    return (
        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 text-muted-foreground">
            {source}
        </Badge>
    )
}
