"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Store {
  id: number
  name: string
  description: string
  logo: string
}

const stores: Store[] = [
  {
    id: 1,
    name: "Fresh Market",
    description: "Premium grocery store with a focus on fresh produce and specialty items.",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Nature's Pantry",
    description: "Organic and natural foods grocery chain with a wide selection of health-focused products.",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Urban Grocer",
    description: "City-based grocery stores with a focus on local and sustainable food options.",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    name: "Harvest Market",
    description: "Family-owned grocery chain specializing in farm-fresh produce and artisanal goods.",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    name: "Green Basket",
    description: "Eco-friendly grocery store with a focus on zero-waste shopping and sustainable products.",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 6,
    name: "Daily Fresh",
    description: "Neighborhood grocery stores with daily deliveries of fresh produce and prepared foods.",
    logo: "/placeholder.svg?height=80&width=80",
  },
]

export default function StoreCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Create a duplicated array of stores for seamless scrolling
  const duplicatedStores = [...stores, ...stores]

  useEffect(() => {
    if (!scrollRef.current) return

    // Set initial position
    scrollRef.current.style.transform = "translateX(0)"

    // Calculate the width of a single store card (including margins)
    const cardWidth = scrollRef.current.querySelector(".store-card")?.clientWidth || 300
    const totalWidth = cardWidth * stores.length

    let animationFrame: number
    let startTime: number | null = null
    let currentPosition = 0

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      if (!scrollRef.current) return

      // Don't animate if paused
      if (!isPaused) {
        // Calculate how much to move (pixels per second)
        const elapsed = timestamp - startTime
        const pixelsPerSecond = 30 // Adjust speed here
        currentPosition = ((elapsed * pixelsPerSecond) / 1000) % totalWidth

        // Apply the transform
        scrollRef.current.style.transform = `translateX(-${currentPosition}px)`

        // If we've scrolled past the first set of stores, reset position to create seamless loop
        if (currentPosition >= totalWidth) {
          startTime = timestamp
          currentPosition = 0
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isPaused, stores.length])

  return (
    <div
      className="w-full overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={scrollRef} className="flex transition-transform" style={{ willChange: "transform" }}>
        {duplicatedStores.map((store, index) => (
          <div key={`${store.id}-${index}`} className="store-card w-full md:w-1/3 px-4 flex-shrink-0">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm h-full">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Image
                  src={store.logo || "/placeholder.svg"}
                  alt={`${store.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              <p className="text-center text-muted-foreground flex-grow">{store.description}</p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href="/find-store">
                  Find Locations <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
