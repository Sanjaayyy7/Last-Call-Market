# Last Call Market - Live Inventory System

## Overview
This project now includes a complete Instacart-like live inventory system that displays real-time product availability and pricing from grocery stores.

## Features

### 🛒 Live Inventory Display
- Real-time product availability from Supabase database
- Dynamic pricing with discount calculations
- Product categorization and filtering
- Search functionality across products, brands, and descriptions

### 🎨 Instacart-Inspired Design
- **Grid View**: Product cards with hover effects and image zoom
- **List View**: Compact horizontal layout for quick browsing
- **Mobile-First**: Responsive design that works on all devices
- **Professional Styling**: Clean, modern interface matching Instacart's aesthetic

### 🛍️ Shopping Cart
- **Add to Cart**: One-click adding with quantity management
- **Cart Sidebar**: Slide-out cart with full product details
- **Quantity Controls**: Increment/decrement with stock limits
- **Remove Items**: Individual item removal or complete deletion
- **Price Calculation**: Real-time subtotal, tax, and total calculation
- **Mobile Cart**: Floating cart summary for mobile users

### 📱 User Experience
- **Category Filtering**: Sidebar navigation with product counts
- **Search**: Real-time search across all product fields
- **View Modes**: Toggle between grid and list views
- **Loading States**: Smooth loading animations
- **Stock Indicators**: Clear stock availability messaging

## Database Schema

### Tables Created
1. **stores** - Store information and locations
2. **categories** - Product categories with sorting
3. **products** - Product details and specifications
4. **store_inventory** - Live inventory with pricing and availability

### Sample Data
- 8 product categories (Produce, Dairy, Meat, Bakery, etc.)
- 17+ sample products with realistic pricing
- 3 stores (Save Mart, Safeway, The Marketplace)
- Random inventory quantities and discount pricing

## Technical Implementation

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Lucide React** icons

### Backend
- **Supabase** for database and real-time features
- **PostgreSQL** with proper indexing
- **Row Level Security** ready for user authentication

### Key Components
- `StoreInventoryPage` - Main inventory interface
- `Sheet` - Cart sidebar component
- `Card` - Product display components
- `Badge` - Discount and status indicators

## Usage

1. **Navigate to Store**: Click "Grab a Bag" from any store on the find-store page
2. **Browse Products**: Use categories, search, or view modes to find items
3. **Add to Cart**: Click "Add to Cart" or use quantity controls
4. **Review Cart**: Click cart button or mobile floating cart
5. **Checkout**: Proceed to checkout (ready for payment integration)

## URLs
- Store Inventory: `/checkout/[storeId]?name=StoreName&address=StoreAddress`
- Example: `/checkout/31cda635-0e05-441f-9fe5-cacf6882af7b?name=Save%20Mart&address=1900%20Anderson%20Rd,%20Davis`

## Future Enhancements
- User authentication and saved carts
- Real-time inventory updates via Supabase subscriptions
- Product recommendations
- Order history and favorites
- Payment processing integration
- Delivery/pickup scheduling

## Development
```bash
npm run dev
```
Visit `http://localhost:3000` and navigate to any store to see the inventory system in action. 