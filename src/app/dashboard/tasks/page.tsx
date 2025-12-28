import { getTasks } from './actions'
import { TaskRow } from '@/components/tasks/task-row'
import { CreateTaskInput } from '@/components/tasks/create-task-input'
import { isToday, isPast, isFuture } from 'date-fns'
import { Card } from "@/components/ui/card"
import { CheckSquare } from 'lucide-react'

export default async function TasksPage() {
    const tasks = await getTasks()

    // Grouping
    const overdue = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && t.status === 'pending')

    // Today includes items due today OR items without a date (Inbox/Backlog)
    const today = tasks.filter(t => {
        if (t.status === 'completed') return false
        if (!t.due_date) return true
        return isToday(new Date(t.due_date))
    })

    const upcoming = tasks.filter(t => t.due_date && isFuture(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && t.status === 'pending')
    const completed = tasks.filter(t => t.status === 'completed')

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <CheckSquare className="h-8 w-8 text-primary" />
                    Mi Agenda
                </h2>
                <p className="text-muted-foreground">Enfócate en lo que importa hoy.</p>
            </div>

            <div className="max-w-2xl">
                <CreateTaskInput />
            </div>

            <div className="space-y-6">
                {/* Overdue Section */}
                {overdue.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-red-500 mb-3 ml-1">Vencido ({overdue.length})</h3>
                        <Card className="overflow-hidden bg-card/40 border-red-500/20 shadow-sm">
                            <div className="divide-y divide-border/20">
                                {overdue.map(task => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </Card>
                    </section>
                )}

                {/* Today Section */}
                <section>
                    <h3 className="text-sm font-semibold text-blue-500 mb-3 ml-1">Para Hoy</h3>
                    <Card className="overflow-hidden bg-card/60 border-blue-500/20 shadow-md backdrop-blur-sm min-h-[100px]">
                        {today.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                                <p>¡Todo limpio! 🎉</p>
                                <p className="text-xs opacity-70 mt-1">Añade una tarea arriba o tómate un descanso.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/20">
                                {today.map(task => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                    </Card>
                </section>

                {/* Upcoming Section */}
                {upcoming.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 ml-1">Próximo</h3>
                        <Card className="overflow-hidden bg-card/30 shadow-none border-dashed border-border">
                            <div className="divide-y divide-border/20">
                                {upcoming.map(task => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </Card>
                    </section>
                )}

                {/* Completed Section */}
                {completed.length > 0 && (
                    <section className="opacity-60 grayscale hover:grayscale-0 transition-all">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 ml-1">Completados Recientes</h3>
                        <Card className="overflow-hidden bg-muted/20 shadow-none border-muted">
                            <div className="divide-y divide-border/20">
                                {completed.slice(0, 5).map(task => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </Card>
                    </section>
                )}
            </div>
        </div>
    )
}
