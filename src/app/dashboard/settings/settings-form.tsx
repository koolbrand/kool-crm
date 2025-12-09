'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, regenerateApiKeyAction, updateTenantSettings, changePassword, type TenantSettings } from './actions'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react'
import { type Profile } from '@/lib/auth'

interface SettingsFormProps {
    profile: Profile & { tenant_name?: string | null }
    settings: TenantSettings | null
}

export function SettingsForm({ profile, settings }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [isRegenerating, setIsRegenerating] = useState(false)

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

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

    async function handleChangePassword() {
        setPasswordError('')
        setPasswordSuccess(false)

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden')
            return
        }

        if (newPassword.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setIsChangingPassword(true)
        const result = await changePassword(currentPassword, newPassword)
        setIsChangingPassword(false)

        if (result.error) {
            setPasswordError(result.error)
        } else {
            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }
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
                            defaultValue={profile.role === 'admin' ? (profile.company_name || '') : (profile.tenant_name || profile.company_name || '')}
                            placeholder="Acme S.L."
                            className={profile.role !== 'admin' ? 'bg-muted/50 cursor-not-allowed' : 'bg-background/50'}
                            readOnly={profile.role !== 'admin'}
                            disabled={profile.role !== 'admin'}
                        />
                        {profile.role !== 'admin' && (
                            <p className="text-xs text-muted-foreground">Este campo solo puede ser modificado por un administrador.</p>
                        )}
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

            {/* Password Change Section - Available for all users */}
            <div className="border-t border-border pt-4">
                <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Cambiar Contraseña
                    </h3>
                </div>
                <div className="space-y-3 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-background/50 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-background/50 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-background/50"
                        />
                    </div>
                    {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                        <p className="text-sm text-green-500">Contraseña actualizada correctamente</p>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cambiar Contraseña
                    </Button>
                </div>
            </div>

            {/* API Key Section - Only for admins */}
            {profile.role === 'admin' && (
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
            )}
        </div >
    )
}
