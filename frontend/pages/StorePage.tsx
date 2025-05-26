"use client"

// StorePage - Clean, consolidated store inventory page
// Handles all "Grab a bag" functionality with minimal, organized code

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Import consolidated frontend modules
import { InventoryResponse } from '../types'
import { getStoreDisplayName, fetchInventory } from '../utils'
import { ProductCard, LoadingState, ErrorState, EmptyState } from '../components'

export default function StorePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const storeSlug = params.storeSlug as string
  const zip = searchParams.get('zip') || '95616'
  
  const [inventory, setInventory] = useState<InventoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInventory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const storeName = getStoreDisplayName(storeSlug)
      console.log(`Fetching inventory for "${storeName}" in ${zip}`)
      
      const result = await fetchInventory(storeName, zip)
      setInventory(result)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [storeSlug, zip])

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
            {loading && <LoadingState />}

            {/* Error State */}
            {error && !loading && <ErrorState error={error} onRetry={loadInventory} />}

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
                {inventory.products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {inventory.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
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