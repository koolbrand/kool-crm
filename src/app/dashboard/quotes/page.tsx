import { getQuotes } from './actions'
import { getLeads } from '../leads/actions'
import { QuotesTable } from './quotes-table'
import { FileText } from 'lucide-react'

export default async function QuotesPage() {
    const [quotes, leads] = await Promise.all([
        getQuotes(),
        getLeads()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                    <p className="text-muted-foreground">Manage proposals and quotes for your leads.</p>
                </div>
            </div>

            <QuotesTable quotes={quotes} leads={leads} />
        </div>
    )
}
