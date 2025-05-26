// Frontend Types - Consolidated for easy access and debugging

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
}

export interface InventoryResponse {
  query: string
  zip: string
  store: Store
  products: Product[]
  timestamp: string
  totalResults: number
}

export interface StoreMapping {
  [key: string]: string
}

export const STORE_NAMES: StoreMapping = {
  'safeway': 'Safeway',
  'trader-joes': "Trader Joe's",
  'save-mart': 'Save Mart',
  'walmart': 'Walmart',
  'the-marketplace': 'The Marketplace',
  'westlake-market': 'Westlake Market',
  'davis-food-co-op': 'Davis Food Co-op',
  'nugget-markets': 'Nugget Markets',
  'myu-myu': 'Myu Myu',
  'ho-ho-market': 'Ho Ho Market',
  'international-food-market': 'International Food Market',
  'grocery-outlet': 'Grocery Outlet'
} 