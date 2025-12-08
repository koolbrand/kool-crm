'use client'

import { useState, useTransition } from 'react'
import { Deal, deleteDeal } from './actions'
import { Profile } from '../clients/actions'
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Trash2, MoreHorizontal, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DealForm } from './deal-form'

interface DealsTableProps {
    initialDeals: Deal[]
    clients: Profile[]
    currency: string
}

const STAGES = {
    qualification: { label: 'Cualificación', color: 'bg-blue-500/20 text-blue-400' },
    proposal: { label: 'Propuesta', color: 'bg-yellow-500/20 text-yellow-400' },
    negotiation: { label: 'Negociación', color: 'bg-orange-500/20 text-orange-400' },
    won: { label: 'Ganado', color: 'bg-green-500/20 text-green-400' },
    lost: { label: 'Perdido', color: 'bg-red-500/20 text-red-400' },
}

export function DealsTable({ initialDeals, clients, currency }: DealsTableProps) {
    const router = useRouter()
    // Using simple prop passing for now as server refreshes handles updates
    const deals = initialDeals

    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')

    // Modal State
    const [formOpen, setFormOpen] = useState(false)
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function handleCreate() {
        setEditingDeal(null)
        setFormOpen(true)
    }

    function handleEdit(deal: Deal) {
        setEditingDeal(deal)
        setFormOpen(true)
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta Oportunidad?')) return
        startTransition(async () => {
            await deleteDeal(id)
            router.refresh()
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Buscar Oportunidades..."
                    className="max-w-sm bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="gap-2" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> Nueva Oportunidad
                </Button>
            </div>

            <div className="rounded-md border border-border bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Oportunidad</TableHead>
                            <TableHead>Etapa</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDeals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? 'No se encontraron oportunidades.' : 'No hay Oportunidades encontradas. Empieza creando una.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDeals.map(deal => (
                                <TableRow key={deal.id}>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => handleEdit(deal)}
                                            className="hover:underline hover:text-primary transition-colors text-left font-medium"
                                        >
                                            {deal.title}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={STAGES[deal.stage as keyof typeof STAGES]?.color || 'bg-secondary'}>
                                            {STAGES[deal.stage as keyof typeof STAGES]?.label || deal.stage}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(deal.value)}
                                    </TableCell>
                                    <TableCell>
                                        {deal.profiles ? (
                                            <div className="flex flex-col">
                                                <span>{deal.profiles.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{deal.profiles.email}</span>
                                            </div>
                                        ) : deal.leads ? (
                                            <div className="flex flex-col">
                                                <span>{deal.leads.name}</span>
                                                <span className="text-xs text-muted-foreground">{deal.leads.company || deal.leads.email}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(deal.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(deal.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
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

            <DealForm
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingDeal(null)
                }}
                deal={editingDeal}
                currency={currency}
            />
        </div>
    )
}
