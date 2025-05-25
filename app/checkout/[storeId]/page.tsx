"use client"

import { useState, useEffect } from "react"
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

// Sample food items that might be available
const FOOD_ITEMS = [
  {
    id: 1,
    name: "Fresh Produce Bag",
    description: "A selection of fresh fruits and vegetables that would otherwise go to waste",
    price: 12.99,
    originalPrice: 25.99,
    image: "/images/fresh-produce-bag.png",
    category: "Produce",
  },
  {
    id: 2,
    name: "Bakery Surprise",
    description: "Assorted breads, pastries, and baked goods from the day before",
    price: 8.99,
    originalPrice: 18.99,
    image: "/images/bakery-surprise.png",
    category: "Bakery",
  },
  {
    id: 4,
    name: "Pantry Essentials",
    description: "Non-perishable items with minor packaging imperfections",
    price: 14.99,
    originalPrice: 29.99,
    image: "/images/pantry-essentials.png",
    category: "Pantry",
  },
]

export default function CheckoutPage({ params, searchParams }) {
  const router = useRouter()
  const { storeId } = params
  const storeName = searchParams?.name || "Grocery Store"
  const storeAddress = searchParams?.address || "Address unavailable"

  const [cart, setCart] = useState([])
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [pickupTime, setPickupTime] = useState("asap")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax
  const savings = cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)

  // Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId)
      if (existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId)
      }
    })
  }

  // Update item quantity directly
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((cartItem) => (cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem)),
    )
  }

  // Handle checkout process
  const handleCheckout = () => {
    if (checkoutStep < 3) {
      setCheckoutStep(checkoutStep + 1)
    } else {
      setIsSubmitting(true)
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        setIsComplete(true)
      }, 2000)
    }
  }

  // Generate pickup time options with clean half-hour intervals
  const getPickupTimeOptions = () => {
    const options = []
    const now = new Date()

    // ASAP option
    options.push({ value: "asap", label: "As soon as possible" })

    // Round up to the next half hour
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Start time: if we're past the half-hour mark, start at the next hour
    // Otherwise, start at the next half hour
    let startHour = currentHour
    let startMinute = 30

    if (currentMinute >= 30) {
      startHour = (currentHour + 1) % 24
      startMinute = 0
    }

    // Generate 6 time slots in half-hour increments
    for (let i = 0; i < 6; i++) {
      const timeHour = (startHour + Math.floor((startMinute + i * 30) / 60)) % 24
      const timeMinute = (startMinute + i * 30) % 60

      const time = new Date()
      time.setHours(timeHour, timeMinute, 0)

      const formattedTime = time.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      options.push({ value: `today-${i}`, label: `Today at ${formattedTime}` })
    }

    return options
  }

  // Reset checkout if completed
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isComplete, router])

  if (isComplete) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <CardDescription>
                Your order has been placed successfully. You'll receive a confirmation email shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium">Order Details</h3>
                <p className="text-sm text-muted-foreground">Order #LC-{Math.floor(Math.random() * 10000)}</p>
                <p className="text-sm text-muted-foreground mt-2">Pickup from: {storeName}</p>
                <p className="text-sm text-muted-foreground">{storeAddress}</p>
                <p className="text-sm font-medium mt-2">
                  Pickup time: {pickupTime === "asap" ? "As soon as possible" : pickupTime}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/LastCallLogo.png"
                alt="Last Call Market Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold">Last Call Market</span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/find-store" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Stores
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-12">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-2">Grab a Bag from {storeName}</h1>
            <p className="text-muted-foreground mb-8">{storeAddress}</p>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-8">
                {checkoutStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Available Food Bags
                      </CardTitle>
                      <CardDescription>
                        Select from our available food bags to reduce waste and save money
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {FOOD_ITEMS.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="h-16 w-16 relative rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              <div className="text-right">
                                <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs px-2 py-1 bg-muted rounded-full">{item.category}</span>

                              {cart.find((cartItem) => cartItem.id === item.id) ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">
                                    {cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => addToCart(item)}>
                                  Add to Bag
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {checkoutStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pickup Details
                      </CardTitle>
                      <CardDescription>Choose when you'd like to pick up your order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pickup Time</Label>
                        <RadioGroup value={pickupTime} onValueChange={setPickupTime} className="space-y-2">
                          {getPickupTimeOptions().map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value}>{option.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2 pt-4">
                        <Label>Special Instructions (Optional)</Label>
                        <Input placeholder="Any special requests for your order?" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {checkoutStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>Choose how you'd like to pay for your order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit" id="credit" />
                          <Label htmlFor="credit">Credit/Debit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="store" id="store" />
                          <Label htmlFor="store">Pay at Store</Label>
                        </div>
                      </RadioGroup>

                      {paymentMethod === "credit" && (
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Card Number</Label>
                            <Input placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiration Date</Label>
                              <Input placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                              <Label>CVV</Label>
                              <Input placeholder="123" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Name on Card</Label>
                            <Input placeholder="John Doe" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="save-payment" />
                        <label
                          htmlFor="save-payment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Save payment information for future orders
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Your bag is empty</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>
                                {item.quantity} × {item.name}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>${tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>You save</span>
                            <span>${savings.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={cart.length === 0 || isSubmitting} onClick={handleCheckout}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : checkoutStep === 1 ? (
                        "Continue to Pickup"
                      ) : checkoutStep === 2 ? (
                        "Continue to Payment"
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/images/LastCallLogo.png"
              alt="Last Call Market Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Last Call Market. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Cookies
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
