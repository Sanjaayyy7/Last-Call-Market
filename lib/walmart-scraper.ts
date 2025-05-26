import { chromium, Browser, Page } from 'playwright'

export interface WalmartProduct {
  id: string
  name: string
  price: string
  originalPrice?: string
  imageUrl: string
  availability: 'in-stock' | 'out-of-stock' | 'limited'
  storeName: string
  storeId: string
  url: string
}

export interface WalmartStore {
  id: string
  name: string
  address: string
  distance?: string
}

export class WalmartScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      ignoreHTTPSErrors: true
    })

    this.page = await context.newPage()

    // Set additional headers to avoid detection
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    })
  }

  async findStores(zip: string): Promise<WalmartStore[]> {
    if (!this.page) throw new Error('Scraper not initialized')

    try {
      console.log(`Finding Walmart stores near ${zip}`)
      const storeFinderUrl = `https://www.walmart.com/store/finder?location=${zip}`
      
      await this.page.goto(storeFinderUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Wait for store results to load
      await this.page.waitForTimeout(5000)

      // Try multiple selectors for store elements
      const stores: WalmartStore[] = await this.page.evaluate(() => {
        const stores: WalmartStore[] = []
        
        // Try different selectors that Walmart might use
        const selectors = [
          '[data-automation-id="store-details"]',
          '.store-card',
          '.store-item',
          '[data-testid="store-card"]',
          '.StoreCard'
        ]
        
        let storeElements: NodeListOf<Element> | null = null
        
        for (const selector of selectors) {
          storeElements = document.querySelectorAll(selector)
          if (storeElements.length > 0) {
            console.log(`Found stores using selector: ${selector}`)
            break
          }
        }
        
        if (!storeElements || storeElements.length === 0) {
          // Fallback: look for any element containing store information
          const allElements = document.querySelectorAll('*')
          for (const element of allElements) {
            if (element.textContent?.toLowerCase().includes('walmart supercenter') ||
                element.textContent?.toLowerCase().includes('neighborhood market')) {
              console.log('Found store via text content')
              // Extract basic info from text content
              const text = element.textContent
              const addressMatch = text.match(/\d+\s+[A-Za-z\s]+(?:St|Ave|Rd|Blvd|Dr|Way|Ln)/i)
              if (addressMatch) {
                stores.push({
                  id: 'walmart-fallback',
                  name: 'Walmart Supercenter',
                  address: addressMatch[0]
                })
                break
              }
            }
          }
          return stores
        }
        
        storeElements.forEach((element, index) => {
          if (index >= 3) return // Limit to first 3 stores
          
          try {
            // Try multiple selectors for store name
            const nameSelectors = [
              '[data-automation-id="store-name"]',
              '.store-name',
              'h3',
              'h2',
              '[data-testid="store-name"]'
            ]
            
            let nameElement: Element | null = null
            for (const selector of nameSelectors) {
              nameElement = element.querySelector(selector)
              if (nameElement) break
            }
            
            // Try multiple selectors for address
            const addressSelectors = [
              '[data-automation-id="store-address"]',
              '.store-address',
              '.address',
              '[data-testid="store-address"]'
            ]
            
            let addressElement: Element | null = null
            for (const selector of addressSelectors) {
              addressElement = element.querySelector(selector)
              if (addressElement) break
            }
            
            // Try multiple selectors for distance
            const distanceSelectors = [
              '[data-automation-id="store-distance"]',
              '.store-distance',
              '.distance',
              '[data-testid="store-distance"]'
            ]
            
            let distanceElement: Element | null = null
            for (const selector of distanceSelectors) {
              distanceElement = element.querySelector(selector)
              if (distanceElement) break
            }
            
            if (nameElement || addressElement) {
              const storeId = element.getAttribute('data-store-id') || 
                            element.getAttribute('data-testid') || 
                            `store-${index}`
              
              stores.push({
                id: storeId,
                name: nameElement?.textContent?.trim() || 'Walmart Store',
                address: addressElement?.textContent?.trim() || `Near ${zip}`,
                distance: distanceElement?.textContent?.trim()
              })
            }
          } catch (error) {
            console.error('Error extracting store info:', error)
          }
        })
        
        return stores
      })

      console.log(`Found ${stores.length} stores`)
      return stores.length > 0 ? stores : [{
        id: 'walmart-generic',
        name: 'Walmart Supercenter',
        address: `Near ${zip}`
      }]
      
    } catch (error) {
      console.error('Error finding stores:', error)
      return [{
        id: 'walmart-generic',
        name: 'Walmart Supercenter',
        address: `Near ${zip}`
      }]
    }
  }

  async searchProducts(query: string, zip: string, store: WalmartStore): Promise<WalmartProduct[]> {
    if (!this.page) throw new Error('Scraper not initialized')

    try {
      console.log(`Searching for "${query}" in ${store.name}`)
      
      // Navigate to search results
      const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(query)}&location=${zip}`
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Wait for products to load
      await this.page.waitForTimeout(8000)

      // Extract product information
      const products: WalmartProduct[] = await this.page.evaluate(({ storeName, storeId }) => {
        const products: any[] = []
        
        // Try multiple selectors for product tiles
        const selectors = [
          '[data-automation-id="product-tile"]',
          '[data-testid="item-stack"]',
          '.search-result-gridview-item',
          '.Grid-col',
          '[data-testid="list-view"]',
          '.mb1'
        ]
        
        let productElements: NodeListOf<Element> | null = null
        
        for (const selector of selectors) {
          productElements = document.querySelectorAll(selector)
          if (productElements.length > 0) {
            console.log(`Found products using selector: ${selector}`)
            break
          }
        }
        
        if (!productElements || productElements.length === 0) {
          console.log('No products found with any selector')
          return products
        }
        
        productElements.forEach((element, index) => {
          if (index >= 20) return // Limit to first 20 products
          
          try {
            // Try multiple selectors for product name
            const nameSelectors = [
              '[data-automation-id="product-title"]',
              'span[data-automation-id="product-title"]',
              'a[data-automation-id="product-title"]',
              '[data-testid="product-title"]',
              'h3 a',
              'h3 span',
              '.product-title',
              'a[href*="/ip/"]'
            ]
            
            let nameElement: Element | null = null
            for (const selector of nameSelectors) {
              nameElement = element.querySelector(selector)
              if (nameElement && nameElement.textContent?.trim()) break
            }
            
            // Try multiple selectors for price
            const priceSelectors = [
              '[data-automation-id="product-price"]',
              '.price-current',
              '[data-testid="price-current"]',
              '.price',
              '.price-main',
              '.price-display',
              'span[itemprop="price"]'
            ]
            
            let priceElement: Element | null = null
            for (const selector of priceSelectors) {
              priceElement = element.querySelector(selector)
              if (priceElement && priceElement.textContent?.includes('$')) break
            }
            
            // Extract image
            const imageElement = element.querySelector('img') as HTMLImageElement
            
            // Extract product URL
            const linkElement = element.querySelector('a[href*="/ip/"]') as HTMLAnchorElement
            
            // Check availability
            const outOfStockElement = element.querySelector('[data-automation-id="out-of-stock"]') ||
                                     element.querySelector('.out-of-stock') ||
                                     (element.textContent?.toLowerCase().includes('out of stock') ? element : null)
            
            const limitedStockElement = element.querySelector('[data-automation-id="limited-stock"]') ||
                                       (element.textContent?.toLowerCase().includes('limited stock') ? element : null)

            if (nameElement && priceElement) {
              const name = nameElement.textContent?.trim() || 'Unknown Product'
              const priceText = priceElement.textContent?.trim() || '$0.00'
              const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || ''
              const productUrl = linkElement?.href || ''
              
              let availability: 'in-stock' | 'out-of-stock' | 'limited' = 'in-stock'
              if (outOfStockElement) {
                availability = 'out-of-stock'
              } else if (limitedStockElement) {
                availability = 'limited'
              }

              products.push({
                id: `walmart-${index}-${Date.now()}`,
                name,
                price: priceText,
                imageUrl,
                availability,
                storeName,
                storeId,
                url: productUrl
              })
            }
          } catch (error) {
            console.error('Error extracting product:', error)
          }
        })
        
        return products
      }, { storeName: store.name, storeId: store.id })

      console.log(`Extracted ${products.length} products`)
      return products
      
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}

export async function scrapeWalmartInventory(query: string, zip: string) {
  const scraper = new WalmartScraper()
  
  try {
    await scraper.initialize()
    
    // Find stores
    const stores = await scraper.findStores(zip)
    const targetStore = stores[0]
    
    // Search for products
    const products = await scraper.searchProducts(query, zip, targetStore)
    
    return {
      query,
      zip,
      store: targetStore,
      products,
      timestamp: new Date().toISOString(),
      totalResults: products.length
    }
    
  } finally {
    await scraper.close()
  }
} 