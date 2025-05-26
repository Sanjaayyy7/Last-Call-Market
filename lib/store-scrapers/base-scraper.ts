export interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  imageUrl: string
  availability: 'in-stock' | 'out-of-stock' | 'limited'
  url: string
  category?: string
}

export interface Store {
  id: string
  name: string
  address: string
  distance?: string
}

export interface InventoryResponse {
  query: string
  zip: string
  store: Store
  products: Product[]
  timestamp: string
  totalResults: number
}

export abstract class BaseScraper {
  abstract storeName: string
  
  abstract findStores(zip: string): Promise<Store[]>
  abstract searchProducts(query: string, zip: string, store: Store): Promise<Product[]>
  abstract scrapeInventory(query: string, zip: string): Promise<InventoryResponse>
  
  protected generateProductId(name: string, storeId: string): string {
    return `${storeId}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`
  }
  
  protected formatPrice(price: string): string {
    const cleaned = price.replace(/[^\d.,]/g, '')
    return cleaned ? `$${cleaned}` : price
  }
} 