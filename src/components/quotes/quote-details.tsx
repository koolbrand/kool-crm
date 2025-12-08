'use client'

import { useState, useTransition } from 'react'
import { Quote, QuoteItem, updateQuote, addQuoteItem, deleteQuoteItem } from '@/app/dashboard/quotes/actions'
import { Product } from '@/app/dashboard/products/actions'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, ArrowLeft, Printer, Send } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface QuoteDetailsProps {
    quote: Quote
    items: QuoteItem[]
    products: Product[]
}

export function QuoteDetails({ quote, items, products }: QuoteDetailsProps) {
    const [isPending, startTransition] = useTransition()

    // Status State
    const [status, setStatus] = useState(quote.status)

    // Add Item State
    const [selectedProductId, setSelectedProductId] = useState<string>('')
    const [description, setDescription] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [unitPrice, setUnitPrice] = useState(0)

    function handleProductChange(productId: string) {
        setSelectedProductId(productId)
        if (productId === 'custom') {
            setDescription('')
            setUnitPrice(0)
        } else {
            const product = products.find(p => p.id === productId)
            if (product) {
                setDescription(product.name)
                setUnitPrice(product.price)
            }
        }
    }

    async function handleStatusChange(newStatus: Quote['status']) {
        setStatus(newStatus)
        startTransition(async () => {
            await updateQuote(quote.id, newStatus, quote.valid_until || new Date().toISOString())
        })
    }

    async function handleAddItem() {
        if (!description || quantity <= 0) return

        startTransition(async () => {
            const result = await addQuoteItem(quote.id, selectedProductId === 'custom' ? null : selectedProductId, description, quantity, unitPrice)
            if (result.success) {
                // Reset form
                setSelectedProductId('')
                setDescription('')
                setQuantity(1)
                setUnitPrice(0)
            } else {
                alert('Error adding item')
            }
        })
    }

    async function handleDeleteItem(itemId: string) {
        if (!confirm('Remove this item?')) return
        startTransition(async () => {
            await deleteQuoteItem(itemId, quote.id)
        })
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/quotes"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quote #{quote.id.substring(0, 8).toUpperCase()}</h1>
                        <p className="text-muted-foreground">For: <span className="font-semibold text-foreground">{quote.leads?.name}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={status} onValueChange={(v) => handleStatusChange(v as any)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                    <Button>
                        <Send className="h-4 w-4 mr-2" /> Send
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6 w-[40%]">Description</TableHead>
                                        <TableHead className="w-[15%] text-right">Qty</TableHead>
                                        <TableHead className="w-[20%] text-right">Price</TableHead>
                                        <TableHead className="w-[20%] text-right">Total</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No items yet. Add products below.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Add Item Form */}
                    <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-12 md:col-span-4">
                                    <Label className="text-xs mb-1.5 block">Product</Label>
                                    <Select value={selectedProductId} onValueChange={handleProductChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Custom Item / Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom Item</SelectItem>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <Label className="text-xs mb-1.5 block">Description</Label>
                                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Item description" />
                                </div>
                                <div className="col-span-6 md:col-span-1">
                                    <Label className="text-xs mb-1.5 block">Qty</Label>
                                    <Input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Label className="text-xs mb-1.5 block">Price</Label>
                                    <Input type="number" min="0" step="0.01" value={unitPrice} onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="col-span-12 md:col-span-1">
                                    <Button onClick={handleAddItem} disabled={!description || isPending} className="w-full">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}</span>
                            </div>
                            <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
                                <div className="flex justify-between">
                                    <span>Issued</span>
                                    <span>{format(new Date(quote.created_at), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valid Until</span>
                                    <span>{quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
