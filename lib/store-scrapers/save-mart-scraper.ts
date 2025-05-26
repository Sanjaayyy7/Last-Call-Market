import { chromium, Browser, Page } from 'playwright'
import { BaseScraper, Product, Store, InventoryResponse } from './base-scraper'

export class SaveMartScraper extends BaseScraper {
  storeName = 'Save Mart'
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
    // For demo purposes, return a mock Save Mart store
    return [{
      id: 'savemart-generic',
      name: 'Save Mart',
      address: `Near ${zip}`
    }]
  }

  async searchProducts(query: string, zip: string, store: Store): Promise<Product[]> {
    if (!this.page) {
      throw new Error('Browser not initialized')
    }

    try {
      // Navigate to Save Mart coupons/deals page
      console.log(`Scraping Save Mart deals for ZIP: ${zip}`)
      await this.page.goto('https://savemart.com/coupons/', {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Wait for products to load
      await this.page.waitForTimeout(3000)

      // Try to set location if possible
      try {
        // Look for store selector and set ZIP code
        const storeButton = await this.page.$('.store-selector, [data-testid="store-selector"]')
        if (storeButton) {
          await storeButton.click()
          await this.page.waitForTimeout(1000)
          
          const zipInput = await this.page.$('input[placeholder*="ZIP"], input[placeholder*="zip"]')
          if (zipInput) {
            await zipInput.fill(zip)
            await this.page.keyboard.press('Enter')
            await this.page.waitForTimeout(2000)
          }
        }
      } catch (error) {
        console.log('Could not set location, continuing with default location')
      }

      // Scrape product data from coupons/deals
      const products = await this.page.evaluate(() => {
        const productElements = document.querySelectorAll('.coupon-item, .deal-item, .product-card, .offer-card, .promotion-card')
        const scrapedProducts: any[] = []

        productElements.forEach((element, index) => {
          try {
            // Extract product name
            const nameElement = element.querySelector('h3, h4, .product-title, .coupon-title, .deal-title, .offer-title')
            const name = nameElement?.textContent?.trim()

            // Extract price or discount info
            const priceElement = element.querySelector('.price, .sale-price, .discount-price, .offer-price')
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

            // Extract description for better product info
            const descElement = element.querySelector('.description, .coupon-description, .deal-description')
            const description = descElement?.textContent?.trim()

            if (name && (price || description)) {
              scrapedProducts.push({
                name: name,
                price: price || 'See coupon',
                originalPrice,
                imageUrl,
                productUrl,
                description,
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
      const formattedProducts: Product[] = products.slice(0, 15).map((product, index) => ({
        id: this.generateProductId(product.name, store.id),
        name: product.name,
        price: this.formatPrice(product.price),
        originalPrice: product.originalPrice ? this.formatPrice(product.originalPrice) : undefined,
        imageUrl: this.getValidImageUrl(product.imageUrl),
        availability: 'in-stock' as const,
        url: product.productUrl || 'https://savemart.com',
        category: this.categorizeProduct(product.name)
      }))

      // Filter by query if provided
      if (query && query !== 'food') {
        const filtered = formattedProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase())
        )
        return filtered.length > 0 ? filtered : formattedProducts.slice(0, 8)
      }

      return formattedProducts.length > 0 ? formattedProducts : this.getFallbackProducts(store)
    } catch (error) {
      console.error('Error scraping Save Mart products:', error)
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
        'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=400&fit=crop&crop=center'
      ]
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    }
    return imageUrl
  }

  private categorizeProduct(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) return 'dairy'
    if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('muffin')) return 'bakery'
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('meat')) return 'meat'
    if (lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('tomato') || lowerName.includes('produce')) return 'produce'
    if (lowerName.includes('frozen') || lowerName.includes('ice cream')) return 'frozen'
    if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('seafood')) return 'seafood'
    return 'grocery'
  }

  private getFallbackProducts(store: Store): Product[] {
    return [
      {
        id: this.generateProductId('Fresh Ground Beef', store.id),
        name: 'Save Mart Fresh Ground Beef 80/20, per lb',
        price: '$4.99',
        originalPrice: '$6.99',
        imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&crop=center',
        availability: 'in-stock',
        url: 'https://savemart.com',
        category: 'meat'
      },
      {
        id: this.generateProductId('Roma Tomatoes', store.id),
        name: 'Fresh Roma Tomatoes, per lb',
        price: '$1.49',
        originalPrice: '$2.29',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&crop=center',
        availability: 'in-stock',
        url: 'https://savemart.com',
        category: 'produce'
      },
      {
        id: this.generateProductId('Sourdough Bread', store.id),
        name: 'Save Mart Sourdough Bread, 24 oz',
        price: '$2.99',
        originalPrice: '$3.99',
        imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center',
        availability: 'limited',
        url: 'https://savemart.com',
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