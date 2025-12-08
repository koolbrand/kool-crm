'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, addActivity } from '@/app/dashboard/leads/actions'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ActivityTimelineProps {
    leadId: string
    activities: Activity[]
}

export function ActivityTimeline({ leadId, activities }: ActivityTimelineProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [content, setContent] = useState('')
    const [type, setType] = useState<Activity['type']>('note')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        startTransition(async () => {
            const result = await addActivity(leadId, type, content)
            if (result.success) {
                setContent('')
                router.refresh()
            } else {
                alert('Error adding activity')
            }
        })
    }

    const icons = {
        note: MessageSquare,
        call: Phone,
        email: Mail,
        meeting: Calendar,
        status_change: CheckCircle2
    }

    return (
        <div className="space-y-6">
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">New Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Tabs value={type} onValueChange={(v) => setType(v as Activity['type'])} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                                <TabsTrigger value="note">Note</TabsTrigger>
                                <TabsTrigger value="call">Call</TabsTrigger>
                                <TabsTrigger value="email">Email</TabsTrigger>
                                <TabsTrigger value="meeting">Meeting</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Textarea
                            placeholder={`Add a ${type}...`}
                            value={content}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                            className="bg-background/50 min-h-[100px]"
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending || !content.trim()}>
                                {isPending ? 'Saving...' : 'Save Activity'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Timeline</h3>

                <div className="relative space-y-8 pl-6 before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-border">
                    {activities.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No activities recorded yet.</p>
                    )}

                    {activities.map((activity) => {
                        const Icon = icons[activity.type] || MessageSquare
                        return (
                            <div key={activity.id} className="relative">
                                <span className={`absolute -left-[22px] -top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background ring-4 ring-background ${activity.type === 'note' ? 'border-blue-500/50 text-blue-500' :
                                    activity.type === 'call' ? 'border-green-500/50 text-green-500' :
                                        activity.type === 'email' ? 'border-yellow-500/50 text-yellow-500' :
                                            'border-purple-500/50 text-purple-500'
                                    }`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-semibold">{activity.profiles?.full_name || 'User'}</div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap border border-border/50">
                                        {activity.content}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
