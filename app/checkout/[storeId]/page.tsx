"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ShoppingBag, Minus, Plus, CreditCard, Clock, Check, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  ShoppingCart, 
  Search, 
  MapPin,
  Heart,
  Filter,
  Grid3X3,
  List,
  Share2,
  Trash2
} from "lucide-react"
import { supabase, type Category, type Product, type StoreInventory, type Store } from "@/lib/supabase"

interface CartItem extends StoreInventory {
  cartQuantity: number
}

export default function StoreInventoryPage({ 
  params, 
  searchParams 
}: {
  params: Promise<{ storeId: string }>
  searchParams: Promise<{ name?: string; address?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const { storeId } = resolvedParams
  const storeName = resolvedSearchParams?.name || "Grocery Store"
  const storeAddress = resolvedSearchParams?.address || "Address unavailable"

  // State management
  const [store, setStore] = useState<Store | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<StoreInventory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<StoreInventory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load store data and inventory
  useEffect(() => {
    if (isClient && storeId) {
      loadStoreData()
      loadCategories()
      loadInventory()
    }
  }, [storeId, isClient])

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        item.product?.category?.slug === selectedCategory
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Only show available items
    filtered = filtered.filter(item => item.is_available && item.quantity > 0)

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery])

  const loadStoreData = async () => {
    try {
      console.log('Loading store data for ID:', storeId)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      console.log('Store query result:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('Store not found in database, using fallback data')
          // Store not found, continue with fallback data
          return
        }
        console.error('Supabase error loading store:', error)
        throw error
      }
      setStore(data)
      console.log('Store data loaded successfully:', data)
    } catch (error) {
      console.error('Error loading store:', error)
      // Continue without store data - use fallback values
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (error) {
        console.error('Supabase error loading categories:', error)
        throw error
      }
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      // Continue with empty categories
    }
  }

  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('store_inventory')
        .select(`
          *,
          product:products(
            *,
            category:categories(*)
          )
        `)
        .eq('store_id', storeId)
        .eq('is_available', true)
        .gt('quantity', 0)

      if (error) {
        console.error('Supabase error loading inventory:', error)
        throw error
      }
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
      // Continue with empty products
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (item: StoreInventory) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, cartQuantity: Math.min(cartItem.cartQuantity + 1, item.quantity) }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, cartQuantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId)
      if (existingItem && existingItem.cartQuantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId 
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity - 1 }
            : cartItem
        )
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId)
      }
    })
  }

  const removeItemCompletely = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== itemId))
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId)
    return cartItem ? cartItem.cartQuantity : 0
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.discounted_price * item.cartQuantity), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0)

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  const calculateSavings = (original: number, discounted: number) => {
    return ((original - discounted) / original * 100).toFixed(0)
  }

    if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading store inventory...</p>
              </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and store info */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="hidden md:block">
                <h1 className="font-semibold text-lg">{store?.name || storeName}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store?.address || storeAddress}
                </p>
              </div>
            </div>

            {/* Right side - Cart */}
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="relative"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Your Cart ({cartItemCount} items)</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                        <p className="text-sm text-gray-400 mt-1">Add some items to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                                src={item.product?.image_url || "/placeholder-product.jpg"}
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.product?.name}</h4>
                              <p className="text-xs text-gray-600">{item.product?.brand}</p>
                              <p className="text-xs text-gray-500">{item.product?.unit_size}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-semibold text-green-600 text-sm">
                                  {formatPrice(item.discounted_price)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(item.original_price)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemCompletely(item.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium min-w-[1.5rem] text-center">
                                  {item.cartQuantity}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  disabled={item.cartQuantity >= item.quantity}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {cart.length > 0 && (
                    <div className="border-t pt-4 mt-6">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax (estimated)</span>
                          <span>{formatPrice(cartTotal * 0.08)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(cartTotal * 1.08)}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
              {cartTotal > 0 && (
                <div className="hidden md:block text-right">
                  <p className="font-semibold">{formatPrice(cartTotal)}</p>
                  <p className="text-xs text-gray-600">{cartItemCount} items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Categories */}
        <aside className="hidden lg:block w-64 bg-white border-r">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === "all" 
                    ? "bg-green-100 text-green-800 font-medium" 
                    : "hover:bg-gray-100"
                }`}
              >
                All Items ({products.length})
              </button>
              {categories.map((category) => {
                const categoryCount = products.filter(p => p.product?.category?.slug === category.slug).length
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.slug 
                        ? "bg-green-100 text-green-800 font-medium" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name} ({categoryCount})
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
      <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {/* Search and filters */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile category selector */}
              <div className="lg:hidden mt-4">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      All
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.slug ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.slug)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Products grid/list */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} items
                {selectedCategory !== "all" && (
                  <span> in {categories.find(c => c.slug === selectedCategory)?.name}</span>
                )}
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    {searchQuery ? "No products match your search" : "No products available"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {searchQuery 
                      ? "Try adjusting your search terms or browse by category" 
                      : "This store's inventory is currently being updated"
                    }
                  </p>
                </div>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  : "space-y-4"
              }>
                {filteredProducts.map((item) => {
                  const cartQuantity = getCartItemQuantity(item.id)
                  const isInCart = cartQuantity > 0

                  if (viewMode === "list") {
                    return (
                      <Card key={item.id} className="flex flex-row p-4 hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
                        <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                            <Image
                            src={item.product?.image_url || "/placeholder-product.jpg"}
                            alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          {item.discount_percentage && item.discount_percentage > 0 && (
                            <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0">
                              {item.discount_percentage}% OFF
                            </Badge>
                          )}
                          </div>
                        <div className="flex-1 ml-4">
                          <div className="flex justify-between items-start h-full">
                            <div className="flex-1 space-y-1">
                              <h3 className="font-semibold text-sm text-gray-900">{item.product?.name}</h3>
                              <p className="text-xs text-gray-600">{item.product?.brand}</p>
                              <p className="text-xs text-gray-500">{item.product?.unit_size}</p>
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="font-bold text-base text-gray-900">
                                  {formatPrice(item.discounted_price)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(item.original_price)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {item.quantity} left in stock
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {isInCart ? (
                                <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-7 w-7 p-0 border-green-200 hover:bg-green-100"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-semibold text-green-700 min-w-[2rem] text-center text-sm">
                                    {cartQuantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                    disabled={cartQuantity >= item.quantity}
                                    className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="bg-green-600 hover:bg-green-700 font-semibold px-4"
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                  </Card>
                    )
                  }

                  return (
                    <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
                      <CardHeader className="p-4">
                        <div className="aspect-square relative mb-3 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={item.product?.image_url || "/placeholder-product.jpg"}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                            </div>
                          {item.discount_percentage && item.discount_percentage > 0 && (
                            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white font-semibold">
                              {item.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">{item.product?.name}</h3>
                          <p className="text-xs text-gray-600">{item.product?.brand}</p>
                          <p className="text-xs text-gray-500">{item.product?.unit_size}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-lg text-gray-900">
                                {formatPrice(item.discounted_price)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.original_price)}
                              </span>
                        </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} left in stock
                            </p>
                          </div>
                          
                          {isInCart ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 p-0 border-green-200 hover:bg-green-100"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold text-green-700">{cartQuantity} in cart</span>
                              <Button
                                size="sm"
                                onClick={() => addToCart(item)}
                                disabled={cartQuantity >= item.quantity}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="w-full bg-green-600 hover:bg-green-700 font-semibold py-2"
                            >
                              Add to Cart
                            </Button>
                          )}
                            </div>
                      </CardContent>
                    </Card>
                  )
                })}
                        </div>
                      )}
          </div>
        </main>
      </div>

      {/* Floating cart summary (mobile) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Card className="bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{formatPrice(cartTotal)}</p>
                        <p className="text-sm opacity-90">{cartItemCount} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">View Cart</p>
                      <p className="text-xs opacity-75">Tap to review</p>
                    </div>
                      </div>
                    </CardContent>
                  </Card>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Your Cart ({cartItemCount} items)</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add some items to get started</p>
              </div>
                ) : (
                  <div className="space-y-4">
                          {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={item.product?.image_url || "/placeholder-product.jpg"}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product?.name}</h4>
                          <p className="text-xs text-gray-600">{item.product?.brand}</p>
                          <p className="text-xs text-gray-500">{item.product?.unit_size}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-green-600 text-sm">
                              {formatPrice(item.discounted_price)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(item.original_price)}
                            </span>
                          </div>
                          </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemCompletely(item.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[1.5rem] text-center">
                              {item.cartQuantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              disabled={item.cartQuantity >= item.quantity}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (estimated)</span>
                      <span>{formatPrice(cartTotal * 0.08)}</span>
            </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal * 1.08)}</span>
          </div>
        </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Proceed to Checkout
                  </Button>
          </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}
