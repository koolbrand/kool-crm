"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Target,
    Settings,
    PieChart,
    LogOut,
    UserCog,
    Building2,
    FileText,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/login/actions"
import { useSidebar } from "./sidebar-context"

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
        label: "Funnel",
        icon: Target,
        href: "/dashboard/deals/kanban",
    },
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
]

interface SidebarProps {
    isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
    const pathname = usePathname()
    const { isCollapsed, toggle } = useSidebar()

    const allRoutes = isAdmin ? [...routes, ...adminRoutes] : routes

    return (
        <div className={cn(
            "flex flex-col h-full bg-sidebar text-sidebar-foreground overflow-y-auto border-r border-sidebar-border transition-all duration-300",
            isCollapsed ? "w-16" : "w-72"
        )}>
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <Link href="/dashboard" className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground text-xl flex-shrink-0">
                        K
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold ml-3 whitespace-nowrap">
                            Koolgrowth
                        </h1>
                    )}
                </Link>
                {!isCollapsed && (
                    <button
                        onClick={toggle}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Expand button when collapsed */}
            {isCollapsed && (
                <div className="px-3 mb-2">
                    <button
                        onClick={toggle}
                        className="w-full p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors flex justify-center"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 px-3 space-y-1">
                {allRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                            pathname === route.href ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground",
                            isCollapsed ? "justify-center" : "justify-start"
                        )}
                        title={isCollapsed ? route.label : undefined}
                    >
                        <route.icon
                            className={cn(
                                "h-5 w-5 transition-colors flex-shrink-0",
                                pathname === route.href ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                                !isCollapsed && "mr-3"
                            )}
                        />
                        {!isCollapsed && route.label}
                    </Link>
                ))}

                {/* Guide */}
                <Link
                    href="/dashboard/guide"
                    className={cn(
                        "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                        pathname === "/dashboard/guide" ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground",
                        isCollapsed ? "justify-center" : "justify-start"
                    )}
                    title={isCollapsed ? "Guía de Uso" : undefined}
                >
                    <FileText className={cn("h-5 w-5 transition-colors flex-shrink-0", pathname === "/dashboard/guide" ? "text-primary" : "text-muted-foreground group-hover:text-primary", !isCollapsed && "mr-3")} />
                    {!isCollapsed && "Guía de Uso"}
                </Link>

                {/* Settings */}
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition",
                        pathname === "/dashboard/settings" ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground",
                        isCollapsed ? "justify-center" : "justify-start"
                    )}
                    title={isCollapsed ? "Configuración" : undefined}
                >
                    <Settings className={cn("h-5 w-5 transition-colors flex-shrink-0", pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground group-hover:text-primary", !isCollapsed && "mr-3")} />
                    {!isCollapsed && "Configuración"}
                </Link>
            </div>

            {/* Logout */}
            <div className="px-3 py-4">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 group",
                        isCollapsed ? "justify-center px-0" : "justify-start"
                    )}
                    onClick={() => signOut()}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className={cn("h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors flex-shrink-0", !isCollapsed && "mr-3")} />
                    {!isCollapsed && "Logout"}
                </Button>
            </div>
        </div>
    )
}
