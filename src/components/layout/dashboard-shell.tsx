'use client'

import { ReactNode } from 'react'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
    children: ReactNode
    isAdmin?: boolean
}

function DashboardShellInner({ children, isAdmin }: DashboardShellProps) {
    const { isCollapsed } = useSidebar()

    return (
        <div className="h-full relative bg-background flex">
            {/* Sidebar - Desktop */}
            <div className={cn(
                "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-sidebar transition-all duration-300",
                isCollapsed ? "w-16" : "w-72"
            )}>
                <Sidebar isAdmin={isAdmin} />
            </div>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen flex flex-col transition-all duration-300",
                isCollapsed ? "md:pl-16" : "md:pl-72"
            )}>
                {children}
            </main>
        </div>
    )
}

export function DashboardShell({ children, isAdmin }: DashboardShellProps) {
    return (
        <SidebarProvider>
            <DashboardShellInner isAdmin={isAdmin}>
                {children}
            </DashboardShellInner>
        </SidebarProvider>
    )
}
