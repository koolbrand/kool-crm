import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, DollarSign, User } from 'lucide-react'
import Link from 'next/link'

async function getDeal(id: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('deals')
        .select(`
            *,
            profiles:contact_id ( full_name, email, company_name )
        `)
        .eq('id', id)
        .single()
    return data
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deal = await getDeal(id)

    if (!deal) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/deals">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{deal.title}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Badge variant="outline">{deal.stage}</Badge>
                        <span>Created {new Date(deal.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Información del Deal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/50">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Valor</p>
                                    <p className="font-bold text-lg">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD' }).format(deal.value)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/50">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha Cierre</p>
                                    <p className="font-medium">
                                        {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : 'Sin definir'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold mb-2">Historial de Actividad</h3>
                            <div className="text-sm text-muted-foreground italic p-4 border rounded bg-muted/20 text-center">
                                No hay actividad registrada aún.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contacto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deal.profiles ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {(deal.profiles?.full_name || deal.leads?.name || '?').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{deal.profiles?.full_name || deal.leads?.name}</p>
                                        <p className="text-xs text-muted-foreground">{deal.profiles?.email || deal.leads?.email}</p>
                                    </div>
                                </div>
                                {(deal.profiles?.company_name || deal.leads?.company) && (
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-muted-foreground mb-1">Empresa</p>
                                        <p className="font-medium">{deal.profiles?.company_name || deal.leads?.company}</p>
                                    </div>
                                )}
                                <Link href={deal.profiles ? `/dashboard/clients?search=${deal.profiles.email}` : `/dashboard/leads`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        Ver {deal.profiles ? 'Perfil' : 'Lead'}
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Sin contacto asignado</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
