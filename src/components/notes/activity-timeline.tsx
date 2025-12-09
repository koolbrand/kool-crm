'use client'

import { useState, useTransition, useEffect } from 'react'
import { Note, getNotes, deleteNote } from '@/app/dashboard/notes/actions'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    MessageSquare,
    Phone,
    Mail,
    Users,
    Loader2,
    Trash2,
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface ActivityListProps {
    entityType: 'lead' | 'deal'
    entityId: string
    refreshTrigger?: number // Simple way to trigger refresh from parent
}

const ICONS = {
    note: MessageSquare,
    call: Phone,
    email: Mail,
    meeting: Users,
}

const COLORS = {
    note: 'bg-blue-100 text-blue-600',
    call: 'bg-green-100 text-green-600',
    email: 'bg-yellow-100 text-yellow-600',
    meeting: 'bg-purple-100 text-purple-600',
}

const LABELS = {
    note: 'Nota',
    call: 'Llamada',
    email: 'Correo',
    meeting: 'Reunión',
}

export function ActivityList({ entityType, entityId, refreshTrigger = 0 }: ActivityListProps) {
    const [notes, setNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load notes on mount or when trigger changes
    useEffect(() => {
        let mounted = true
        setIsLoading(true)
        getNotes(entityType, entityId).then(data => {
            if (mounted) {
                setNotes(data)
                setIsLoading(false)
            }
        })
        return () => { mounted = false }
    }, [entityType, entityId, refreshTrigger])

    async function handleDelete(id: string) {
        if (!confirm('¿Borrar esta actividad?')) return
        setNotes(notes.filter(n => n.id !== id)) // Optimistic delete
        await deleteNote(id)
    }

    return (
        <div className="flex flex-col h-full bg-muted/30 rounded-lg border border-border overflow-hidden">
            {/* Timeline List */}
            <ScrollArea className="flex-1 h-full">
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8 text-sm">
                            No hay actividad registrada aún.
                        </div>
                    ) : (
                        <div className="space-y-6 relative ml-2">
                            {/* Vertical line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-border -z-10" />

                            {notes.map((note) => {
                                const Icon = ICONS[note.type] || MessageSquare
                                return (
                                    <div key={note.id} className="relative flex gap-4 group">
                                        {/* Icon Bubble */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm shrink-0",
                                            COLORS[note.type] || COLORS.note
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1 bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{note.user?.full_name || 'Usuario'}</span>
                                                    <span className="text-xs text-muted-foreground">• registró una {LABELS[note.type]?.toLowerCase() || 'actividad'}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(note.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap text-foreground/90">
                                                {note.content}
                                            </p>
                                            <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(note.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
