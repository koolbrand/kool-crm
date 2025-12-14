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

      <div className="w-full max-w-md">
        <Card className="border-border bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Login</CardTitle>
                <Badge variant="secondary">Pro</Badge>
            </div>
            <CardDescription>Enter your credentials to access the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hola@koolbrand.com" className="bg-background/50 border-input focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-background/50 border-input focus-visible:ring-primary" />
            </div>
            <Button className="w-full font-bold">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
