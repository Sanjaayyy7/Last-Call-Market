# Testing the Inventory System

## Quick Test URLs

### Working Store IDs (from database):

1. **Save Mart**
   ```
   http://localhost:3000/checkout/31cda635-0e05-441f-9fe5-cacf6882af7b?name=Save%20Mart&address=1900%20Anderson%20Rd,%20Davis
   ```

2. **Safeway**
   ```
   http://localhost:3000/checkout/20578923-6521-45e2-9fe0-ec81ead01027?name=Safeway&address=1451%20W%20Covell%20Blvd,%20Davis
   ```

3. **The Marketplace**
   ```
   http://localhost:3000/checkout/bc54e3ac-eaa4-4fe7-82c5-05471e5938e7?name=The%20Marketplace&address=1411%20W%20Covell%20Blvd,%20Davis
   ```

## Test Features

### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Products display in grid view
- [ ] Categories show in sidebar
- [ ] Search functionality works
- [ ] Cart operations work (add/remove/update)

### ✅ UI/UX Features
- [ ] Toggle between grid and list views
- [ ] Category filtering works
- [ ] Search filters products in real-time
- [ ] Cart sidebar opens and closes
- [ ] Mobile floating cart appears
- [ ] Responsive design on mobile

### ✅ Data Features
- [ ] Products show correct pricing
- [ ] Discount percentages display
- [ ] Stock quantities are accurate
- [ ] Cart totals calculate correctly
- [ ] Tax calculations work

### ✅ Error Handling
- [ ] Invalid store IDs show fallback data
- [ ] Empty search results show helpful message
- [ ] Network errors are handled gracefully

## Expected Data

The system should show:
- **8 Categories**: Fresh Produce, Dairy & Eggs, Meat & Seafood, Bakery, Pantry, Frozen Foods, Beverages, Snacks
- **17+ Products**: Including bananas, apples, milk, eggs, bread, pasta, etc.
- **Realistic Pricing**: With 30-60% discounts from original prices
- **Stock Quantities**: Random quantities between 5-50 items

## Common Issues

### Hydration Errors
- Fixed with `suppressHydrationWarning` in layout
- Client-side rendering check prevents SSR mismatches

### Async Params (Next.js 15)
- Fixed with `use()` hook for params and searchParams
- Proper Promise handling for dynamic routes

### Database Connection
- Ensure Supabase is accessible
- Check network connectivity
- Verify API keys are correct

## Development Commands

```bash
# Start development server
npm run dev

# Check if server is running
curl http://localhost:3000

# View database tables
# Use Supabase dashboard or MCP tools
``` 