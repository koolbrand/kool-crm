'use client'

import { useState, useTransition } from 'react'
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { createDeal, updateDeal, type Deal } from './actions'
import { createNote, type ActivityType } from '@/app/dashboard/notes/actions'
import { Loader2 } from 'lucide-react'
import { ActivityList } from '@/components/notes/activity-timeline'

const stageOptions = [
    { value: 'qualification', label: 'Cualificación' },
    { value: 'proposal', label: 'Propuesta' },
    { value: 'negotiation', label: 'Negociación' },
    { value: 'won', label: 'Ganado' },
    { value: 'lost', label: 'Perdido' },
]

interface DealFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    deal?: Deal | null
    currency?: string
}

export function DealForm({ open, onOpenChange, deal, currency = 'EUR' }: DealFormProps) {
    const [isPending, startTransition] = useTransition()
    const [stage, setStage] = useState<string>(deal?.stage || 'qualification')
    const [activeTab, setActiveTab] = useState('details')

    // New state for activity input
    const [activityType, setActivityType] = useState<ActivityType>('note')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const isEditing = !!deal

    async function handleSubmit(formData: FormData) {
        formData.set('stage', stage)

        // Capture note data from the form
        const noteContent = formData.get('note_content') as string
        const noteType = activityType

        startTransition(async () => {
            let dealId = deal?.id
            let result

            if (isEditing && deal) {
                result = await updateDeal(deal.id, formData)
            } else {
                result = await createDeal(formData)
            }

            if (result?.error) {
                alert(`Error saving deal: ${result.error}`)
                return
            }

            // Save Note if present and we have an ID (mostly for Edit case)
            if (noteContent && noteContent.trim() !== '' && dealId) {
                const noteFormData = new FormData()
                noteFormData.set('content', noteContent)
                noteFormData.set('type', noteType)
                noteFormData.set('dealId', dealId)

                await createNote(noteFormData)
                setRefreshTrigger(prev => prev + 1)
            }

            onOpenChange(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 bg-card border-border overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-border">
                    <DialogTitle className="text-foreground">
                        {isEditing ? 'Editar Oportunidad (Deal)' : 'Crear Nueva Oportunidad'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Gestiona los detalles y actividad de esta oportunidad.' : 'Introduce los detalles de la nueva oportunidad comercial.'}
                    </DialogDescription>
                </DialogHeader>

                <form id="deal-form" action={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b border-border bg-muted/20">
                            <TabsList className="grid w-[300px] grid-cols-2">
                                <TabsTrigger value="details">Detalles</TabsTrigger>
                                <TabsTrigger value="activity" disabled={!isEditing}>Actividad</TabsTrigger>
                            </TabsList>
                        </div>


                        <div className={activeTab === 'details' ? 'flex-1 overflow-y-auto p-6 m-0 space-y-6 block' : 'hidden'}>
                            <div className="space-y-2">
                                <Label htmlFor="title">Título del Deal</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={deal?.title || ''}
                                    placeholder="e.g. Contrato Anual Empresa X"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Valor ({currency === 'USD' ? '$' : '€'})</Label>
                                    <Input
                                        id="value"
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        defaultValue={deal?.value || 0}
                                        placeholder="0.00"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Etapa / Stage</Label>
                                    <Select value={stage} onValueChange={setStage}>
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue placeholder="Seleccionar etapa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stageOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className={activeTab === 'activity' ? 'flex-1 overflow-hidden m-0 flex flex-col h-full bg-muted/10 p-0' : 'hidden'}>
                            {/* NEW: Activity Input Area */}
                            <div className="p-4 bg-background border-b border-border shadow-sm z-10">
                                <Label className="mb-2 block font-semibold">Registrar Nueva Actividad</Label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Select value={activityType} onValueChange={(v: ActivityType) => setActivityType(v)}>
                                            <SelectTrigger className="w-[140px] bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="note">📝 Nota</SelectItem>
                                                <SelectItem value="call">📞 Llamada</SelectItem>
                                                <SelectItem value="email">📧 Correo</SelectItem>
                                                <SelectItem value="meeting">🤝 Reunión</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea
                                        name="note_content"
                                        placeholder={`Escribe detalles sobre la ${activityType === 'call' ? 'llamada' : activityType === 'email' ? 'correo' : activityType === 'meeting' ? 'reunión' : 'nota'}... (Se guardará al pulsar "Guardar Cambios")`}
                                        className="min-h-[80px] bg-background resize-none focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {deal && <ActivityList entityType="deal" entityId={deal.id} refreshTrigger={refreshTrigger} />}
                            </div>
                        </div>
                    </Tabs>

                    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Guardar Cambios' : 'Crear Deal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
