# Frontend Module - "Grab a Bag" Functionality

This module contains all the frontend code responsible for the "Grab a bag" functionality in Last Call Market.

## 📁 Structure

```
frontend/
├── types/           # TypeScript interfaces and types
├── utils/           # Utility functions (API calls, formatting)
├── components/      # Reusable UI components
├── pages/           # Page components
├── api/             # API route handlers
├── index.ts         # Main exports
└── README.md        # This file
```

## 🎯 Key Features

- **Real Product Display**: Shows actual grocery store inventory with images
- **Location-Based**: Filters products by user's ZIP code
- **Responsive Design**: Works on mobile and desktop
- **Error Handling**: Graceful fallbacks and retry functionality
- **Loading States**: Smooth user experience with loading indicators

## 🧩 Components

### Core Components
- `ProductCard` - Individual product display with image, price, availability
- `LoadingState` - Loading spinner and message
- `ErrorState` - Error display with retry button
- `EmptyState` - No products found message

### Pages
- `StorePage` - Main store inventory page (`/store/[storeSlug]?zip=12345`)

## 🔧 Utils

- `getStoreDisplayName()` - Convert slug to display name
- `formatPrice()` - Consistent price formatting
- `fetchInventory()` - API call to get store inventory

## 📡 API

- `GET /api/inventory` - Fetch store inventory
  - Query params: `store`, `zip`, `query`
  - Returns: Product list with images and availability

## 🚀 Usage

```tsx
import { StorePage, ProductCard, LoadingState } from './frontend'

// Use in your Next.js app
export default StorePage
```

## 🎨 Design

- Clean, minimalistic interface
- Tailwind CSS for styling
- Mobile-first responsive design
- Consistent color scheme and typography 