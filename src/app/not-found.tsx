import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <p className="text-muted-foreground">The page you are looking for does not exist.</p>
            <Link href="/" className="text-primary hover:underline font-medium">
                Back to Home
            </Link>
        </div>
    )
}
