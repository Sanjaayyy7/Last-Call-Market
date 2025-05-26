"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, ShoppingCart, ExternalLink, Package, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  imageUrl: string
  availability: 'in-stock' | 'out-of-stock' | 'limited'
  url: string
  category?: string
}

interface InventoryResponse {
  query: string
  zip: string
  store: {
    id: string
    name: string
    address: string
  }
  products: Product[]
  timestamp: string
  totalResults: number
}

export default function StorePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const storeSlug = params.storeSlug as string
  const zip = searchParams.get('zip') || '95616'
  
  const [inventory, setInventory] = useState<InventoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert slug back to store name for display
  const getStoreDisplayName = (slug: string) => {
    const storeNames: Record<string, string> = {
      'safeway': 'Safeway',
      'trader-joes': "Trader Joe's",
      'save-mart': 'Save Mart',
      'walmart': 'Walmart',
      'the-marketplace': 'The Marketplace',
      'westlake-market': 'Westlake Market',
      'davis-food-co-op': 'Davis Food Co-op',
      'nugget-markets': 'Nugget Markets',
      'myu-myu': 'Myu Myu',
      'ho-ho-market': 'Ho Ho Market',
      'international-food-market': 'International Food Market',
      'grocery-outlet': 'Grocery Outlet'
    }
    return storeNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const storeName = getStoreDisplayName(storeSlug)
      console.log(`Fetching inventory for "${storeName}" in ${zip}`)
      
      const response = await fetch(`/api/inventory?query=food&zip=${encodeURIComponent(zip)}&store=${encodeURIComponent(storeName)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load inventory')
      }
      
      const result: InventoryResponse = await response.json()
      
      if (result.products.length === 0) {
        throw new Error('No items found for this location.')
      }
      
      setInventory(result)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [storeSlug, zip])

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ In Stock</Badge>
      case 'out-of-stock':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">✗ Out of Stock</Badge>
      case 'limited':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⚠ Limited Stock</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Available</Badge>
    }
  }

  const formatPrice = (priceStr: string) => {
    const cleaned = priceStr.replace(/[^\d.,]/g, '')
    return cleaned ? `$${cleaned}` : priceStr
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/LastCallLogo.png"
                alt="Last Call Market Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold">Last Call Market</span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/find-store" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Stores
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-8 md:py-12">
          <div className="container px-4 md:px-6">
            {/* Store Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/find-store" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Stores
                  </Link>
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-2">
                {getStoreDisplayName(storeSlug)}
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Live inventory for ZIP code {zip}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-lg font-medium">Loading inventory...</p>
                <p className="text-sm text-muted-foreground">Fetching live product data</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="max-w-md mx-auto">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Inventory not available</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchInventory}
                      className="ml-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Inventory Display */}
            {inventory && !loading && (
              <div>
                {/* Inventory Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Available Products</h2>
                    <p className="text-sm text-muted-foreground">
                      {inventory.totalResults} products • Updated: {new Date(inventory.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {inventory.products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-product.svg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>
                          
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-blue-600">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Availability */}
                          <div className="flex items-center justify-between">
                            {getAvailabilityBadge(product.availability)}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={product.availability === 'out-of-stock'}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                            {product.url && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                asChild
                              >
                                <a 
                                  href={product.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {inventory.products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground">
                      Try searching in a different location or check back later.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/images/LastCallLogo.png"
              alt="Last Call Market Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Last Call Market. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Cookies
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
} 