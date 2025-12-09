import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, MapPin, MousePointerClick, Target, BarChart3, Settings, Shield, Lock, Coins, User, Briefcase, FileText } from "lucide-react"

export default function GuidePage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Tu Flujo de Ventas
                </h1>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                    Guía de referencia rápida: Dónde ir y qué hacer en cada paso.
                </p>
            </div>

            <div className="grid gap-12 mt-4">
                {/* Step 1 - Leads */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">1</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Llega un nuevo Lead
                            <Badge variant="outline" className="ml-2 font-normal">Captura</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Menú Lateral &rarr; <strong>Leads</strong></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MousePointerClick className="h-4 w-4" />
                                        <span>¿Cómo?</span>
                                    </div>
                                    <p className="text-sm">Clic en el botón <strong>+ Nuevo Lead</strong>. Los leads de Meta Ads se crean automáticamente.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-violet-500">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    <strong>En la ficha del Lead</strong> puedes:
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <Coins className="h-4 w-4 text-primary" />
                                        <span><strong>Detalles del Deal:</strong> Valor, interés/servicio, estado y fuente</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span><strong>Contacto:</strong> Nombre, empresa, email y teléfono</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span><strong>Profesional:</strong> Cargo y LinkedIn</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span><strong>Actividad:</strong> Registrar notas, llamadas, correos y reuniones</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-3">
                                    Haz clic en el nombre de cualquier lead para abrir su ficha.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Step 2 - Funnel */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">2</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Target className="h-6 w-6 text-primary" />
                            Gestión del Funnel
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">Venta</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Menú Lateral &rarr; <strong>Funnel</strong></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MousePointerClick className="h-4 w-4" />
                                        <span>¿Cómo?</span>
                                    </div>
                                    <p className="text-sm"><strong>Arrastra y suelta</strong> las tarjetas entre columnas para cambiar el estado.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-pink-500">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    El Funnel muestra tus leads organizados por etapa:
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                        <strong>Cualificación</strong> - Leads calificados listos para propuesta
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                        <strong>Propuesta</strong> - Propuesta enviada al cliente
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                        <strong>Negociación</strong> - En negociación de términos
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                        <strong>Ganado</strong> - ¡Venta cerrada!
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                        <strong>Perdido</strong> - Oportunidad perdida
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Step 3 - Analytics */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">3</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            Analítica
                            <Badge variant="outline" className="ml-2 font-normal">Revisión</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Menú Lateral &rarr; <strong>Analítica</strong></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MousePointerClick className="h-4 w-4" />
                                        <span>¿Qué ver?</span>
                                    </div>
                                    <p className="text-sm">Ingresos, conversión, funnel y fuentes de leads.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span><strong>Panel Principal:</strong> Comparativa este mes vs anterior</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span><strong>Gráfico de Ingresos:</strong> Tendencia mensual de ventas</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span><strong>Fuentes:</strong> Meta, Facebook, Instagram, TikTok, etc.</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Step 4 - Settings */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">4</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Settings className="h-6 w-6 text-primary" />
                            Configuración
                            <Badge variant="outline" className="ml-2 font-normal">Ajustes</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Menú Lateral &rarr; <strong>Configuración</strong></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <Lock className="h-4 w-4" />
                                        <span>Seguridad</span>
                                    </div>
                                    <p className="text-sm">Cambia tu contraseña cuando lo necesites.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-amber-500">
                            <CardContent className="pt-6">
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Actualiza tu nombre y datos de perfil</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span><strong>Cambiar Contraseña:</strong> Usa la sección de seguridad</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-500" />
                                        <span><strong>Solo Admins:</strong> Clave API y configuración global</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Roles Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl text-primary-foreground">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Roles de Usuario
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50 border-l-4 border-l-primary">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <span>🔑 Administrador</span>
                                    </div>
                                    <ul className="text-sm space-y-1">
                                        <li>• Ve leads de todas las empresas</li>
                                        <li>• Filtra por empresa (cliente)</li>
                                        <li>• Accede a Clave API</li>
                                        <li>• Configura moneda e idioma</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 border-l-4 border-l-muted-foreground">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <span>👤 Cliente</span>
                                    </div>
                                    <ul className="text-sm space-y-1">
                                        <li>• Ve solo sus propios leads</li>
                                        <li>• Su empresa aparece en el header</li>
                                        <li>• Puede cambiar su contraseña</li>
                                        <li>• Sin acceso a Clave API</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-10" />

            <div className="text-center">
                <h3 className="text-lg font-medium mb-4">💡 Consejo</h3>
                <p className="text-muted-foreground">
                    Usa la flecha <strong>&lt;</strong> junto al logo para contraer el menú lateral y ganar espacio.
                </p>
            </div>
        </div>
    )
}
