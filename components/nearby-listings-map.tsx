'use client'

import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Listing } from '@/lib/types'

type NearbyListingsMapProps = {
  listings: Listing[]
  selectedListingId?: string
  onSelectListing?: (listingId: string) => void
  labels: {
    industry: string
    location: string
    quantity: string
    price: string
  }
}

const tunisiaCenter: [number, number] = [34.0, 9.0]

const defaultPin = L.divIcon({
  className: 'eco-map-pin',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const activePin = L.divIcon({
  className: 'eco-map-pin eco-map-pin-active',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function FlyToSelectedMarker({ listing }: { listing?: Listing }) {
  const map = useMap()

  useEffect(() => {
    if (!listing) return
    map.flyTo([listing.lat, listing.lng], 10, { duration: 0.7 })
  }, [listing, map])

  return null
}

function getCenter(listings: Listing[]): [number, number] {
  if (listings.length === 0) return tunisiaCenter

  const { latSum, lngSum } = listings.reduce(
    (acc, listing) => ({
      latSum: acc.latSum + listing.lat,
      lngSum: acc.lngSum + listing.lng,
    }),
    { latSum: 0, lngSum: 0 },
  )

  return [latSum / listings.length, lngSum / listings.length]
}

export function NearbyListingsMap({ listings, selectedListingId, onSelectListing, labels }: NearbyListingsMapProps) {
  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId),
    [listings, selectedListingId],
  )

  const center = useMemo(() => getCenter(listings), [listings])

  return (
    <MapContainer center={center} zoom={8} className="eco-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToSelectedMarker listing={selectedListing} />

      {listings.map((listing) => {
        const isActive = listing.id === selectedListingId

        return (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={isActive ? activePin : defaultPin}
            eventHandlers={{ click: () => onSelectListing?.(listing.id) }}
          >
            <Popup>
              <div className="eco-map-popup">
                <p className="eco-map-popup-title">{listing.title}</p>
                <p>{labels.industry}: {listing.industry}</p>
                <p>{labels.location}: {listing.location}</p>
                <p>{labels.quantity}: {listing.quantity} {listing.unit}</p>
                <p>{labels.price}: {listing.pricePerUnit} TND/{listing.unit}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
