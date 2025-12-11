'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createLead, updateLead, type Lead } from './actions'
import { createNote, type ActivityType } from '@/app/dashboard/notes/actions'
import { Loader2, Coins, User, Briefcase, Send } from 'lucide-react'
import { ActivityList } from '@/components/notes/activity-timeline'

const statusOptions = [
    { value: 'new', label: 'Nuevo', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Cualificado', color: 'bg-purple-500' },
    { value: 'proposal', label: 'Propuesta', color: 'bg-orange-500' },
    { value: 'negotiation', label: 'Negociación', color: 'bg-amber-500' },
    { value: 'won', label: 'Ganado', color: 'bg-green-500' },
    { value: 'lost', label: 'Perdido', color: 'bg-red-500' },
]

const sourceOptions = [
    'Website',
    'Referral',
    'Meta',
    'Facebook',
    'Instagram',
    'TikTok',
    'LinkedIn',
    'Cold Call',
    'Advertisement',
    'Trade Show',
    'Other',
]

interface LeadFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead?: Lead | null
    clients?: { id: string; company_name: string | null; email: string | null }[]
    users?: { id: string; email: string; tenant_id: string }[]
    currency?: string
}

export function LeadForm({ open, onOpenChange, lead, clients, users, currency = 'EUR' }: LeadFormProps) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<string>(lead?.status || 'new')
    const [source, setSource] = useState<string>(lead?.source || '')
    const [assignedTenantId, setAssignedTenantId] = useState<string>(lead?.tenant_id || '')
    const [assignedUserId, setAssignedUserId] = useState<string>(lead?.user_id || '')
    const [activeTab, setActiveTab] = useState('details')

    // New state for activity input
    // New state for activity input
    const [activityType] = useState<ActivityType>('note')
    const [noteContent, setNoteContent] = useState('')
    const [isAddingNote, setIsAddingNote] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0) // Trigger list refresh

    // Sync state with lead prop when it changes
    useEffect(() => {
        setStatus(lead?.status || 'new')
        setSource(lead?.source || '')
        setAssignedTenantId(lead?.tenant_id || '')
        setAssignedUserId(lead?.user_id || '')
        setActiveTab('details')
        setNoteContent('')
    }, [lead])

    const isEditing = !!lead

    async function handleAddActivity() {
        if (!noteContent.trim() || !lead?.id) return

        setIsAddingNote(true)
        try {
            const noteFormData = new FormData()
            noteFormData.set('content', noteContent)
            noteFormData.set('type', activityType)
            noteFormData.set('leadId', lead.id)

            const result = await createNote(noteFormData)
            if (result?.error) {
                alert(`Error guardando actividad: ${result.error}`)
            } else {
                setNoteContent('')
                setRefreshTrigger(prev => prev + 1)
            }
        } finally {
            setIsAddingNote(false)
        }
    }

    async function handleSubmit(formData: FormData) {
        // Collect lead data manually as needed or rely on formData
        formData.set('status', status)
        formData.set('source', source)
        if (assignedTenantId) formData.set('assigned_tenant_id', assignedTenantId)
        if (assignedUserId && assignedUserId !== 'unassigned') formData.set('assigned_user_id', assignedUserId)

        // Capture note data from the form
        const noteContent = formData.get('note_content') as string
        const noteType = activityType

        startTransition(async () => {
            // 1. Save/Create Lead
            const leadId = lead?.id
            let result

            if (isEditing && lead) {
                result = await updateLead(lead.id, formData)
            } else {
                const createResult = await createLead(formData)
                // If we created a lead, we might get an ID back? 
                // Currently generic createLead might not return ID in success object if not updated.
                // Assuming createLead returns success/error. If we want to attach a note to a NEW lead, we need the ID.
                // If createLead redirects or revalidates, we might miss the note if we don't have the ID.
                // For now, let's assume this flow works best for EDITing. Creating + Note might require createLead to return ID.
                result = createResult
            }

            if (result?.error) {
                alert(`Error saving lead: ${result.error}`)
                return
            }

            // 2. Save Note if present and we have an ID (mostly for Edit case now)
            if (noteContent && noteContent.trim() !== '' && leadId) {
                const noteFormData = new FormData()
                noteFormData.set('content', noteContent)
                noteFormData.set('type', noteType)
                noteFormData.set('leadId', leadId)

                await createNote(noteFormData)
                setRefreshTrigger(prev => prev + 1) // Refresh list
            }

            onOpenChange(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 bg-card border-border overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-border">
                    <DialogTitle className="text-foreground">
                        {isEditing ? 'Editar Lead' : 'Añadir Nuevo Lead'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Gestiona la información y actividad del lead.' : 'Rellena los detalles para crear un nuevo lead.'}
                    </DialogDescription>
                </DialogHeader>

                {/* WRAP TABS IN FORM */}
                <form id="lead-form" action={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b border-border bg-muted/20">
                            <TabsList className="grid w-[300px] grid-cols-2">
                                <TabsTrigger value="details">Detalles</TabsTrigger>
                                <TabsTrigger value="activity" disabled={!isEditing}>Actividad</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className={activeTab === 'details' ? 'flex-1 overflow-y-auto p-6 m-0 space-y-6 block' : 'hidden'}>
                            {clients && clients.length > 0 && (
                                <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
                                    <div className="space-y-2">
                                        <Label>Asignar Empresa (Admin)</Label>
                                        <Select
                                            value={assignedTenantId}
                                            onValueChange={(val) => {
                                                setAssignedTenantId(val)
                                                setAssignedUserId('')
                                            }}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Seleccionar empresa..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.company_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {assignedTenantId && users && users.length > 0 && (
                                        <div className="space-y-2 ml-4">
                                            <Label>Asignar Agente (Opcional)</Label>
                                            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Cualquier Agente (Sin propietario)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Cualquier Agente (Sin propietario)</SelectItem>
                                                    {users
                                                        .filter(u => u.tenant_id === assignedTenantId)
                                                        .map(u => (
                                                            <SelectItem key={u.id} value={u.id}>
                                                                {u.email}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECTION 1: DEAL INFO - Most accessed, first */}
                            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-4">
                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    Detalles del Deal
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Valor Estimado ({currency === 'USD' ? '$' : '€'})</Label>
                                        <Input
                                            id="value"
                                            name="value"
                                            type="number"
                                            step="0.01"
                                            defaultValue={lead?.value || 0}
                                            placeholder="0.00"
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deal">Interés / Servicio</Label>
                                        <Input
                                            id="deal"
                                            name="deal"
                                            defaultValue={lead?.deal || ''}
                                            placeholder="Ej: Ortodoncia..."
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Estado / Etapa</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fuente / Origen</Label>
                                        <Select value={source} onValueChange={setSource}>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Seleccionar origen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sourceOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: CONTACT INFO */}
                            <div className="rounded-lg border border-border bg-card/30 p-4 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Información de Contacto
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={lead?.name || ''}
                                            placeholder="Juan Pérez"
                                            required
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Empresa</Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            defaultValue={lead?.company || ''}
                                            placeholder="Acme S.A."
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={lead?.email || ''}
                                            placeholder="juan@ejemplo.com"
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={lead?.phone || ''}
                                            placeholder="+34 600 000 000"
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: PROFESSIONAL INFO (METADATA) */}
                            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Datos Profesionales
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="job_title">Cargo / Job Title</Label>
                                        <Input
                                            id="job_title"
                                            name="job_title"
                                            defaultValue={lead?.metadata?.job_title || ''}
                                            placeholder="CEO, Marketing Manager..."
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                                        <Input
                                            id="linkedin"
                                            name="linkedin"
                                            defaultValue={lead?.metadata?.linkedin || ''}
                                            placeholder="https://linkedin.com/in/..."
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: NOTES */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas Iniciales (Opcional)</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    defaultValue={lead?.notes || ''}
                                    placeholder="Estas notas son estáticas..."
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className={activeTab === 'activity' ? 'flex-1 overflow-hidden m-0 flex flex-col h-full bg-muted/10 p-0' : 'hidden'}>
                            {/* Activity Input Area */}
                            <div className="p-4 bg-background border-b border-border shadow-sm z-10">
                                <Label className="mb-2 block font-semibold">Registrar Nueva Actividad</Label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Escribe una nota o registra una actividad..."
                                            className="min-h-[80px] bg-background resize-none focus-visible:ring-primary flex-1"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddActivity}
                                        disabled={!noteContent.trim() || isAddingNote}
                                        className="w-full"
                                    >
                                        {isAddingNote ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        Añadir Actividad
                                    </Button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 overflow-hidden">
                                {lead && <ActivityList entityType="lead" entityId={lead.id} refreshTrigger={refreshTrigger} />}
                            </div>
                        </div>
                    </Tabs>

                    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 items-center">
                        <div className="flex items-center justify-between w-full">
                            <div></div> {/* Spacer since we removed conversion button logic here */}

                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Guardar Cambios' : 'Crear Lead'}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
