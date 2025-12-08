import { getLeads } from '../actions'
import { KanbanBoard } from './kanban-board'

export default async function KanbanPage() {
    const leads = await getLeads()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Pipeline</h2>
                    <p className="text-muted-foreground">Drag and drop leads to update their status.</p>
                </div>
            </div>

            {/* Kanban Board */}
            <KanbanBoard leads={leads} />
        </div>
    )
}
