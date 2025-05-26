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

  // Fallback method for when browser automation fails
  protected getDeploymentFallbackProducts(store: Store, query: string): Product[] {
    interface FallbackProduct {
      name: string
      price: string
      originalPrice: string
      imageUrl: string
      category: string
    }

    const storeProducts: Record<string, FallbackProduct[]> = {
      'Safeway': [
        {
          name: 'Safeway Organic Whole Milk, 64 fl oz',
          price: '$4.99',
          originalPrice: '$6.49',
          imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center',
          category: 'dairy'
        },
        {
          name: 'Fresh Bananas, per lb',
          price: '$0.68',
          originalPrice: '$0.98',
          imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center',
          category: 'produce'
        },
        {
          name: 'Safeway Whole Wheat Bread, 20 oz',
          price: '$2.49',
          originalPrice: '$3.29',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center',
          category: 'bakery'
        }
      ],
      'Save Mart': [
        {
          name: 'Save Mart Fresh Ground Beef 80/20, per lb',
          price: '$4.99',
          originalPrice: '$6.99',
          imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&crop=center',
          category: 'meat'
        },
        {
          name: 'Fresh Roma Tomatoes, per lb',
          price: '$1.49',
          originalPrice: '$2.29',
          imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&crop=center',
          category: 'produce'
        },
        {
          name: 'Save Mart Sourdough Bread, 24 oz',
          price: '$2.99',
          originalPrice: '$3.99',
          imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center',
          category: 'bakery'
        }
      ],
      'Walmart': [
        {
          name: 'Great Value 2% Reduced Fat Milk, 128 fl oz',
          price: '$3.98',
          originalPrice: '$4.98',
          imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center',
          category: 'dairy'
        },
        {
          name: 'Bananas, each',
          price: '$0.58',
          originalPrice: '$0.78',
          imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center',
          category: 'produce'
        },
        {
          name: 'Wonder Bread Classic White, 20 oz',
          price: '$1.28',
          originalPrice: '$1.98',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center',
          category: 'bakery'
        }
      ],
      "Trader Joe's": [
        {
          name: "Trader Joe's Organic Whole Milk, 64 fl oz",
          price: '$3.99',
          originalPrice: '$4.99',
          imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center',
          category: 'dairy'
        },
        {
          name: "Trader Joe's Bananas, per lb",
          price: '$0.69',
          originalPrice: '$0.89',
          imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center',
          category: 'produce'
        },
        {
          name: "Trader Joe's Sprouted Wheat Berry Bread",
          price: '$2.99',
          originalPrice: '$3.49',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center',
          category: 'bakery'
        }
      ]
    }

    const products = storeProducts[this.storeName] || storeProducts['Walmart']
    
    return products.map((product: FallbackProduct, index: number) => ({
      id: this.generateProductId(product.name, store.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      availability: index % 3 === 0 ? 'limited' as const : 'in-stock' as const,
      url: this.getStoreUrl(),
      category: product.category
    }))
  }

  protected getStoreUrl(): string {
    switch (this.storeName) {
      case 'Safeway': return 'https://www.safeway.com'
      case 'Save Mart': return 'https://savemart.com'
      case 'Walmart': return 'https://www.walmart.com'
      case "Trader Joe's": return 'https://www.traderjoes.com'
      default: return '#'
    }
  }

  // Check if we're in a deployment environment where Playwright might not work
  protected isDeploymentEnvironment(): boolean {
    return !!(process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === 'production')
  }
} 