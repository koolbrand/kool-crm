import { login } from './login/actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const error = params.error

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-8 relative overflow-hidden">
             {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
                <h1 className="text-4xl font-bold tracking-tighter text-foreground">
                    Koolgrowth <span className="text-primary">CRM</span>
                </h1>
                <p className="text-muted-foreground">The Growth Operating System</p>
            </div>

            <div className="w-full max-w-md relative z-10">
                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Login</CardTitle>
                            <Badge variant="secondary">Pro</Badge>
                        </div>
                        <CardDescription>Enter your credentials to access the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="hola@koolbrand.com" required className="bg-background/50 border-input focus-visible:ring-primary" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" placeholder="••••••••" required className="bg-background/50 border-input focus-visible:ring-primary" />
                            </div>
                            <Button formAction={login} className="w-full font-bold">Sign In</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
