'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { type ClientOption } from './actions'
import { UserCog } from 'lucide-react'

interface ClientFilterProps {
    clients: ClientOption[]
    selectedClient: string
}

export function ClientFilter({ clients, selectedClient }: ClientFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function handleClientChange(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('client')
        } else {
            params.set('client', value)
        }
        router.push(`/dashboard/leads?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedClient} onValueChange={handleClientChange}>
                <SelectTrigger className="w-[220px] bg-background/50">
                    <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                            {client.company_name || client.email}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
