import { getProfileAction } from './actions'
import { SettingsForm } from './settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Key } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const profile = await getProfileAction()

    if (!profile) {
        redirect('/login')
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h2>
                <p className="text-muted-foreground">Gestiona tu cuenta y acceso a la API.</p>
            </div>

            {/* Profile Card */}
            <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Perfil
                    </CardTitle>
                    <CardDescription>Información de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-xl">
                            {profile.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-medium">{profile.full_name || profile.email}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            <Badge className={profile.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1'
                            }>
                                {profile.role === 'admin' ? '👑 Admin' : '👤 Cliente'}
                            </Badge>
                        </div>
                    </div>
                    <SettingsForm profile={profile} settings={await import('./actions').then(m => m.getTenantSettings())} />
                </CardContent>
            </Card>

            {/* API Key Card */}
            <Card className="bg-card/40 border-border shadow-lg backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Clave API
                    </CardTitle>
                    <CardDescription>
                        Usa esta clave para enviar leads vía API (n8n, Zapier, etc.)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-background/50 rounded-md border border-border text-sm font-mono break-all">
                                {profile.api_key}
                            </code>
                        </div>
                        <div className="border-t border-border pt-4">
                            <h4 className="font-medium mb-2">Cómo usar</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Envía una petición POST a <code className="bg-background/50 px-1 rounded">/api/leads</code> con:
                            </p>
                            <pre className="p-3 bg-background/50 rounded-md border border-border text-xs overflow-x-auto">
                                {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/leads \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${profile.api_key}" \\
  -d '{"name": "Juan Pérez", "email": "juan@ejemplo.com", "phone": "+34600000000"}'`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
