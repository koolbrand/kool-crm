'use client'

import { useState, useRef, useEffect } from 'react'
import { createTask } from '@/app/dashboard/tasks/actions'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Phone, MessageCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateTaskInputProps {
    leadId?: string
    dealId?: string
    placeholder?: string
    className?: string
    onSuccess?: () => void
    leadName?: string
}

export function CreateTaskInput({ leadId, dealId, placeholder, className, onSuccess, leadName }: CreateTaskInputProps) {
    const [title, setTitle] = useState('')
    const [isPending, setIsPending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) {
        if (e) e.preventDefault()
        if (!title.trim()) return

        setIsPending(true)
        const formData = new FormData()
        formData.append('title', title)
        // Default to today for "My Agenda" feeling, or maybe null if in context? 
        // Let's default to today to ensure it appears in "Agenda" too.
        formData.append('due_date', new Date().toISOString())

        if (leadId) formData.append('lead_id', leadId)
        if (dealId) formData.append('deal_id', dealId)

        await createTask(formData)
        setTitle('')
        setIsPending(false)
        onSuccess?.()
    }

    const setQuickTask = (type: 'call' | 'whatsapp' | 'email') => {
        const name = leadName || 'Cliente'
        let text = ''
        switch (type) {
            case 'call': text = `Llamar a ${name}`; break;
            case 'whatsapp': text = `WhatsApp a ${name}`; break;
            case 'email': text = `Email a ${name}`; break;
        }
        setTitle(text)
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {leadName && (
                <div className="flex items-center gap-1 mb-1 pl-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 rounded-full transition-colors"
                        onClick={() => setQuickTask('call')}
                        type="button"
                        title="Llamar"
                    >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 rounded-full transition-colors"
                        onClick={() => setQuickTask('whatsapp')}
                        type="button"
                        title="WhatsApp"
                    >
                        <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 rounded-full transition-colors"
                        onClick={() => setQuickTask('email')}
                        type="button"
                        title="Email"
                    >
                        <Mail className="h-3.5 w-3.5 text-primary" />
                    </Button>
                </div>
            )}
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    placeholder={placeholder || "¿Qué tienes que hacer hoy? (+ Enter)"}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSubmit(e)
                        }
                    }}
                    className="bg-card/50 h-10 text-base shadow-sm font-medium"
                    autoFocus={!leadId} // Don't autofocus if inside a detail view
                />
                <Button
                    type="button"
                    onClick={(e) => handleSubmit(e)}
                    size="default"
                    disabled={isPending || !title.trim()}
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
