'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

type PhotonProperties = {
  name?: string
  street?: string
  housenumber?: string
  district?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
}

type PhotonFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: PhotonProperties
}

type PhotonResponse = {
  type: 'FeatureCollection'
  features: PhotonFeature[]
}

export type AddressSuggestion = {
  id: string
  label: string
}

function formatLabel(props: PhotonProperties): string {
  const seen = new Set<string>()
  const parts: string[] = []

  function add(value: string | undefined) {
    if (value && !seen.has(value)) {
      seen.add(value)
      parts.push(value)
    }
  }

  add(props.name)

  const street = [props.street, props.housenumber].filter(Boolean).join(' ')
  if (street) add(street)

  add(props.city)
  add(props.state)
  add(props.country)

  return parts.join(', ')
}

async function fetchAddresses(query: string): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '5',
    bbox: '-73.9872,-33.7683,-28.8350,5.2718',
  })

  const res = await fetch(`https://photon.komoot.io/api/?${params}`)
  if (!res.ok) return []

  const data: PhotonResponse = await res.json()

  return data.features.map((f) => ({
    id: `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`,
    label: formatLabel(f.properties).slice(0, 200),
  }))
}

export function useAddressSearch(query: string, minLength = 3) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    if (query.trim().length < minLength) {
      setDebouncedQuery('')
      return
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(timer)
  }, [query, minLength])

  return useQuery({
    queryKey: ['address-search', debouncedQuery],
    queryFn: () => fetchAddresses(debouncedQuery),
    enabled: debouncedQuery.trim().length >= minLength,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  })
}
