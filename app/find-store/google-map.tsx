"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBMG3ECGD0O1JJ1qVyVz_e6gmqEfmt_Ll8"

// Map container style
const containerStyle = {
  width: "100%",
  height: "400px",
}

// Default map options
const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

// Libraries to load
const libraries = ["places"]

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
  photos?: google.maps.places.PlacePhoto[]
  storeType?: string
}

interface GoogleMapComponentProps {
  stores: Store[]
  activeStoreId: string | null
  userLocation: { lat: number; lng: number } | null
  searchedLocation: { name: string; coordinates: { lat: number; lng: number } } | null
  initialCenter: { lat: number; lng: number }
  initialZoom: number
  onMapClick?: (event: google.maps.MapMouseEvent) => void
  onStoreSelect?: (storeId: string) => void
  onStoresFound?: (stores: Store[]) => void
  hasSearched: boolean
  setHasSearched: (value: boolean) => void
}

export default function GoogleMapComponent({
  stores,
  activeStoreId,
  userLocation,
  searchedLocation,
  initialCenter,
  initialZoom,
  onMapClick,
  onStoreSelect,
  onStoresFound,
  hasSearched,
  setHasSearched,
}: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries as any,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [directionsLoading, setDirectionsLoading] = useState(false)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  // Initialize the map
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    placesService.current = new google.maps.places.PlacesService(map)
  }, [])

  // Clean up on unmount
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Set up directions service when map is loaded
  useEffect(() => {
    if (isLoaded && !directionsService.current) {
      directionsService.current = new google.maps.DirectionsService()
    }
  }, [isLoaded])

  // Search for nearby grocery stores when user location changes
  useEffect(() => {
    if (isLoaded && map && userLocation && placesService.current && !hasSearched) {
      // Set hasSearched to true to prevent multiple searches
      setHasSearched(true)

      const request = {
        location: userLocation,
        radius: 5000, // 5km radius
        type: "grocery_or_supermarket",
        // Add keyword to focus on actual grocery stores and supermarkets
        keyword: "supermarket|grocery store|food market|farmers market",
      }

      placesService.current.nearbySearch(
        request,
        (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            // Filter out likely convenience stores based on name and rating
            const filteredResults = results.filter((place) => {
              // Skip places with these keywords in their names
              const isConvenienceStore =
                /convenience|gas station|corner store|mini mart|liquor|7-eleven|circle k|ampm|quick stop/i.test(
                  place.name || "",
                )

              // Ensure minimum size/rating (convenience stores tend to be smaller/lower rated)
              const hasMinimumRating = (place.rating || 0) >= 3.0
              const hasMinimumReviews = (place.user_ratings_total || 0) >= 5

              return !isConvenienceStore && hasMinimumRating && hasMinimumReviews
            })

            const groceryStores: Store[] = filteredResults.map((place) => ({
              id: place.place_id || `store-${Math.random().toString(36).substr(2, 9)}`,
              name: place.name || "Unknown Store",
              address: place.vicinity || "Address unavailable",
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              placeId: place.place_id,
              photos: place.photos,
              storeType: "Grocery Store", // Add a store type indicator
            }))

            if (onStoresFound) {
              onStoresFound(groceryStores)
            }
          } else {
            console.error("Nearby search failed:", status)
          }
        },
      )
    }
  }, [isLoaded, map, userLocation, onStoresFound, hasSearched, setHasSearched])

  // Update selected store when activeStoreId changes
  useEffect(() => {
    if (activeStoreId !== null) {
      const store = stores.find((s) => s.id === activeStoreId) || null
      setSelectedStore(store)
    } else {
      setSelectedStore(null)
    }
  }, [activeStoreId, stores])

  // Handle marker click
  const handleMarkerClick = (store: Store) => {
    setSelectedStore(store)
    if (onStoreSelect) {
      onStoreSelect(store.id)
    }
  }

  // Get directions from user location to selected store
  const getDirections = () => {
    if (!directionsService.current || !userLocation || !selectedStore) return

    setDirectionsLoading(true)
    setDirections(null)

    directionsService.current.route(
      {
        origin: userLocation,
        destination: selectedStore.coordinates,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setDirectionsLoading(false)
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
        } else {
          console.error(`Directions request failed: ${status}`)
          alert("Could not calculate directions. Please try again.")
        }
      },
    )
  }

  // Clear directions
  const clearDirections = () => {
    setDirections(null)
  }

  // Get place details
  const getPlaceDetails = (placeId: string) => {
    if (!placesService.current) return

    const request = {
      placeId: placeId,
      fields: ["formatted_phone_number", "opening_hours"],
    }

    placesService.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // Update the store with additional details
        const updatedStore = {
          ...selectedStore!,
          phone: place.formatted_phone_number || "Phone unavailable",
          hours: place.opening_hours
            ? {
                weekday: place.opening_hours.weekday_text?.slice(0, 5).join(", ") || "Hours unavailable",
                weekend: place.opening_hours.weekday_text?.slice(5).join(", ") || "Hours unavailable",
              }
            : undefined,
        }
        setSelectedStore(updatedStore)
      }
    })
  }

  // Fetch additional details when a store is selected
  useEffect(() => {
    if (selectedStore?.placeId && placesService.current) {
      getPlaceDetails(selectedStore.placeId)
    }
  }, [selectedStore?.id])

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading map...</p>
      </div>
    )
  }

  // Show error state
  if (loadError) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-muted">
        <p className="text-red-500">Error loading Google Maps</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={initialZoom}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {/* Store markers */}
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={store.coordinates}
            icon={{
              url:
                store.id === activeStoreId
                  ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            onClick={() => handleMarkerClick(store)}
          />
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        )}

        {/* Searched location marker */}
        {searchedLocation && (
          <Marker
            position={searchedLocation.coordinates}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        )}

        {/* Info window for selected store */}
        {selectedStore && (
          <InfoWindow position={selectedStore.coordinates} onCloseClick={() => setSelectedStore(null)}>
            <div className="p-2 max-w-[250px]">
              <h3 className="font-bold text-lg">{selectedStore.name}</h3>
              <p className="text-sm">{selectedStore.address}</p>
              {selectedStore.rating && (
                <p className="text-sm mt-2">
                  Rating: {selectedStore.rating} ⭐ ({selectedStore.userRatingsTotal} reviews)
                </p>
              )}
              {selectedStore.phone && (
                <p className="text-sm mt-2">
                  <strong>Phone:</strong> {selectedStore.phone}
                </p>
              )}
              {selectedStore.hours && (
                <div className="mt-2 text-xs">
                  <p>
                    <strong>Weekdays:</strong> {selectedStore.hours.weekday}
                  </p>
                  <p>
                    <strong>Weekend:</strong> {selectedStore.hours.weekend}
                  </p>
                </div>
              )}
              {userLocation && (
                <div className="mt-3">
                  {!directions ? (
                    <Button size="sm" className="w-full" onClick={getDirections} disabled={directionsLoading}>
                      {directionsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Getting directions...
                        </>
                      ) : (
                        "Get Directions"
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" onClick={clearDirections}>
                      Clear Directions
                    </Button>
                  )}
                </div>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Directions renderer */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#22c55e",
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Directions panel */}
      {directions && (
        <div className="mt-4 p-4 border rounded-md bg-white max-h-[300px] overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Directions to {selectedStore?.name}</h3>
            <Button size="sm" variant="ghost" onClick={clearDirections}>
              Close
            </Button>
          </div>
          <div className="text-sm">
            <p className="font-medium">Distance: {directions.routes[0].legs[0].distance?.text || "N/A"}</p>
            <p className="font-medium mb-2">Duration: {directions.routes[0].legs[0].duration?.text || "N/A"}</p>
            <ol className="list-decimal pl-5 space-y-1">
              {directions.routes[0].legs[0].steps.map((step, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: step.instructions }} />
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
