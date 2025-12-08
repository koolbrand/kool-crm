import { getProducts } from './actions'
import { ProductsTable } from './products-table'
import { Package } from 'lucide-react'

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your product and service catalog.</p>
                </div>
            </div>

            <ProductsTable products={products} />
        </div>
    )
}
