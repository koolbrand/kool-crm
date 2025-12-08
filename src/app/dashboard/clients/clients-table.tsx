'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type Profile } from './actions'
import { type Tenant } from '../companies/actions'
import { updateClientRole, updateClientPassword, deleteClient, createClientUser, updateClient } from './actions'
import { Button } from "@/components/ui/button"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Shield, User, Copy, Check, Key, Trash2, UserPlus, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ClientsTableProps {
    clients: Profile[]
    tenants: Tenant[]
}

export function ClientsTable({ clients: initialClients, tenants }: ClientsTableProps) {
    const router = useRouter()
    const [clients, setClients] = useState(initialClients)
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Add user modal
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [addError, setAddError] = useState<string | null>(null)

    // Password modal
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Profile | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Profile | null>(null)

    // API Modal
    const [apiModalOpen, setApiModalOpen] = useState(false)
    const [viewingApiKey, setViewingApiKey] = useState('')

    function openApiModal(key: string) {
        setViewingApiKey(key)
        setApiModalOpen(true)
    }
    const [editError, setEditError] = useState<string | null>(null)

    const filteredClients = clients.filter((client) =>
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.tenants?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function handleRoleChange(clientId: string, newRole: 'admin' | 'client') {
        startTransition(async () => {
            const result = await updateClientRole(clientId, newRole)
            if (result.success) {
                setClients(clients.map(c =>
                    c.id === clientId ? { ...c, role: newRole } : c
                ))
            }
        })
    }

    async function handleAddUser(formData: FormData) {
        setAddError(null)
        startTransition(async () => {
            const result = await createClientUser(formData)
            if (result.error) {
                setAddError(result.error)
            } else {
                setAddModalOpen(false)
                window.location.reload()
            }
        })
    }

    function openPasswordModal(client: Profile) {
        setSelectedClient(client)
        setNewPassword('')
        setPasswordError(null)
        setPasswordSuccess(false)
        setPasswordModalOpen(true)
    }

    async function handlePasswordChange() {
        if (!selectedClient) return
        setPasswordError(null)
        setPasswordSuccess(false)

        startTransition(async () => {
            const result = await updateClientPassword(selectedClient.id, newPassword)
            if (result.error) {
                setPasswordError(result.error)
            } else {
                setPasswordSuccess(true)
                setTimeout(() => setPasswordModalOpen(false), 1500)
            }
        })
    }

    function openEditModal(client: Profile) {
        setEditingClient(client)
        setEditError(null)
        setEditModalOpen(true)
    }

    async function handleEditClient(formData: FormData) {
        if (!editingClient) return
        setEditError(null)

        startTransition(async () => {
            const result = await updateClient(formData)
            if (result.error) {
                setEditError(result.error)
            } else {
                setClients(prev => prev.map(c =>
                    c.id === editingClient.id
                        ? {
                            ...c,
                            email: formData.get('email') as string || c.email,
                            full_name: formData.get('full_name') as string || c.full_name,
                            tenant_id: formData.get('tenant_id') as string || c.tenant_id,
                            tenants: tenants.find(t => t.id === formData.get('tenant_id')) || null,
                        }
                        : c
                ))
                setEditModalOpen(false)
                router.refresh()
            }
        })
    }

    async function handleDeleteClient(clientId: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esto eliminará todos sus leads permanentemente.')) return

        startTransition(async () => {
            try {
                const result = await deleteClient(clientId)

                if (result.success) {
                    setClients(prev => prev.filter(c => c.id !== clientId))
                    router.refresh()
                } else {
                    alert('Error: ' + (result.error || 'Unknown error'))
                }
            } catch (err) {
                console.error('Delete exception:', err)
                alert('Error deleting user')
            }
        })
    }

    function copyApiKey(apiKey: string, clientId: string) {
        navigator.clipboard.writeText(apiKey)
        setCopiedId(clientId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    function formatDate(dateString: string) {
        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateString))
    }

    return (
        <div className="space-y-4">
            {/* Search + Add button */}
            <div className="flex gap-4 justify-between">
                <Input
                    placeholder="Buscar usuarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm bg-background/50"
                />
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-9 px-4 flex items-center">
                        {clients.length} usuarios
                    </Badge>
                    <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Añadir Usuario
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-muted-foreground">Usuario</TableHead>
                            <TableHead className="text-muted-foreground">Empresa</TableHead>
                            <TableHead className="text-muted-foreground">Rol</TableHead>
                            <TableHead className="text-muted-foreground">Clave API</TableHead>
                            <TableHead className="text-muted-foreground">Fecha</TableHead>
                            <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id} className="border-border hover:bg-muted/30">
                                    <TableCell className="font-medium">
                                        <div>{client.full_name || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">{client.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {client.tenants ? (
                                            <div className="flex flex-col">
                                                <span>{client.tenants.name}</span>
                                                {/* Optional status badge could go here */}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-xs">Sin Empresa</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={client.role === 'admin'
                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                        }>
                                            {client.role === 'admin' ? (
                                                <><Shield className="h-3 w-3 mr-1" /> Admin</>
                                            ) : (
                                                <><User className="h-3 w-3 mr-1" /> Cliente</>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-background/50 px-2 py-1 rounded border border-border max-w-[120px] truncate">
                                                {client.api_key?.substring(0, 8) || 'Sin Clave'}...
                                            </code>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() => client.api_key && copyApiKey(client.api_key, client.id)}
                                            >
                                                {copiedId === client.id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(client.created_at)}
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
                                                <DropdownMenuItem onClick={() => openEditModal(client)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar Usuario
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    if (client.api_key) openApiModal(client.api_key!)
                                                }} disabled={!client.api_key}>
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Ver Clave API
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openPasswordModal(client)}>
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Cambiar Contraseña
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Rol</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(client.id, 'admin')}
                                                    disabled={client.role === 'admin'}
                                                >
                                                    <Shield className="h-4 w-4 mr-2 text-purple-400" />
                                                    Hacer Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(client.id, 'client')}
                                                    disabled={client.role === 'client'}
                                                >
                                                    <User className="h-4 w-4 mr-2 text-blue-400" />
                                                    Hacer Cliente
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar Usuario
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

            {/* Add Client Modal */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Crear una nueva cuenta de usuario.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleAddUser} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" required className="bg-background/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña *</Label>
                                <Input id="password" name="password" type="password" required minLength={6} className="bg-background/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">Nombre Completo</Label>
                                    <Input id="full_name" name="full_name" className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Empresa</Label>
                                    <Select name="tenant_id">
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue placeholder="Seleccionar empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tenants.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select name="role" defaultValue="client">
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="client">Cliente</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {addError && <p className="text-sm text-red-500">{addError}</p>}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? 'Creando...' : 'Crear Usuario'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Client Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Actualizar información de {editingClient?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleEditClient} className="space-y-4">
                        <input type="hidden" name="id" value={editingClient?.id || ''} />
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_email">Email</Label>
                                <Input id="edit_email" name="email" type="email" defaultValue={editingClient?.email || ''} className="bg-background/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_full_name">Nombre Completo</Label>
                                    <Input id="edit_full_name" name="full_name" defaultValue={editingClient?.full_name || ''} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-company">Empresa</Label>
                                    <Select name="tenant_id" defaultValue={editingClient?.tenant_id || undefined}>
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue placeholder="Seleccionar empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tenants.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        {editError && <p className="text-sm text-red-500">{editError}</p>}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Cambios'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Password Modal */}
            <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Establece una nueva contraseña para {selectedClient?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new_password">Nueva Contraseña</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
                                className="bg-background/50"
                            />
                        </div>
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        {passwordSuccess && <p className="text-sm text-green-500">Contraseña actualizada!</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handlePasswordChange} disabled={isPending || newPassword.length < 6}>
                            {isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* API Key Modal */}
            <Dialog open={apiModalOpen} onOpenChange={setApiModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clave API</DialogTitle>
                        <DialogDescription>Usa esta clave para autenticarte con la API.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={viewingApiKey} className="bg-muted" />
                        <Button variant="outline" onClick={() => navigator.clipboard.writeText(viewingApiKey)}>Copiar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
