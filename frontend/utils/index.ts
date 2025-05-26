// Frontend Utils - Consolidated utility functions

import { STORE_NAMES } from '../types'

/**
 * Convert store slug to display name
 */
export const getStoreDisplayName = (slug: string): string => {
  return STORE_NAMES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format price string consistently
 */
export const formatPrice = (priceStr: string): string => {
  const cleaned = priceStr.replace(/[^\d.,]/g, '')
  return cleaned ? `$${cleaned}` : priceStr
}

/**
 * Fetch inventory from API
 */
export const fetchInventory = async (storeName: string, zip: string) => {
  const response = await fetch(`/api/inventory?query=food&zip=${encodeURIComponent(zip)}&store=${encodeURIComponent(storeName)}`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to load inventory')
  }
  
  const result = await response.json()
  
  if (result.products.length === 0) {
    throw new Error('No items found for this location.')
  }
  
  return result
} 