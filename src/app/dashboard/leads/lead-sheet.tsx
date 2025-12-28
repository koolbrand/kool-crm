'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Added import
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createLead, updateLead, getActivities, getLeadTasks, type Lead, type Activity } from './actions'
import { type Task } from '@/app/dashboard/tasks/actions'
import { Loader2, Coins, User, Briefcase, Phone, Mail, MessageCircle } from 'lucide-react'
import { ActivityTimeline } from '@/components/leads/activity-timeline'

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

interface LeadSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead?: Lead | null
    clients?: { id: string; company_name: string | null; email: string | null }[]
    users?: { id: string; email: string; tenant_id: string }[]
    currency?: string
}

export function LeadSheet({ open, onOpenChange, lead, clients, users, currency = 'EUR' }: LeadSheetProps) {
    const [isPending, startTransition] = useTransition()
    const isEditing = !!lead

    // Initialize state
    const [status, setStatus] = useState<string>(lead?.status || 'new')
    const [source, setSource] = useState<string>(lead?.source || '')
    const [assignedTenantId, setAssignedTenantId] = useState<string>(lead?.tenant_id || '')
    const [assignedUserId, setAssignedUserId] = useState<string>(lead?.user_id || '')

    // Default to 'activity' if editing, else 'details'
    const [activeTab, setActiveTab] = useState(isEditing ? 'activity' : 'details')

    // Data for timeline
    const [tasks, setTasks] = useState<Task[]>([])
    const [activities, setActivities] = useState<Activity[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Sync state when lead changes
    useEffect(() => {
        if (lead) {
            setStatus(lead.status)
            setSource(lead.source || '')
            setAssignedTenantId(lead.tenant_id || '')
            setAssignedUserId(lead.user_id || '')
            setActiveTab(isEditing ? 'activity' : 'details')
        } else {
            // New Lead defaults
            setStatus('new')
            setSource('')
            setAssignedTenantId('')
            setAssignedUserId('')
            setActiveTab('details')
        }
    }, [lead, isEditing])

    // Load Data
    useEffect(() => {
        if (!lead?.id || activeTab !== 'activity') return

        const fetchData = async () => {
            const [t, a] = await Promise.all([
                getLeadTasks(lead.id),
                getActivities(lead.id)
            ])
            setTasks(t)
            setActivities(a)
        }
        fetchData()
    }, [lead?.id, activeTab, refreshTrigger])

    async function handleSubmit(formData: FormData) {
        formData.set('status', status)
        formData.set('source', source)
        if (assignedTenantId) formData.set('assigned_tenant_id', assignedTenantId)
        if (assignedUserId && assignedUserId !== 'unassigned') formData.set('assigned_user_id', assignedUserId)

        startTransition(async () => {
            let result
            if (isEditing && lead) {
                result = await updateLead(lead.id, formData)
            } else {
                result = await createLead(formData)
            }

            if (result?.error) {
                alert(`Error: ${result.error}`)
                return
            }
            onOpenChange(false)
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:w-[850px] sm:max-w-[95vw] flex flex-col p-0 bg-card border-l border-border shadow-2xl overflow-hidden"
            >
                <form action={handleSubmit} className="flex flex-col h-full bg-background">
                    {/* 1. Header with Actions */}
                    <div className="px-8 py-8 border-b border-border bg-background">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                    {isEditing ? lead.name : 'Nuevo Lead'}
                                </SheetTitle>
                                {isEditing && (
                                    <SheetDescription className="mt-1">
                                        {lead.company ? `${lead.company} • ` : ''}
                                        {statusOptions.find(s => s.value === status)?.label}
                                    </SheetDescription>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 flex-1"
                                    disabled={!lead.phone}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (lead.phone) window.open(`tel:${lead.phone}`, '_self')
                                    }}
                                >
                                    <Phone className="h-4 w-4 text-green-600" />
                                    Llamar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 flex-1"
                                    disabled={!lead.email}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (lead.email) window.open(`mailto:${lead.email}`, '_self')
                                    }}
                                >
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    Email
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 flex-1"
                                    disabled={!lead.phone}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        // Simple WhatsApp link
                                        if (lead.phone) window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')
                                    }}
                                >
                                    <MessageCircle className="h-4 w-4 text-green-500" />
                                    WhatsApp
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* 2. Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-8 pb-4 bg-background border-b border-border">
                            <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/20 p-1 rounded-lg">
                                <TabsTrigger
                                    value="activity"
                                    disabled={!isEditing}
                                    className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full transition-all"
                                >
                                    Agenda & Actividad
                                </TabsTrigger>
                                <TabsTrigger
                                    value="details"
                                    className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full transition-all"
                                >
                                    Detalles
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB 1: ACTIVITY */}
                        <div className={`flex-1 overflow-hidden transition-all duration-300 ${activeTab === 'activity' ? 'opacity-100 flex flex-col' : 'opacity-0 hidden'}`}>
                            {lead && (
                                <ScrollArea className="h-full">
                                    <div className="p-6">
                                        <ActivityTimeline
                                            leadId={lead.id}
                                            tasks={tasks}
                                            activities={activities}
                                            onTaskCreated={() => setRefreshTrigger(prev => prev + 1)}
                                            leadName={lead.name}
                                        />
                                    </div>
                                </ScrollArea>
                            )}
                        </div>

                        {/* TAB 2: DETAILS (Original Form) */}
                        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${activeTab === 'details' ? 'block' : 'hidden'}`}>
                            {/* ... same sections as LeadForm ... */}

                            {/* Clients/Tenant Selection (Only if New or Admin) */}
                            {(!isEditing || clients?.length! > 0) && (
                                <div className="space-y-4">
                                    {/* Simplified for brevity, assume admin or new lead logic needed here if relevant */}
                                    {/* Copy-pasting previous form logic for Tenant/User */}
                                    {clients && clients.length > 0 && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                                            <div className="space-y-2">
                                                <Label>Asignar Empresa (Admin)</Label>
                                                <Select value={assignedTenantId} onValueChange={setAssignedTenantId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar empresa..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {clients.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {assignedTenantId && users && (
                                                <div className="space-y-2">
                                                    <Label>Asignar Agente</Label>
                                                    <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sin asignar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                                                            {users.filter(u => u.tenant_id === assignedTenantId).map(u => (
                                                                <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Deal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                    <Coins className="h-4 w-4" /> Detalles del Deal
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Valor Estimado</Label>
                                        <Input id="value" name="value" type="number" defaultValue={lead?.value || 0} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deal">Servicio / Interés</Label>
                                        <Input id="deal" name="deal" defaultValue={lead?.deal || ''} placeholder="Ej: Ortodoncia" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Estado</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map(o => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${o.color}`} />
                                                            {o.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fuente</Label>
                                        <Select value={source} onValueChange={setSource}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Origen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sourceOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" /> Contacto
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input id="name" name="name" defaultValue={lead?.name || ''} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Empresa</Label>
                                        <Input id="company" name="company" defaultValue={lead?.company || ''} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" defaultValue={lead?.email || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input id="phone" name="phone" defaultValue={lead?.phone || ''} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-4 w-4" /> Profesional
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="job_title">Cargo</Label>
                                        <Input id="job_title" name="job_title" defaultValue={lead?.metadata?.job_title || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin">LinkedIn</Label>
                                        <Input id="linkedin" name="linkedin" defaultValue={lead?.metadata?.linkedin || ''} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas Estáticas</Label>
                                <Textarea id="notes" name="notes" defaultValue={lead?.notes || ''} rows={3} />
                            </div>
                        </div>
                    </Tabs>

                    <SheetFooter className="p-6 border-t border-border bg-background">
                        <div className="flex justify-end gap-2 w-full">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Guardar Cambios' : 'Crear Lead'}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
