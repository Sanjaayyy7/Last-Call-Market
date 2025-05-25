"use client"

import { useState } from "react"
import { Building } from "lucide-react"

interface Store {
  id: number
  name: string
  description: string
}

const stores: Store[] = [
  {
    id: 1,
    name: "Fresh Market",
    description: "Premium grocery store with a focus on fresh produce and specialty items.",
  },
  {
    id: 2,
    name: "Nature's Pantry",
    description: "Organic and natural foods grocery chain with a wide selection of health-focused products.",
  },
  {
    id: 3,
    name: "Urban Grocer",
    description: "City-based grocery stores with a focus on local and sustainable food options.",
  },
  {
    id: 4,
    name: "Harvest Market",
    description: "Family-owned grocery chain specializing in farm-fresh produce and artisanal goods.",
  },
  {
    id: 5,
    name: "Green Basket",
    description: "Eco-friendly grocery store with a focus on zero-waste shopping and sustainable products.",
  },
  {
    id: 6,
    name: "Daily Fresh",
    description: "Neighborhood grocery stores with daily deliveries of fresh produce and prepared foods.",
  },
]

export default function ContinuousStoreCarousel() {
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate the stores array to create a seamless loop
  const allStores = [...stores, ...stores]

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`flex ${isPaused ? "pause-animation" : "animate-carousel"}`}
        style={{
          width: `${allStores.length * 33.33}%`, // Each card takes 1/3 of the container width
        }}
      >
        {allStores.map((store, index) => (
          <div
            key={`${store.id}-${index}`}
            className="w-full md:w-1/3 flex-shrink-0 px-4"
            style={{ width: `${100 / allStores.length}%` }}
          >
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm h-full">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              <p className="text-center text-muted-foreground flex-grow">{store.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%); /* Move by half the width (original stores length) */
          }
        }
        
        .animate-carousel {
          animation: carousel 30s linear infinite;
        }
        
        .pause-animation {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
