import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, Users, Briefcase, TrendingUp, Phone, CheckCircle2, ArrowRight, PieChart, Info, MapPin, MousePointerClick } from "lucide-react"

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
                {/* Step 1 */}
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
                                    <p className="text-sm">Clic en el botón <strong>+ Nuevo Lead</strong> arriba a la derecha.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-violet-500">
                            <CardContent className="pt-6">
                                <p className="mb-4 text-muted-foreground">
                                    Registra los datos básicos.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Guarda Nombre, Email y Teléfono.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Estado inicial automático: <strong>New (Nuevo)</strong>.</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">2</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Cualificación
                            <Badge variant="outline" className="ml-2 font-normal">Edición</Badge>
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
                                    <p className="text-sm"><strong>Haz clic en el nombre</strong> del Lead en la tabla para abrir la ficha rápida.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <p className="text-muted-foreground">
                            Llama al cliente. Si no hay interés, cambia el estado a <strong>Lost</strong> en la ficha. Si hay interés, ¡pasa al siguiente paso!
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">3</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Crear el Deal
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">Conversión</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Desde la ficha de edición del Lead.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MousePointerClick className="h-4 w-4" />
                                        <span>¿Cómo?</span>
                                    </div>
                                    <p className="text-sm">Clic en el botón <strong>"Crear Deal"</strong> (abajo a la izquierda) o <strong>"Acciones &gt; Convertir a Deal"</strong>.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-l-4 border-l-pink-500">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Esto transformará al Lead en una oportunidad comercial activa y lo moverá al Pipeline.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">4</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Mover el Pipeline
                            <Badge variant="outline" className="ml-2 font-normal">Venta</Badge>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MapPin className="h-4 w-4" />
                                        <span>¿Dónde?</span>
                                    </div>
                                    <p className="text-sm">Menú Lateral &rarr; <strong>Pipeline</strong></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <MousePointerClick className="h-4 w-4" />
                                        <span>¿Cómo?</span>
                                    </div>
                                    <p className="text-sm"><strong>Arrastra y suelta</strong> las tarjetas entre columnas. Haz clic en una tarjeta para editar valor/título.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Step 5 - Analytics (New) */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-none bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-border">5</div>
                    <div className="space-y-4 flex-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Resultados
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
                                    <p className="text-sm">Revisa tus ingresos totales, conversión y fuentes de leads.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-10" />

            <div className="text-center">
                <h3 className="text-lg font-medium mb-4">¿Tienes dudas?</h3>
                <p className="text-muted-foreground">
                    Sigue esta guía paso a paso y mantén tu CRM actualizado diariamente.
                </p>
            </div>
        </div>
    )
}
