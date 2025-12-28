'use client'

import { useState } from 'react'
import { Task, toggleTaskStatus } from '@/app/dashboard/tasks/actions'
import { Button } from "@/components/ui/button"
import { Check, Calendar, Phone, Mail, MessageSquare, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isPast, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export function TaskRow({ task }: { task: Task }) {
    const [isCompleted, setIsCompleted] = useState(task.status === 'completed')

    async function handleToggle() {
        // Optimistic update
        const newState = !isCompleted
        setIsCompleted(newState)
        await toggleTaskStatus(task.id, task.status)
    }



    let dateText = ''
    let dateColor = 'text-muted-foreground'

    if (task.due_date) {
        const date = new Date(task.due_date)
        if (isPast(date) && !isToday(date) && !isCompleted) {
            dateText = format(date, 'dd MMM', { locale: es })
            dateColor = 'text-red-500 font-medium'
        } else if (isToday(date)) {
            dateText = 'Hoy'
            dateColor = 'text-blue-500 font-medium'
        } else if (isTomorrow(date)) {
            dateText = 'Mañana'
            dateColor = 'text-amber-500'
        } else {
            dateText = format(date, 'dd MMM', { locale: es })
        }
    }

    return (
        <div className={cn(
            "group flex items-center gap-3 py-3 px-4 bg-card/50 hover:bg-card border-b border-border/40 transition-all",
            isCompleted && "opacity-50"
        )}>
            {/* Custom Checkbox */}
            <button
                onClick={handleToggle}
                className={cn(
                    "h-5 w-5 rounded border border-primary/50 flex items-center justify-center transition-all hover:border-primary",
                    isCompleted ? "bg-primary border-primary" : "bg-transparent"
                )}
            >
                {isCompleted && <Check className="h-3 w-3 text-primary-foreground" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-sm font-medium truncate",
                        isCompleted && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </span>
                    {task.lead && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500">
                            {task.lead.name}
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mr-2">
                    {task.type === 'call' && task.lead?.phone && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                            onClick={(e) => {
                                e.stopPropagation()
                                window.open(`tel:${task.lead?.phone}`, '_self')
                            }}
                        >
                            <Phone className="h-3 w-3" />
                            Llamar
                        </Button>
                    )}
                    {task.type === 'email' && task.lead?.email && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400"
                            onClick={(e) => {
                                e.stopPropagation()
                                window.open(`mailto:${task.lead?.email}`, '_self')
                            }}
                        >
                            <Mail className="h-3 w-3" />
                            Email
                        </Button>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs">
                {dateText && (
                    <div className={cn("flex items-center gap-1", dateColor)}>
                        <Calendar className="h-3 w-3" />
                        <span>{dateText}</span>
                    </div>
                )}

            </div>
        </div>
    )
}
