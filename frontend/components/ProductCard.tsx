// ProductCard Component - Reusable product display component

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ExternalLink, Package } from "lucide-react"
import { Product } from '../types'
import { formatPrice } from '../utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
  )
} 