"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Form validation schema
const formSchema = z.object({
  storeName: z.string().min(2, { message: "Store name must be at least 2 characters." }),
  storeType: z.string().min(1, { message: "Please select a store type." }),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  zipCode: z.string().min(5, { message: "Please enter a valid ZIP code." }),
  contactName: z.string().min(2, { message: "Contact name is required." }),
  contactEmail: z.string().email({ message: "Please enter a valid email address." }),
  contactPhone: z.string().min(10, { message: "Please enter a valid phone number." }),
  storeDescription: z.string().min(10, { message: "Please provide a brief description of your store." }),
  website: z.string().optional(),
  openingHours: z.string().min(5, { message: "Please provide your store's opening hours." }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
})

export default function AddStorePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeType: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      storeDescription: "",
      website: "",
      openingHours: "",
      termsAgreed: false,
    },
  })

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  // Store types
  const storeTypes = [
    "Supermarket",
    "Grocery Store",
    "Farmers Market",
    "Specialty Food Store",
    "Organic Market",
    "Co-op",
    "Other",
  ]

  if (isSubmitted) {
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
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>
                Thank you for your interest in partnering with Last Call Market. We've received your application and
                will review it shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Our team will contact you within 2-3 business days to discuss the next steps and answer any questions
                you may have.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                Submit Another Application
              </Button>
            </CardFooter>
          </Card>
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
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Partner with Last Call Market</h1>
              <p className="text-muted-foreground">
                Join our mission to reduce food waste and connect with customers looking for quality food at discounted
                prices.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Benefits for Your Business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span>Reduce food waste and associated disposal costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span>Generate revenue from products that would otherwise be discarded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span>Attract new customers to your store</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span>Enhance your brand's sustainability credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span>Simple integration with your existing operations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-2 list-decimal list-inside">
                    <li className="pl-2">Fill out the application form below</li>
                    <li className="pl-2">Our team will review your application</li>
                    <li className="pl-2">We'll schedule an onboarding call to discuss details</li>
                    <li className="pl-2">Set up your store profile and inventory management</li>
                    <li className="pl-2">Start offering food bags to customers</li>
                    <li className="pl-2">Receive payments and analytics through our platform</li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Store Application Form</CardTitle>
                <CardDescription>
                  Please provide the following information about your store. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Store Information</h3>
                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter store name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="storeType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select store type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {storeTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="storeDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your store, products, and what makes you unique"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Hours *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mon-Fri: 9am-8pm, Sat-Sun: 10am-6pm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Store Address</h3>
                      <Separator />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="ZIP Code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      <Separator />

                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the{" "}
                                <Link href="#" className="text-primary hover:underline">
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-primary hover:underline">
                                  Privacy Policy
                                </Link>{" "}
                                *
                              </FormLabel>
                              <FormDescription>
                                By submitting this form, you agree to be contacted by Last Call Market regarding your
                                application.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span> Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
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
