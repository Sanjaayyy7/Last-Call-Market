// EmptyState Component - Reusable empty state display

import { Package } from "lucide-react"

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No products found</h3>
      <p className="text-muted-foreground">
        Try searching in a different location or check back later.
      </p>
    </div>
  )
} 