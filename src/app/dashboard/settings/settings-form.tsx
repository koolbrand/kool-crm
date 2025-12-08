'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, regenerateApiKeyAction, updateTenantSettings, type TenantSettings } from './actions'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCw } from 'lucide-react'
import { type Profile } from '@/lib/auth'

interface SettingsFormProps {
    profile: Profile
    settings: TenantSettings | null
}

export function SettingsForm({ profile, settings }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [isRegenerating, setIsRegenerating] = useState(false)

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            // Update profile
            await updateProfile(formData)

            // Update settings (if admin)
            if (profile.role === 'admin') {
                await updateTenantSettings(formData)
            }
        })
    }

    async function handleRegenerateApiKey() {
        if (!confirm('¿Estás seguro? Esto invalidará tu clave API actual.')) {
            return
        }

        setIsRegenerating(true)
        await regenerateApiKeyAction()
        setIsRegenerating(false)
    }

    return (
        <div className="space-y-6">
            <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            defaultValue={profile.full_name || ''}
                            placeholder="Juan Pérez"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Empresa</Label>
                        <Input
                            id="company_name"
                            name="company_name"
                            defaultValue={profile.company_name || ''}
                            placeholder="Acme S.L."
                            className="bg-background/50"
                        />
                    </div>
                </div>

                {profile.role === 'admin' && settings && (
                    <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Configuración Global</h3>
                            <p className="text-sm text-muted-foreground">Estos ajustes aplican a toda tu organización.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Moneda</Label>
                                <Select name="currency" defaultValue={settings.currency || 'EUR'}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="USD">Dólar ($)</SelectItem>
                                        <SelectItem value="GBP">Libra (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="language">Idioma (Formatos)</Label>
                                <Select name="language" defaultValue={settings.language || 'es'}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="es">Español (DD/MM/YYYY)</SelectItem>
                                        <SelectItem value="en">Inglés (MM/DD/YYYY)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}

                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </form>

            <div className="border-t border-border pt-4">
                <Button
                    variant="outline"
                    onClick={handleRegenerateApiKey}
                    disabled={isRegenerating}
                >
                    {isRegenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Regenerar Clave API
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Esto invalidará tu clave actual. Actualiza tus integraciones después de regenerarla.
                </p>
            </div>
        </div >
    )
}
