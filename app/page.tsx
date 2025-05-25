import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Twitter, Facebook, Instagram, Linkedin, Menu, CheckCircle, Clock, ShoppingBag, MapPin } from "lucide-react"
import ContinuousStoreCarousel from "@/components/continuous-store-carousel"

export default function LandingPage() {
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="#partners" className="text-sm font-medium hover:text-primary">
              Partner Stores
            </Link>
            <Link href="/find-store" className="text-sm font-medium hover:text-primary">
              Find a Store
            </Link>
            <Link href="/add-store" className="text-sm font-medium hover:text-primary">
              Add Store
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button asChild>
              <Link href="/find-store">Find Stores Near Me</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-green-50 to-white py-12 md:py-24 lg:py-32">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                    Save Money. Reduce Waste. Eat Well.
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Rescue Delicious Food at 50% Off
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Last Call connects you with quality surplus food from your favorite grocery stores that would
                    otherwise go to waste.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
                    asChild
                  >
                    <Link href="/find-store">Find Stores Near Me</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#how-it-works">How It Works</Link>
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                    <span>No subscription</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                    <span>50% off retail prices</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                    <span>Quality guaranteed</span>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto aspect-square overflow-hidden rounded-xl sm:w-full lg:order-last">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent rounded-xl"></div>
                <Image
                  src="/images/grocery-bags.png"
                  width={600}
                  height={600}
                  alt="Colorful grocery bags filled with rescued food items"
                  className="mx-auto object-cover h-full w-full rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 border-y bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              <div className="flex flex-col items-center justify-center space-y-2 border-r border-gray-200 px-4 py-5 last:border-r-0 md:px-6">
                <div className="text-3xl font-bold md:text-4xl">40%</div>
                <p className="text-center text-sm text-muted-foreground">of food is wasted in the US</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 border-r border-gray-200 px-4 py-5 last:border-r-0 md:px-6">
                <div className="text-3xl font-bold md:text-4xl">50%</div>
                <p className="text-center text-sm text-muted-foreground">average savings on retail prices</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 border-r border-gray-200 px-4 py-5 last:border-r-0 md:px-6">
                <div className="text-3xl font-bold md:text-4xl">25+</div>
                <p className="text-center text-sm text-muted-foreground">partner grocery stores</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 px-4 py-5 md:px-6">
                <div className="text-3xl font-bold md:text-4xl">10K+</div>
                <p className="text-center text-sm text-muted-foreground">happy customers</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-green-50/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                  Simple Process
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">It's easy as 1, 2, 3</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Last Call Market helps you save money and reduce food waste. Here's how:
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-5xl py-12">
              <div className="relative grid gap-8 md:grid-cols-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center z-10">
                  <div className="mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-900">
                      <MapPin className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Find a store near you</h3>
                  <p className="text-muted-foreground">
                    Browse our map to find participating grocery stores in your area
                  </p>
                </div>

                {/* Curved Arrow 1 */}
                <div className="hidden md:block absolute left-[25%] top-[20%] w-[25%] h-16">
                  <svg className="w-full h-full" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,20 Q50,-10 100,20" stroke="#BBE5B3" strokeWidth="2" fill="none" />
                    <path d="M93,12 L100,20 L90,18" stroke="#BBE5B3" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center z-10">
                  <div className="mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-900">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Reserve a food bag</h3>
                  <p className="text-muted-foreground">Choose from available food bags and reserve for pickup</p>
                </div>

                {/* Curved Arrow 2 */}
                <div className="hidden md:block absolute left-[58%] top-[20%] w-[25%] h-16">
                  <svg className="w-full h-full" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,20 Q50,-10 100,20" stroke="#BBE5B3" strokeWidth="2" fill="none" />
                    <path d="M93,12 L100,20 L90,18" stroke="#BBE5B3" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center z-10 relative">
                  <div className="absolute inset-0 rounded-2xl border-2 border-green-200 -m-4 md:-m-6 p-4 md:p-6"></div>
                  <div className="mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-900">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Pick up & enjoy</h3>
                  <p className="text-muted-foreground">
                    Visit the store, pick up your bag, and enjoy quality food at 50% off
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Bags Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                  What You'll Get
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Featured Food Bags</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Each bag is a surprise, but always filled with quality food that would otherwise go to waste.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/fresh-produce-bag.png"
                    alt="Fresh produce bag with vegetables and fruits"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Save 50%
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Fresh Produce Bag</CardTitle>
                  <CardDescription>A selection of seasonal fruits and vegetables</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A selection of quality items that would otherwise go to waste. Each bag is unique and helps reduce
                    food waste.
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/bakery-surprise.png"
                    alt="Bakery surprise with bread and croissants"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Save 55%
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Bakery Surprise</CardTitle>
                  <CardDescription>Assorted breads, pastries, and baked goods</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A selection of quality items that would otherwise go to waste. Each bag is unique and helps reduce
                    food waste.
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/pantry-essentials.png"
                    alt="Pantry essentials bag with non-perishable items"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Save 45%
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Pantry Essentials</CardTitle>
                  <CardDescription>Non-perishable items and household staples</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A selection of quality items that would otherwise go to waste. Each bag is unique and helps reduce
                    food waste.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Partner Stores Section */}
        <section id="partners" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                  Our Partners
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Partner Grocery Stores</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  We've partnered with leading grocery stores to help reduce food waste and provide you with quality
                  food at discounted prices.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-5xl">
              <ContinuousStoreCarousel />
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                    Our Impact
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Making a Difference Together
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Every food bag you purchase helps reduce food waste and its environmental impact. Together, we're
                    creating a more sustainable food system.
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">40 Million Tons of Food Waste</h3>
                      <p className="text-sm text-muted-foreground">
                        The US wastes approximately 40 million tons of food every year. By rescuing surplus food, we're
                        directly reducing this massive waste problem.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">170 Million Metric Tons of Carbon</h3>
                      <p className="text-sm text-muted-foreground">
                        Food waste generates a carbon footprint of approximately 170 million metric tons annually. Every
                        bag you purchase helps reduce these greenhouse gas emissions.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">$408 Billion Economic Value</h3>
                      <p className="text-sm text-muted-foreground">
                        The economic value of wasted food in the US is estimated at $408 billion annually. Our platform
                        helps recover this value while making quality food more affordable.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-square">
                <Image
                  src="/images/fresh-produce.png"
                  alt="Fresh produce display showing colorful fruits and vegetables"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-3xl font-bold">40M+</div>
                        <p className="text-sm">Tons of Food Wasted</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">170M</div>
                        <p className="text-sm">Metric Tons of CO2</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">$408B</div>
                        <p className="text-sm">Economic Value</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Save Money and Reduce Food Waste?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Join thousands of satisfied customers and start shopping smarter today.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
                  asChild
                >
                  <Link href="/find-store">Find a Store Near Me</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">No commitment required. Shop when you want.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/LastCallLogo.png"
                  alt="Last Call Market Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold">Last Call Market</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting consumers with quality surplus food at discounted prices while reducing food waste.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Partner with Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Food Safety
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Last Call Market. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">Made with ♥ for a more sustainable future</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
