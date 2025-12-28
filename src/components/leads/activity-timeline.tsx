'use client'

import { useState, useEffect } from 'react'
import { Note, getNotes, deleteNote } from '@/app/dashboard/notes/actions'
import { Task } from '@/app/dashboard/tasks/actions'
import { TaskRow } from '@/components/tasks/task-row'
import { CreateTaskInput } from '@/components/tasks/create-task-input'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    MessageSquare,
    Phone,
    Mail,
    Users,
    Loader2,
    Trash2,
    CheckSquare,
    History
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
    leadId: string
    activities?: any[] // Kept for compatibility if passed from server, but we fetch notes client-side usually? 
    // Actually page passes 'activities' from getActivities server action which returns Activity[].
    // And now we pass 'tasks'.
    tasks: Task[]
    onTaskCreated?: () => void
    leadName?: string
}

const ICONS: Record<string, any> = {
    note: MessageSquare,
    call: Phone,
    email: Mail,
    meeting: Users,
}

const COLORS: Record<string, string> = {
    note: 'bg-blue-100 text-blue-600',
    call: 'bg-green-100 text-green-600',
    email: 'bg-yellow-100 text-yellow-600',
    meeting: 'bg-purple-100 text-purple-600',
}

export function ActivityTimeline({ leadId, activities = [], tasks = [], onTaskCreated, leadName }: ActivityTimelineProps) {
    // Separate tasks into pending and completed
    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    // We can merge completed tasks into activities for the timeline if we want
    // But for now, let's keep the "History" list as passed from parent or fetched.
    // The parent passes 'activities' (logs). 
    // Let's create a combined history list.

    // Normalize tasks to look like activities for sorting if needed, or just render them.
    // Let's render "Pending Tasks" at top, then "Timeline" below.

    // We already receive 'activities' prop which are the logs.
    // We need to handle client-side note addition? 
    // The previous implementation fetched notes client-side in useEffect using getNotes.
    // But page.tsx passes `activities`. Let's use the props if available.

    // Wait, previous implementation:
    /*
    useEffect(() => {
        getNotes(entityType, entityId).then(...)
    }, ...)
    */
    // The previous file was fetching notes client side. 
    // But `page.tsx` was calling `getActivities`.
    // It seems `page.tsx` was passing `activities` but the component I read (notes/activity-timeline) was ignoring it? 
    // Or maybe I read the wrong component file. 
    // The component I read: `export function ActivityList`.
    // The page used `ActivityTimeline`.
    // Ah, `src/components/leads/activity-timeline.tsx` (which I didn't read content of, only `notes/...`)
    // I should have read `src/components/leads/activity-timeline.tsx`.
    // I will write a new implementation that is robust.

    return (
        <div className="flex flex-col gap-4">
            {/* 1. Pending Tasks Section (The Actionable Part) */}
            <div className="bg-background rounded-lg border border-border shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Próximos Pasos</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{pendingTasks.length} pendientes</span>
                </div>

                <CreateTaskInput
                    leadId={leadId}
                    leadName={leadName}
                    placeholder="Añadir tarea para este lead..."
                    className="mb-4"
                    onSuccess={onTaskCreated}
                />

                <div className="space-y-1">
                    {pendingTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">
                            No hay tareas pendientes. ¡Estás al día!
                        </p>
                    ) : (
                        pendingTasks.map(task => (
                            <TaskRow key={task.id} task={task} />
                        ))
                    )}
                </div>
            </div>

            {/* 2. Timeline Section (The History) */}
            {/* 2. Timeline Section (The History) - Now Minimalist List */}
            <div className="bg-background rounded-lg border border-border flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border bg-muted/10 flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Historial de Actividad</h3>
                </div>

                <div className="flex flex-col">
                    {/* Render Activities */}
                    {activities.map((activity) => {
                        const Icon = ICONS[activity.type] || MessageSquare
                        return (
                            <div key={activity.id} className="group flex items-start gap-3 py-3 px-4 bg-card/50 hover:bg-card border-b border-border/40 transition-all text-sm">
                                {/* Icon Marker */}
                                <div className={cn(
                                    "mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 bg-secondary/50",
                                    // Map text colors only, no backgrounds
                                    activity.type === 'call' && "text-blue-500",
                                    activity.type === 'email' && "text-yellow-600",
                                    activity.type === 'whatsapp' && "text-green-500",
                                    activity.type === 'note' && "text-orange-500",
                                    !['call', 'email', 'whatsapp', 'note'].includes(activity.type) && "text-muted-foreground"
                                )}>
                                    <Icon className="h-3.5 w-3.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="font-medium truncate pr-2">
                                            {activity.profiles?.full_name || 'Sistema'}
                                        </span>
                                        <span className="text-xs text-muted-foreground text-right shrink-0 whitespace-nowrap">
                                            {new Date(activity.created_at).toLocaleDateString('es-ES', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {activity.content}
                                    </p>
                                </div>
                            </div>
                        )
                    })}

                    {/* Render Completed Tasks as History Items */}
                    {completedTasks.map((task) => (
                        <div key={task.id} className="group flex items-center gap-3 py-3 px-4 bg-card/30 hover:bg-card border-b border-border/40 transition-all text-sm opacity-70 hover:opacity-100">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                                <span className="text-muted-foreground line-through decoration-muted-foreground/50 truncate">
                                    {task.title}
                                </span>
                                <span className="text-xs text-muted-foreground italic shrink-0">
                                    Completada
                                </span>
                            </div>
                        </div>
                    ))}

                    {activities.length === 0 && completedTasks.length === 0 && (
                        <div className="text-center text-muted-foreground p-8 text-sm italic">
                            No hay historial registrado aún.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
