"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, MapPin, Phone, Clock, Loader2, Search, X, Star, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

interface Store {
  id: string
  name: string
  address: string
  vicinity?: string
  city?: string
  phone?: string
  hours?: {
    weekday: string
    weekend: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  rating?: number
  userRatingsTotal?: number
  placeId?: string
  photos?: any[]
  storeType?: string
}

// Dynamically import the Map component with no SSR
const GoogleMapComponent = dynamic(() => import("./google-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <p>Loading map...</p>
    </div>
  ),
})

// Default map center (New York City)
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }
const DEFAULT_ZOOM = 11

// Sample cities for autocomplete
const CITIES = [
  { name: "New York", state: "NY", coordinates: { lat: 40.7128, lng: -74.006 } },
  { name: "Los Angeles", state: "CA", coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: "Chicago", state: "IL", coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: "Houston", state: "TX", coordinates: { lat: 29.7604, lng: -95.3698 } },
  { name: "Phoenix", state: "AZ", coordinates: { lat: 33.4484, lng: -112.074 } },
  { name: "Philadelphia", state: "PA", coordinates: { lat: 39.9526, lng: -75.1652 } },
  { name: "San Antonio", state: "TX", coordinates: { lat: 29.4241, lng: -98.4936 } },
  { name: "San Diego", state: "CA", coordinates: { lat: 32.7157, lng: -117.1611 } },
  { name: "Dallas", state: "TX", coordinates: { lat: 32.7767, lng: -96.797 } },
  { name: "San Jose", state: "CA", coordinates: { lat: 37.3382, lng: -121.8863 } },
  { name: "Austin", state: "TX", coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: "Jacksonville", state: "FL", coordinates: { lat: 30.3322, lng: -81.6557 } },
  { name: "San Francisco", state: "CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: "Columbus", state: "OH", coordinates: { lat: 39.9612, lng: -82.9988 } },
  { name: "Indianapolis", state: "IN", coordinates: { lat: 39.7684, lng: -86.1581 } },
]

// Sample zip codes
const ZIP_CODES = {
  "10001": { city: "New York", state: "NY", coordinates: { lat: 40.7501, lng: -73.9971 } },
  "90001": { city: "Los Angeles", state: "CA", coordinates: { lat: 33.9731, lng: -118.2459 } },
  "60601": { city: "Chicago", state: "IL", coordinates: { lat: 41.8855, lng: -87.6229 } },
  "77001": { city: "Houston", state: "TX", coordinates: { lat: 29.7543, lng: -95.3632 } },
  "85001": { city: "Phoenix", state: "AZ", coordinates: { lat: 33.4484, lng: -112.074 } },
  "75001": { city: "Dallas", state: "TX", coordinates: { lat: 32.7831, lng: -96.8037 } },
}

export default function FindStore() {
  const [stores, setStores] = useState<Store[]>([])
  const [activeStore, setActiveStore] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState("idle") // idle, loading, success, error
  const [locationError, setLocationError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string
    coordinates: { lat: number; lng: number }
  } | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const searchRef = useRef(null)

  // Function to find nearest store to user
  const findNearestStore = () => {
    if (!userLocation || stores.length === 0) return null

    let nearestStore = null
    let shortestDistance = Number.POSITIVE_INFINITY

    stores.forEach((store) => {
      const distance = calculateDistance(userLocation, store.coordinates)

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestStore = store
      }
    })

    return nearestStore
  }

  // Function to get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error")
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setLocationStatus("loading")
    setLocationError("")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userCoords)
        setMapCenter(userCoords)
        setLocationStatus("success")
        // Reset hasSearched when location changes
        setHasSearched(false)
      },
      (error) => {
        setLocationStatus("error")
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access was denied")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable")
            break
          case error.TIMEOUT:
            setLocationError("The request to get location timed out")
            break
          default:
            setLocationError("An unknown error occurred")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  // Request user location on component mount
  useEffect(() => {
    getUserLocation()
  }, [])

  // Handle clicks outside the search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchRef])

  // Function to handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Check if input is a zip code (5 digits)
    if (/^\d{5}$/.test(query) && ZIP_CODES[query]) {
      setSearchResults([
        {
          name: ZIP_CODES[query].city,
          state: ZIP_CODES[query].state,
          coordinates: ZIP_CODES[query].coordinates,
          isZip: true,
          zipCode: query,
        },
      ])
      setShowResults(true)
      return
    }

    // Filter cities based on input
    const filteredCities = CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(query.toLowerCase()) || city.state.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 5) // Limit to 5 results

    setSearchResults(filteredCities)
    setShowResults(filteredCities.length > 0)
  }

  // Function to handle search submission
  const handleSearch = (e) => {
    e.preventDefault()

    // Check if input is a zip code
    if (/^\d{5}$/.test(searchQuery) && ZIP_CODES[searchQuery]) {
      const location = ZIP_CODES[searchQuery]
      setMapCenter(location.coordinates)
      setMapZoom(13)
      setSearchedLocation({
        name: `${location.city}, ${location.state} ${searchQuery}`,
        coordinates: location.coordinates,
      })
      setActiveStore(null)
      setShowResults(false)
      return
    }

    // Check if input matches a city
    const cityMatch = CITIES.find(
      (city) =>
        city.name.toLowerCase() === searchQuery.toLowerCase() ||
        `${city.name}, ${city.state}`.toLowerCase() === searchQuery.toLowerCase(),
    )

    if (cityMatch) {
      setMapCenter(cityMatch.coordinates)
      setMapZoom(12)
      setSearchedLocation({
        name: `${cityMatch.name}, ${cityMatch.state}`,
        coordinates: cityMatch.coordinates,
      })
      setActiveStore(null)
      setShowResults(false)
    }
  }

  // Function to handle selecting a search result
  const handleSelectResult = (result) => {
    setSearchQuery(
      result.isZip ? `${result.name}, ${result.state} ${result.zipCode}` : `${result.name}, ${result.state}`,
    )
    setMapCenter(result.coordinates)
    setMapZoom(result.isZip ? 14 : 12)
    setSearchedLocation({
      name: result.isZip ? `${result.name}, ${result.state} ${result.zipCode}` : `${result.name}, ${result.state}`,
      coordinates: result.coordinates,
    })
    setActiveStore(null)
    setShowResults(false)
  }

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchedLocation(null)
    if (userLocation) {
      setMapCenter(userLocation)
    } else {
      setMapCenter(DEFAULT_CENTER)
    }
    setMapZoom(DEFAULT_ZOOM)
  }

  // Function to handle store selection
  const selectStore = (store) => {
    setActiveStore(store.id)
    setMapCenter(store.coordinates)
    setMapZoom(14)
    setSearchedLocation(null)
  }

  // Function to handle stores found from Google Places API
  const handleStoresFound = (foundStores) => {
    setStores(foundStores)
  }

  // Helper function to calculate distance in miles
  function calculateDistance(point1, point2) {
    if (!point1 || !point2) return 0

    const R = 3958.8 // Radius of the Earth in miles
    const dLat = deg2rad(point2.lat - point1.lat)
    const dLng = deg2rad(point2.lng - point1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Function to sort stores by distance from user
  const getSortedStores = () => {
    if (!userLocation || stores.length === 0) return []

    return [...stores].sort((a, b) => {
      const distanceA = calculateDistance(userLocation, a.coordinates)
      const distanceB = calculateDistance(userLocation, b.coordinates)
      return distanceA - distanceB
    })
  }

  // Helper function to convert degrees to radians
  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  // Handle map click
  const handleMapClick = () => {
    // Close any open info windows
    setActiveStore(null)
  }

  // Find the nearest store to the user
  const nearestStore = userLocation && stores.length > 0 ? findNearestStore() : null

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
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find a Grocery Store Near You
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Locate your nearest grocery store and start saving on nutritious food today.
                </p>
              </div>
            </div>

            {/* Location Status */}
            <div className="mx-auto mt-4 max-w-md">
              {locationStatus === "loading" && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Getting your location...</span>
                </div>
              )}

              {locationStatus === "error" && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="flex items-center justify-between">
                    <span>{locationError}</span>
                    <Button size="sm" onClick={getUserLocation}>
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {locationStatus === "success" && stores.length > 0 && nearestStore && !searchedLocation && (
                <div className="mb-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Your nearest grocery store is{" "}
                    <span className="font-medium text-foreground">{nearestStore.name}</span> (
                    {calculateDistance(userLocation, nearestStore.coordinates).toFixed(1)} miles away)
                  </p>
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => selectStore(nearestStore)}>
                    View Details
                  </Button>
                </div>
              )}

              {locationStatus === "success" && stores.length === 0 && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Finding grocery stores near you...</span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="mx-auto mt-4 max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter zip code or city"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </button>
                  )}
                </div>
                <Button type="submit">Search</Button>

                {/* Autocomplete Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    <ul className="py-1">
                      {searchResults.map((result, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-muted flex items-center"
                            onClick={() => handleSelectResult(result)}
                          >
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {result.isZip
                              ? `${result.name}, ${result.state} ${result.zipCode}`
                              : `${result.name}, ${result.state}`}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>

              {searchedLocation && (
                <div className="mt-2 text-sm flex items-center justify-between">
                  <span>
                    Showing results near <span className="font-medium">{searchedLocation.name}</span>
                  </span>
                  <Button variant="link" className="p-0 h-auto text-xs" onClick={clearSearch}>
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Google Map */}
            <div className="mx-auto mt-8 max-w-5xl rounded-lg border overflow-hidden">
              <GoogleMapComponent
                stores={stores}
                activeStoreId={activeStore}
                userLocation={userLocation}
                searchedLocation={searchedLocation}
                initialCenter={mapCenter}
                initialZoom={mapZoom}
                onMapClick={handleMapClick}
                onStoreSelect={setActiveStore}
                onStoresFound={handleStoresFound}
                hasSearched={hasSearched}
                setHasSearched={setHasSearched}
              />
            </div>

            {/* Map Legend */}
            <div className="mx-auto mt-2 max-w-5xl">
              <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-muted-foreground">
                {userLocation && (
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Your Location</span>
                  </div>
                )}
                {searchedLocation && (
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span>Searched Location</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Grocery Store</span>
                </div>
                {activeStore && (
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Selected Store</span>
                  </div>
                )}
              </div>
            </div>

            {/* Store Locations */}
            <div className="mx-auto mt-12 max-w-5xl">
              <h2 className="mb-6 text-2xl font-bold">Nearby Grocery Stores</h2>
              {stores.length === 0 && locationStatus === "success" && (
                <div className="text-center p-8 bg-muted rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Searching for grocery stores near you...</p>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getSortedStores().map((store) => (
                  <Card key={store.id} className={activeStore === store.id ? "border-green-500 shadow-lg" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {store.name}
                        {nearestStore?.id === store.id && !searchedLocation && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Nearest</span>
                        )}
                      </CardTitle>
                      {store.storeType && (
                        <CardDescription className="text-sm text-green-600">{store.storeType}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-5 w-5 text-green-700" />
                        <div>
                          <p>{store.address}</p>
                          {userLocation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {calculateDistance(userLocation, store.coordinates).toFixed(1)} miles away
                            </p>
                          )}
                        </div>
                      </div>
                      {store.rating && (
                        <div className="flex items-start gap-2">
                          <Star className="mt-0.5 h-5 w-5 text-green-700" />
                          <div>
                            <p>
                              {store.rating} ⭐ ({store.userRatingsTotal || 0} reviews)
                            </p>
                          </div>
                        </div>
                      )}
                      {store.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-5 w-5 text-green-700" />
                          <p>{store.phone}</p>
                        </div>
                      )}
                      {store.hours && (
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-5 w-5 text-green-700" />
                          <div>
                            <p>{store.hours.weekday}</p>
                            <p>{store.hours.weekend}</p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button className="w-full" onClick={() => selectStore(store)}>
                          View on Map
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Directions
                          </a>
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 mt-2 flex items-center justify-center gap-2"
                        asChild
                      >
                        <Link
                          href={`/checkout/${encodeURIComponent(store.id)}?name=${encodeURIComponent(store.name)}&address=${encodeURIComponent(store.address)}`}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Grab a Bag
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
