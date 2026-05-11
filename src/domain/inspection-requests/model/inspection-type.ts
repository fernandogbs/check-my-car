export const INSPECTION_TYPES = ['cautelar', 'transferencia'] as const

export type InspectionType = (typeof INSPECTION_TYPES)[number]
