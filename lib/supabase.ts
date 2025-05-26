import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elfshrsipdpdvbvypfvq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZnNocnNpcGRwZHZidnlwZnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzg2OTMsImV4cCI6MjA2MzcxNDY5M30.Wqtsh5biCKgWIVdAPpU2WhO_-hD60uPdNID-9aV7JZY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Store {
  id: string
  name: string
  address: string
  phone?: string
  coordinates?: {
    lat: number
    lng: number
  }
  rating?: number
  user_ratings_total?: number
  place_id?: string
  store_type?: string
  hours?: any
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  brand?: string
  category_id: string
  image_url?: string
  unit_type?: string
  unit_size?: string
  barcode?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface StoreInventory {
  id: string
  store_id: string
  product_id: string
  quantity: number
  original_price: number
  discounted_price: number
  discount_percentage?: number
  expiry_date?: string
  is_available: boolean
  last_updated: string
  product?: Product
  store?: Store
} 