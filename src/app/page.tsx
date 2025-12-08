import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
          Koolgrowth <span className="text-primary">CRM</span>
        </h1>
        <p className="text-muted-foreground">The Growth Operating System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Card Example */}
        <Card className="border-border bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Login
              <Badge variant="outline" className="border-primary text-primary">Pro</Badge>
            </CardTitle>
            <CardDescription>Enter your credentials to access the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@koolgrowth.com" className="bg-background/50 border-input focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-background/50 border-input focus-visible:ring-primary" />
            </div>
            <Button className="w-full font-bold">Sign In</Button>
          </CardContent>
        </Card>

        {/* Brand Colors Showcase */}
        <Card className="border-border bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Design System</CardTitle>
            <CardDescription>Verifying the Neon Mint aesthetic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">Primary</div>
              <div className="h-20 rounded-md bg-card border border-border flex items-center justify-center text-card-foreground">Card</div>
              <div className="h-20 rounded-md bg-accent flex items-center justify-center text-accent-foreground">Accent</div>
              <div className="h-20 rounded-md bg-muted flex items-center justify-center text-muted-foreground">Muted</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
