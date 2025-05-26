// LoadingState Component - Reusable loading indicator

import { Loader2 } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-lg font-medium">Loading inventory...</p>
      <p className="text-sm text-muted-foreground">Fetching live product data</p>
    </div>
  )
} 