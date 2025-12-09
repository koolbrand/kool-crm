'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
    dateFrom: string
    dateTo: string
    onDateFromChange: (date: string) => void
    onDateToChange: (date: string) => void
}

const presets = [
    {
        label: 'Hoy', getValue: () => {
            const today = new Date()
            return { from: today, to: today }
        }
    },
    {
        label: '7 días', getValue: () => {
            const today = new Date()
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return { from: weekAgo, to: today }
        }
    },
    {
        label: '30 días', getValue: () => {
            const today = new Date()
            const monthAgo = new Date(today)
            monthAgo.setDate(today.getDate() - 30)
            return { from: monthAgo, to: today }
        }
    },
    {
        label: 'Este mes', getValue: () => {
            const today = new Date()
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            return { from: firstDay, to: today }
        }
    },
    {
        label: 'Mes anterior', getValue: () => {
            const today = new Date()
            const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
            return { from: firstDay, to: lastDay }
        }
    },
    {
        label: 'Este año', getValue: () => {
            const today = new Date()
            const firstDay = new Date(today.getFullYear(), 0, 1)
            return { from: firstDay, to: today }
        }
    },
]

export function DateRangePicker({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangePickerProps) {
    const [open, setOpen] = useState(false)

    const dateRange: DateRange | undefined = dateFrom || dateTo
        ? {
            from: dateFrom ? new Date(dateFrom) : undefined,
            to: dateTo ? new Date(dateTo) : undefined
        }
        : undefined

    const handleRangeSelect = (range: DateRange | undefined) => {
        if (range?.from) {
            onDateFromChange(format(range.from, 'yyyy-MM-dd'))
        } else {
            onDateFromChange('')
        }
        if (range?.to) {
            onDateToChange(format(range.to, 'yyyy-MM-dd'))
        } else if (range?.from && !range?.to) {
            // If only from is selected, set to as well for single day
            onDateToChange('')
        } else {
            onDateToChange('')
        }
    }

    const handlePresetSelect = (preset: typeof presets[0]) => {
        const { from, to } = preset.getValue()
        onDateFromChange(format(from, 'yyyy-MM-dd'))
        onDateToChange(format(to, 'yyyy-MM-dd'))
        setOpen(false)
    }

    const handleClear = () => {
        onDateFromChange('')
        onDateToChange('')
        setOpen(false)
    }

    const displayText = dateFrom && dateTo
        ? `${format(new Date(dateFrom), 'd MMM', { locale: es })} - ${format(new Date(dateTo), 'd MMM', { locale: es })}`
        : dateFrom
            ? `Desde ${format(new Date(dateFrom), 'd MMM', { locale: es })}`
            : dateTo
                ? `Hasta ${format(new Date(dateTo), 'd MMM', { locale: es })}`
                : 'Período'

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[160px] justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className={dateFrom || dateTo ? 'text-foreground' : 'text-muted-foreground'}>
                            {displayText}
                        </span>
                    </div>
                    {(dateFrom || dateTo) ? (
                        <X
                            className="h-4 w-4 opacity-50 hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        />
                    ) : (
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Presets sidebar */}
                    <div className="border-r border-border p-2 space-y-1 min-w-[100px]">
                        <p className="text-xs font-medium text-muted-foreground px-2 py-1">Rápido</p>
                        {presets.map(preset => (
                            <Button
                                key={preset.label}
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePresetSelect(preset)}
                                className="w-full justify-start text-xs h-7"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="p-2">
                        <Calendar
                            mode="range"
                            defaultMonth={dateFrom ? new Date(dateFrom) : new Date()}
                            selected={dateRange}
                            onSelect={handleRangeSelect}
                            numberOfMonths={2}
                        />
                    </div>
                </div>

                {(dateFrom || dateTo) && (
                    <div className="border-t border-border p-2 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            {dateFrom && dateTo && (
                                `${format(new Date(dateFrom), 'd MMM yyyy', { locale: es })} - ${format(new Date(dateTo), 'd MMM yyyy', { locale: es })}`
                            )}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-xs h-7"
                        >
                            Limpiar
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
