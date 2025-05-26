import { NextRequest, NextResponse } from 'next/server'
import { ScraperFactory } from '@/lib/store-scrapers/scraper-factory'

// Cache to store results temporarily (in production, use Redis or similar)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'milk'
  const zip = searchParams.get('zip') || '95616'
  const store = searchParams.get('store') || 'walmart'
  
  // Create cache key
  const cacheKey = `${store}-${query}-${zip}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data)
  }

  try {
    console.log(`Scraping ${store} for query: "${query}" in zip: ${zip}`)
    
    const result = await ScraperFactory.scrapeInventory(store, query, zip)

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)

  } catch (error) {
    console.error(`Error scraping ${store}:`, error)
    
    return NextResponse.json(
      { 
        error: `Failed to scrape ${store} inventory`,
        message: error instanceof Error ? error.message : 'Unknown error',
        query,
        zip,
        store
      },
      { status: 500 }
    )
  }
}

// Handle CORS for development
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 