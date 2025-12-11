'use client'

import { useState, useTransition, useEffect } from 'react'
import { Product, createProduct, updateProduct, deleteProduct } from './actions'
import { useRouter } from 'next/navigation'
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from "@/components/ui/switch"

interface ProductsTableProps {
    products: Product[]
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
    const router = useRouter()
    const [products, setProducts] = useState(initialProducts)
    const [searchQuery, setSearchQuery] = useState('')
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setProducts(initialProducts)
    }, [initialProducts])

    // Add Modal
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Edit Modal
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    async function handleAddProduct(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await createProduct(formData)
            if (result.error) {
                setError(result.error)
            } else {
                setAddModalOpen(false)
                // Optimistic update or refresh handled by page revalidate?
                // For simplicity, we can let router.refresh() do it if actions revalidate.
            }
        })
    }

    async function handleEditProduct(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await updateProduct(formData)
            if (result.error) {
                setError(result.error)
            } else {
                setEditModalOpen(false)
                setEditingProduct(null)
            }
        })
    }

    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        setProducts(initialProducts)

        // Polling logic
        const currentIds = new Set(initialProducts.map(p => p.id))
        const stillDeletingIds = new Set(
            Array.from(deletingIds).filter(id => currentIds.has(id))
        )

        if (stillDeletingIds.size !== deletingIds.size) {
            setDeletingIds(stillDeletingIds)
        }

        if (stillDeletingIds.size > 0) {
            const timer = setTimeout(() => {
                router.refresh()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [initialProducts, deletingIds])

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return

        setDeletingIds(prev => new Set(prev).add(id))

        startTransition(async () => {
            const result = await deleteProduct(id)
            if (result.error) {
                alert('Error deleting product: ' + result.error)
                setDeletingIds(prev => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
            } else {
                router.refresh()
            }
        })
    }

    function openEdit(product: Product) {
        setEditingProduct(product)
        setEditModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                </div>
                <Button onClick={() => setAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Button>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No products found. Add your first product!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} className={deletingIds.has(product.id) ? "opacity-50 pointer-events-none bg-muted/50" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {deletingIds.has(product.id) ? (
                                                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    <Package className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.active ? 'default' : 'secondary'} className={product.active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                                            {product.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(product)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-500 focus:text-red-500">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Modal */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogDescription>Create a new product or service.</DialogDescription>
                    </DialogHeader>
                    <form action={handleAddProduct} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required placeholder="e.g. Website Design" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input id="currency" name="currency" defaultValue="USD" readOnly className="bg-muted" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Product details..." />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <form action={handleEditProduct} className="space-y-4">
                        <input type="hidden" name="id" value={editingProduct?.id || ''} />
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" name="name" defaultValue={editingProduct?.name} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price</Label>
                                <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-currency">Currency</Label>
                                <Input id="edit-currency" name="currency" defaultValue={editingProduct?.currency || 'USD'} readOnly className="bg-muted" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea id="edit-description" name="description" defaultValue={editingProduct?.description || ''} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
                            <Switch id="edit-active" name="active" defaultChecked={editingProduct?.active} />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
