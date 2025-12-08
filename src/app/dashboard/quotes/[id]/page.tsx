import { getQuoteDetails } from '../actions'
import { getProducts } from '../../products/actions'
import { QuoteDetails } from '@/components/quotes/quote-details'
import { notFound } from 'next/navigation'

interface PageProps {
    params: { id: string }
}

export default async function QuotePage({ params }: PageProps) {
    const { id } = params

    // Fetch products for the selector
    const products = await getProducts()

    // Fetch quote and items
    const result = await getQuoteDetails(id)

    if ('error' in result || !result.quote) {
        notFound()
    }

    return (
        <QuoteDetails
            quote={result.quote}
            items={result.items}
            products={products}
        />
    )
}
