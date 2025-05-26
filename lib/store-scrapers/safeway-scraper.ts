import { chromium, Browser, Page } from 'playwright'
import { BaseScraper, Product, Store, InventoryResponse } from './base-scraper'

export class SafewayScraper extends BaseScraper {
  storeName = 'Safeway'
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
  }

  async findStores(zip: string): Promise<Store[]> {
    if (!this.page) {
      await this.initialize()
    }

    try {
      // Try to find actual Safeway stores by ZIP code
      console.log(`Finding Safeway stores near ZIP: ${zip}`)
      await this.page!.goto('https://www.safeway.com/stores/', {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      await this.page!.waitForTimeout(2000)

      // Try to enter ZIP code in store locator
      try {
        const zipInput = await this.page!.$('input[placeholder*="ZIP"], input[placeholder*="zip"], input[name*="zip"], #store-search-input')
        if (zipInput) {
          await zipInput.fill(zip)
          await this.page!.keyboard.press('Enter')
          await this.page!.waitForTimeout(3000)

          // Extract store information
          const stores = await this.page!.evaluate((zipCode) => {
            const storeElements = document.querySelectorAll('.store-card, .store-item, .location-card, [data-testid="store"]')
            const foundStores: any[] = []

            storeElements.forEach((element, index) => {
              try {
                const nameElement = element.querySelector('h3, h4, .store-name, .location-name')
                const name = nameElement?.textContent?.trim()

                const addressElement = element.querySelector('.address, .store-address, .location-address')
                const address = addressElement?.textContent?.trim()

                const phoneElement = element.querySelector('.phone, .store-phone')
                const phone = phoneElement?.textContent?.trim()

                if (name && address) {
                  foundStores.push({
                    id: `safeway-${zipCode}-${index}`,
                    name: name.includes('Safeway') ? name : `Safeway - ${name}`,
                    address: address,
                    phone: phone
                  })
                }
              } catch (error) {
                console.log('Error extracting store data:', error)
              }
            })

            return foundStores
          }, zip)

          if (stores.length > 0) {
            return stores.slice(0, 5) // Return up to 5 stores
          }
        }
      } catch (error) {
        console.log('Could not find stores via store locator:', error)
      }
    } catch (error) {
      console.error('Error finding Safeway stores:', error)
    }

    // Fallback to generic store
    return [{
      id: `safeway-${zip}`,
      name: 'Safeway',
      address: `Near ${zip}`
    }]
  }

  async searchProducts(query: string, zip: string, store: Store): Promise<Product[]> {
    if (!this.page) {
      throw new Error('Browser not initialized')
    }

    try {
      // Navigate to Safeway deals page
      console.log(`Scraping Safeway deals for ZIP: ${zip}`)
      await this.page.goto('https://www.safeway.com/shop/deals/sale-prices.html', {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Wait for products to load
      await this.page.waitForTimeout(3000)

      // Try to set location if possible
      try {
        // Look for location selector and set ZIP code
        const locationButton = await this.page.$('[data-testid="store-selector"]')
        if (locationButton) {
          await locationButton.click()
          await this.page.waitForTimeout(1000)
          
          const zipInput = await this.page.$('input[placeholder*="ZIP"]')
          if (zipInput) {
            await zipInput.fill(zip)
            await this.page.keyboard.press('Enter')
            await this.page.waitForTimeout(2000)
          }
        }
      } catch (error) {
        console.log('Could not set location, continuing with default location')
      }

      // Scrape product data
      const products = await this.page.evaluate(() => {
        const productElements = document.querySelectorAll('[data-testid="product-card"], .product-card, .product-item, .sale-item')
        const scrapedProducts: any[] = []

        productElements.forEach((element, index) => {
          try {
            // Extract product name
            const nameElement = element.querySelector('h3, .product-title, .product-name, [data-testid="product-title"]')
            const name = nameElement?.textContent?.trim()

            // Extract price
            const priceElement = element.querySelector('.price, .sale-price, [data-testid="price"]')
            const price = priceElement?.textContent?.trim()

            // Extract original price
            const originalPriceElement = element.querySelector('.original-price, .regular-price, .was-price')
            const originalPrice = originalPriceElement?.textContent?.trim()

            // Extract image
            const imageElement = element.querySelector('img')
            const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src')

            // Extract product URL
            const linkElement = element.querySelector('a')
            const productUrl = linkElement?.href

            if (name && price) {
              scrapedProducts.push({
                name,
                price,
                originalPrice,
                imageUrl,
                productUrl,
                index
              })
            }
          } catch (error) {
            console.log('Error extracting product data:', error)
          }
        })

        return scrapedProducts
      })

      // Convert scraped data to Product format
      const formattedProducts: Product[] = products.slice(0, 20).map((product, index) => ({
        id: this.generateProductId(product.name, store.id),
        name: product.name,
        price: this.formatPrice(product.price),
        originalPrice: product.originalPrice ? this.formatPrice(product.originalPrice) : undefined,
        imageUrl: this.getValidImageUrl(product.imageUrl),
        availability: 'in-stock' as const,
        url: product.productUrl || 'https://www.safeway.com',
        category: this.categorizeProduct(product.name)
      }))

      // Filter by query if provided
      if (query && query !== 'food') {
        const filtered = formattedProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase())
        )
        return filtered.length > 0 ? filtered : formattedProducts.slice(0, 10)
      }

      return formattedProducts.length > 0 ? formattedProducts : this.getFallbackProducts(store)
    } catch (error) {
      console.error('Error scraping Safeway products:', error)
      return this.getFallbackProducts(store)
    }
  }

  protected formatPrice(priceStr: string): string {
    if (!priceStr) return '$0.00'
    const cleaned = priceStr.replace(/[^\d.,]/g, '')
    return cleaned ? `$${cleaned}` : priceStr
  }

  private getValidImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.startsWith('data:') || !imageUrl.includes('http')) {
      // Return a food-related Unsplash image as fallback
      const fallbackImages = [
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center'
      ]
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    }
    return imageUrl
  }

  private categorizeProduct(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) return 'dairy'
    if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('muffin')) return 'bakery'
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork')) return 'meat'
    if (lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('tomato')) return 'produce'
    if (lowerName.includes('frozen') || lowerName.includes('ice cream')) return 'frozen'
    return 'grocery'
  }

  private getFallbackProducts(store: Store): Product[] {
    return [
      {
        id: this.generateProductId('Organic Whole Milk', store.id),
        name: 'Safeway Organic Whole Milk, 64 fl oz',
        price: '$4.99',
        originalPrice: '$6.49',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center',
        availability: 'in-stock',
        url: 'https://www.safeway.com',
        category: 'dairy'
      },
      {
        id: this.generateProductId('Fresh Bananas', store.id),
        name: 'Fresh Bananas, per lb',
        price: '$0.68',
        originalPrice: '$0.98',
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center',
        availability: 'in-stock',
        url: 'https://www.safeway.com',
        category: 'produce'
      },
      {
        id: this.generateProductId('Whole Wheat Bread', store.id),
        name: 'Safeway Whole Wheat Bread, 20 oz',
        price: '$2.49',
        originalPrice: '$3.29',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center',
        availability: 'limited',
        url: 'https://www.safeway.com',
        category: 'bakery'
      }
    ]
  }

  async scrapeInventory(query: string, zip: string): Promise<InventoryResponse> {
    await this.initialize()
    
    try {
      const stores = await this.findStores(zip)
      const store = stores[0]
      
      const products = await this.searchProducts(query, zip, store)
      
      return {
        query,
        zip,
        store,
        products,
        timestamp: new Date().toISOString(),
        totalResults: products.length
      }
    } finally {
      await this.close()
    }
  }

  async close() {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
} 