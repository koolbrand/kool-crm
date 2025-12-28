import { getLeadDetails, getActivities, getLeadTasks } from '../actions'
import { LeadProfile } from '@/components/leads/lead-profile'
import { ActivityTimeline } from '@/components/leads/activity-timeline'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
    params: { id: string }
}

export default async function LeadDetailsPage({ params }: PageProps) {
    const { id } = params

    const [lead, activities, tasks] = await Promise.all([
        getLeadDetails(id),
        getActivities(id),
        getLeadTasks(id)
    ])

    if (!lead) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/leads">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                    <p className="text-muted-foreground">Manage lead details and activity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <LeadProfile lead={lead} />
                </div>
                <div className="lg:col-span-2">
                    <ActivityTimeline leadId={lead.id} activities={activities} tasks={tasks} />
                </div>
            </div>
        </div>
    )
}
