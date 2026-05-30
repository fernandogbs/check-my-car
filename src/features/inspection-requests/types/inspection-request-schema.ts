import { z } from 'zod'

import { INSPECTION_TYPES } from './inspection-type'

export const vehicleSlice = z.object({
  vehicle_plate: z.string().trim().min(1).max(32),
  vehicle_year: z.string().trim().min(4).max(9),
  vehicle_model: z.string().trim().min(1).max(120),
})

export const marketSlice = z.object({
  inspection_type: z.enum(INSPECTION_TYPES),
  inspection_location: z.string().trim().min(1).max(200),
})

export const additionalSlice = z.object({
  notes: z.string().trim().max(4000).optional(),
  client_document_path: z.string().trim().min(1).max(2048).optional(),
})

export type VehicleSlice = z.infer<typeof vehicleSlice>
export type MarketSlice = z.infer<typeof marketSlice>
export type AdditionalSlice = z.infer<typeof additionalSlice>
