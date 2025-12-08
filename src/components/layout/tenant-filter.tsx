'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Building2, Loader2 } from 'lucide-react'

interface TenantOption {
    id: string
    name: string
}

interface TenantFilterProps {
    tenants: TenantOption[]
    initialValue?: string
}

export function TenantFilter({ tenants, initialValue }: TenantFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Prefer URL param, then cookie/initialValue, then 'all'
    const currentTenant = searchParams.get('client') || initialValue || 'all'

    function handleTenantChange(value: string) {
        // Persist to cookie (expire in 1 year)
        document.cookie = `admin_tenant_filter=${value}; path=/; max-age=31536000`

        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === 'all') {
                params.delete('client') // Keeping 'client' as param name for consistency with existing code
            } else {
                params.set('client', value)
            }

            router.push(`${pathname}?${params.toString()}`)
            router.refresh() // Ensure server components re-read cookie if needed
        })
    }

    return (
        <div className="flex items-center gap-2 mr-4">
            {isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={currentTenant} onValueChange={handleTenantChange} disabled={isPending}>
                <SelectTrigger className="w-[200px] h-9 bg-background/50 border-input">
                    <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Empresas</SelectItem>
                    {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
