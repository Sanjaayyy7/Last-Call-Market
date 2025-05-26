import { chromium, Browser, Page } from 'playwright'
import { BaseScraper, Product, Store, InventoryResponse } from './base-scraper'

export class WalmartScraper extends BaseScraper {
  storeName = 'Walmart'
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

  async findStores(zip: string): Promise<Store[]> {
    if (!this.page) throw new Error('Scraper not initialized')

    try {
      console.log(`Finding Walmart stores near ${zip}`)
      const storeFinderUrl = `https://www.walmart.com/store/finder?location=${zip}`
      
      await this.page.goto(storeFinderUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      await this.page.waitForTimeout(5000)

      const stores: Store[] = await this.page.evaluate(() => {
        const stores: Store[] = []
        
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
          const allElements = document.querySelectorAll('*')
          for (const element of allElements) {
            if (element.textContent?.toLowerCase().includes('walmart supercenter') ||
                element.textContent?.toLowerCase().includes('neighborhood market')) {
              console.log('Found store via text content')
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
          if (index >= 3) return
          
          try {
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
                            `walmart-store-${index}`
              
              stores.push({
                id: storeId,
                name: nameElement?.textContent?.trim() || 'Walmart Supercenter',
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

      console.log(`Found ${stores.length} Walmart stores`)
      return stores.length > 0 ? stores : [{
        id: 'walmart-generic',
        name: 'Walmart Supercenter',
        address: `Near ${zip}`
      }]
      
    } catch (error) {
      console.error('Error finding Walmart stores:', error)
      return [{
        id: 'walmart-generic',
        name: 'Walmart Supercenter',
        address: `Near ${zip}`
      }]
    }
  }

  async searchProducts(query: string, zip: string, store: Store): Promise<Product[]> {
    if (!this.page) throw new Error('Scraper not initialized')

    try {
      console.log(`Searching Walmart for "${query}" near ${zip}`)
      
      const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(query)}&location=${zip}`
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })

      await this.page.waitForTimeout(3000)

      const products: Product[] = await this.page.evaluate((storeInfo) => {
        const products: Product[] = []
        
        const selectors = [
          '[data-testid="item-stack"]',
          '[data-automation-id="product-tile"]',
          '.search-result-gridview-item',
          '[data-testid="list-view"]',
          '.mb1.ph1.pa0-xl.bb.b--near-white.w-25'
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
          if (index >= 20) return
          
          try {
            const nameSelectors = [
              '[data-automation-id="product-title"]',
              'h3 a',
              '.product-title-link',
              'a[data-testid="product-title"]',
              '.w_DJ'
            ]
            
            let nameElement: Element | null = null
            for (const selector of nameSelectors) {
              nameElement = element.querySelector(selector)
              if (nameElement) break
            }
            
            const priceSelectors = [
              '[data-automation-id="product-price"]',
              '.price-current',
              '.price',
              '[data-testid="price-current"]',
              '.w_iUH7'
            ]
            
            let priceElement: Element | null = null
            for (const selector of priceSelectors) {
              priceElement = element.querySelector(selector)
              if (priceElement) break
            }
            
            const imageSelectors = [
              'img[data-testid="productTileImage"]',
              '.product-image img',
              'img[alt*="product"]',
              'img'
            ]
            
            let imageElement: HTMLImageElement | null = null
            for (const selector of imageSelectors) {
              imageElement = element.querySelector(selector) as HTMLImageElement
              if (imageElement && imageElement.src) break
            }
            
            const linkSelectors = [
              'a[data-testid="product-title"]',
              'h3 a',
              '.product-title-link',
              'a'
            ]
            
            let linkElement: HTMLAnchorElement | null = null
            for (const selector of linkSelectors) {
              linkElement = element.querySelector(selector) as HTMLAnchorElement
              if (linkElement && linkElement.href) break
            }
            
            if (nameElement && priceElement) {
              const name = nameElement.textContent?.trim() || ''
              const priceText = priceElement.textContent?.trim() || ''
              const imageUrl = imageElement?.src || ''
              const productUrl = linkElement?.href || ''
              
              if (name && priceText) {
                const productId = `walmart-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`
                
                products.push({
                  id: productId,
                  name: name,
                  price: priceText,
                  imageUrl: imageUrl,
                  availability: 'in-stock',
                  url: productUrl.startsWith('http') ? productUrl : `https://www.walmart.com${productUrl}`,
                  category: 'grocery'
                })
              }
            }
          } catch (error) {
            console.error('Error extracting product info:', error)
          }
        })
        
        return products
      }, store)

      console.log(`Found ${products.length} Walmart products`)
      return products
      
    } catch (error) {
      console.error('Error searching Walmart products:', error)
      return []
    }
  }

  async scrapeInventory(query: string, zip: string): Promise<InventoryResponse> {
    // Check if we're in a deployment environment where Playwright might not work
    if (this.isDeploymentEnvironment()) {
      console.log('Using fallback data for deployment environment')
      const store = {
        id: `walmart-${zip}`,
        name: 'Walmart',
        address: `Near ${zip}`
      }
      
      const products = this.getDeploymentFallbackProducts(store, query)
      
      return {
        query,
        zip,
        store,
        products,
        timestamp: new Date().toISOString(),
        totalResults: products.length
      }
    }

    try {
      await this.initialize()
      
      const stores = await this.findStores(zip)
      const store = stores[0] // Use first store found
      
      const products = await this.searchProducts(query, zip, store)
      
      return {
        query,
        zip,
        store,
        products,
        timestamp: new Date().toISOString(),
        totalResults: products.length
      }
    } catch (error) {
      console.error('Browser automation failed, using fallback data:', error)
      const store = {
        id: `walmart-${zip}`,
        name: 'Walmart',
        address: `Near ${zip}`
      }
      
      const products = this.getDeploymentFallbackProducts(store, query)
      
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