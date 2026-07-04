const tunisianCities: Record<string, { lat: number; lng: number }> = {
  Tunis: { lat: 36.8065, lng: 10.1815 },
  Sfax: { lat: 34.7406, lng: 10.7603 },
  Sousse: { lat: 35.8256, lng: 10.6411 },
  Nabeul: { lat: 36.4561, lng: 10.7376 },
  Bizerte: { lat: 37.2744, lng: 9.8739 },
  Gabes: { lat: 33.8869, lng: 10.1021 },
  Kairouan: { lat: 35.6781, lng: 10.0963 },
  Monastir: { lat: 35.7643, lng: 10.8113 },
}

export function getCoordsForCity(city: string) {
  return tunisianCities[city] ?? tunisianCities.Tunis
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}
