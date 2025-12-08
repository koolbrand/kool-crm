"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { useState, useEffect } from "react"

interface MobileSidebarProps {
    isAdmin?: boolean
}

export const MobileSidebar = ({ isAdmin = false }: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-sidebar border-0 text-white w-72">
                <Sidebar isAdmin={isAdmin} />
            </SheetContent>
        </Sheet>
    )
}
