'use client'

import { useState, useTransition, useEffect } from 'react'
import { Tenant, createTenant, updateTenant, deleteTenant } from './actions'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    MoreHorizontal,
    Plus,
    Building2,
    ShieldCheck,
    CreditCard,
    Loader2
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const STATUS_LABELS: Record<string, string> = {
    active: 'Activo',
    trial: 'Prueba',
    past_due: 'Vencido',
    cancelled: 'Cancelado'
}

export function CompaniesTable({ tenants: initialTenants }: { tenants: Tenant[] }) {
    const [tenants, setTenants] = useState(initialTenants)
    const [searchQuery, setSearchQuery] = useState('')
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        setTenants(initialTenants)
    }, [initialTenants])

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function handleCreate(formData: FormData) {
        startTransition(async () => {
            const result = await createTenant(formData)
            if (result.success) {
                setAddModalOpen(false)
            } else {
                alert('Error: ' + result.error)
            }
        })
    }

    function handleUpdate(formData: FormData) {
        startTransition(async () => {
            const result = await updateTenant(formData)
            if (result.success) {
                setEditModalOpen(false)
                setEditingTenant(null)
            } else {
                alert('Error: ' + result.error)
            }
        })
    }

    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        setTenants(initialTenants)

        // Polling logic: Only keep IDs in deletingIds if they still exist in initialTenants
        const currentIds = new Set(initialTenants.map(t => t.id))
        const stillDeletingIds = new Set(
            Array.from(deletingIds).filter(id => currentIds.has(id))
        )

        // Only update state if the set of IDs has actually changed
        if (stillDeletingIds.size !== deletingIds.size) {
            setDeletingIds(stillDeletingIds)
        }

        // If we still have items marked for deletion that are present, keep polling
        if (stillDeletingIds.size > 0) {
            const timer = setTimeout(() => {
                router.refresh()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [initialTenants, deletingIds])

    function handleEdit(tenant: Tenant) {
        setEditingTenant(tenant)
        setEditModalOpen(true)
    }

    function handleDelete(id: string) {
        if (!confirm('¿Estás seguro? Esta empresa debe tener 0 usuarios para poder eliminarse.')) return

        setDeletingIds(prev => new Set(prev).add(id))

        startTransition(async () => {
            const result = await deleteTenant(id)
            if (!result.success) {
                alert('Error: ' + result.error)
                setDeletingIds(prev => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
            } else {
                router.refresh()
            }
        })
    }

    function openEdit(tenant: Tenant) {
        setEditingTenant(tenant)
        setEditModalOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'trial': return 'bg-blue-100 text-blue-800'
            case 'past_due': return 'bg-yellow-100 text-yellow-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Total Empresas: {tenants.length}</span>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Buscar empresas..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-[250px]"
                    />
                    <Button onClick={() => setAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Empresa
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No se encontraron empresas
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTenants.map((tenant) => (
                                <TableRow key={tenant.id} className={deletingIds.has(tenant.id) ? "opacity-50 pointer-events-none bg-muted/50" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {deletingIds.has(tenant.id) ? (
                                                <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                            )}
                                            {tenant.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(tenant.status)}>
                                            {STATUS_LABELS[tenant.status] || tenant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {tenant.plan === 'enterprise' ? <ShieldCheck className="h-4 w-4 text-purple-500" /> : <CreditCard className="h-4 w-4 text-gray-400" />}
                                            <span className="capitalize">{tenant.plan}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(tenant.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(tenant)}>
                                                    Editar Detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(tenant.id)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    Eliminar Empresa
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

            {/* Create Modal */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Empresa</DialogTitle>
                        <DialogDescription>Crear un nuevo espacio de trabajo.</DialogDescription>
                    </DialogHeader>
                    <form action={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre de la Empresa</Label>
                            <Input name="name" required placeholder="Acme Corp" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select name="status" defaultValue="active">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="trial">Prueba</SelectItem>
                                        <SelectItem value="past_due">Vencido</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Plan</Label>
                                <Select name="plan" defaultValue="starter">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="starter">Starter</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Meta Page ID (Lead Ads)</Label>
                                <Input name="meta_page_id" placeholder="ID de la página de Facebook" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>Crear Empresa</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Empresa</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-4">
                        <input type="hidden" name="id" value={editingTenant?.id || ''} />
                        <div className="space-y-2">
                            <Label>Nombre de la Empresa</Label>
                            <Input name="name" defaultValue={editingTenant?.name} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select name="status" defaultValue={editingTenant?.status}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="trial">Prueba</SelectItem>
                                        <SelectItem value="past_due">Vencido</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Plan</Label>
                                <Select name="plan" defaultValue={editingTenant?.plan}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="starter">Starter</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Meta Page ID (Lead Ads)</Label>
                                <Input
                                    name="meta_page_id"
                                    defaultValue={editingTenant?.meta_page_id || ''}
                                    placeholder="ID de la página de Facebook"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
