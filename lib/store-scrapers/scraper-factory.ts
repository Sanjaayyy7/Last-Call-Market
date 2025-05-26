import { BaseScraper, InventoryResponse } from './base-scraper'
import { WalmartScraper } from './walmart-scraper'
import { SafewayScraper } from './safeway-scraper'
import { TraderJoesScraper } from './trader-joes-scraper'
import { SaveMartScraper } from './save-mart-scraper'

export class ScraperFactory {
  private static scrapers: Map<string, () => BaseScraper> = new Map()

  static {
    this.scrapers.set('walmart', () => new WalmartScraper())
    this.scrapers.set('walmart supercenter', () => new WalmartScraper())
    this.scrapers.set('walmart neighborhood market', () => new WalmartScraper())
    this.scrapers.set('safeway', () => new SafewayScraper())
    this.scrapers.set('trader joe\'s', () => new TraderJoesScraper())
    this.scrapers.set('trader joes', () => new TraderJoesScraper())
    this.scrapers.set('save mart', () => new SaveMartScraper())
    this.scrapers.set('savemart', () => new SaveMartScraper())
  }

  static getScraper(storeName: string): BaseScraper | null {
    const normalizedName = storeName.toLowerCase().trim()
    
    // Try exact match first
    const scraperFactory = this.scrapers.get(normalizedName)
    if (scraperFactory) {
      return scraperFactory()
    }

    // Try partial matches
    for (const [key, factory] of this.scrapers.entries()) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return factory()
      }
    }

    return null
  }

  static async scrapeInventory(storeName: string, query: string, zip: string): Promise<InventoryResponse> {
    const scraper = this.getScraper(storeName)
    
    if (!scraper) {
      throw new Error(`No scraper available for store: ${storeName}`)
    }

    try {
      return await scraper.scrapeInventory(query, zip)
    } catch (error) {
      console.error(`Error scraping ${storeName}:`, error)
      throw error
    }
  }

  static getSupportedStores(): string[] {
    return Array.from(new Set(Array.from(this.scrapers.values()).map(factory => factory().storeName)))
  }
} 