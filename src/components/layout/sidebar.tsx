"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Target,
    Settings,
    PieChart,
    LogOut,
    UserCog,
    Building2,
    Package,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/login/actions"

const routes = [
    {
        label: "Panel",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Leads",
        icon: Users,
        href: "/dashboard/leads",
    },
    {
        label: "Embudo",
        icon: Target,
        href: "/dashboard/deals/kanban",
    },
    {
        label: "Oportunidades",
        icon: Briefcase,
        href: "/dashboard/deals",
    },
    // {
    //     label: "Guía de Uso",
    //     icon: FileText,
    //     href: "/dashboard/guide",
    // },
    {
        label: "Analítica",
        icon: PieChart,
        href: "/dashboard/analytics",
    },
]

const adminRoutes = [
    {
        label: "Empresas",
        icon: Building2,
        href: "/dashboard/companies",
    },
    {
        label: "Usuarios",
        icon: UserCog,
        href: "/dashboard/clients",
    },
    // {
    //     label: "Productos",
    //     icon: Package,
    //     href: "/dashboard/products",
    // },
    // {
    //     label: "Presupuestos",
    //     icon: FileText,
    //     href: "/dashboard/quotes",
    // },
]

interface SidebarProps {
    isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
    const pathname = usePathname()

    const allRoutes = isAdmin ? [...routes, ...adminRoutes] : routes

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground overflow-y-auto border-r border-sidebar-border">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Placeholder for Logo */}
                        <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground text-xl">K</div>
                    </div>
                    <h1 className="text-2xl font-bold font-sans">
                        Koolgrowth
                    </h1>
                </Link>
                <div className="space-y-1">
                    {allRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                                pathname === route.href ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon
                                    className={cn(
                                        "h-5 w-5 mr-3 transition-colors",
                                        pathname === route.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                    )}
                                />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                    {/* Guide and Settings at the end */}
                    <Link
                        href="/dashboard/guide"
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                            pathname === "/dashboard/guide" ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <FileText
                                className={cn(
                                    "h-5 w-5 mr-3 transition-colors",
                                    pathname === "/dashboard/guide" ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                )}
                            />
                            Guía de Uso
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                            pathname === "/dashboard/settings" ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <Settings
                                className={cn(
                                    "h-5 w-5 mr-3 transition-colors",
                                    pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                )}
                            />
                            Configuración
                        </div>
                    </Link>
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 group"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
