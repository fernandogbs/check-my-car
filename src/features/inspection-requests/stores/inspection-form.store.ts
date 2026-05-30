import { create } from 'zustand'
import type { AdditionalSlice, MarketSlice, VehicleSlice } from '../types/inspection-request-schema'
import type { InspectionType } from '../types/inspection-type'

export type InspectionStep = 1 | 2 | 3

type VehicleErrors = Partial<Record<keyof VehicleSlice, true>>
type MarketErrors = Partial<Record<keyof MarketSlice, true>>
type AdditionalErrors = Partial<Record<keyof AdditionalSlice, true>>

export type FormErrorCode =
  | 'generic'
  | 'unauthorized'
  | 'fileTooLarge'
  | 'fileType'
  | 'uploadFailed'

type InspectionFormState = {
  step: InspectionStep
  vehicle: VehicleSlice
  vehicleErrors: VehicleErrors
  market: { inspection_type: InspectionType | ''; inspection_location: string }
  marketErrors: MarketErrors
  notes: string
  attachment: File | null
  additionalErrors: AdditionalErrors
  formError: FormErrorCode | null
}

type InspectionFormActions = {
  setStep: (step: InspectionStep) => void
  setVehicleField: (field: keyof VehicleSlice, value: string) => void
  setVehicleErrors: (errors: VehicleErrors) => void
  setMarketField: <K extends keyof MarketSlice>(field: K, value: MarketSlice[K]) => void
  setMarketErrors: (errors: MarketErrors) => void
  setNotes: (notes: string) => void
  setAttachment: (file: File | null) => void
  setAdditionalErrors: (errors: AdditionalErrors) => void
  setFormError: (error: FormErrorCode | null) => void
  reset: () => void
}

const initialState: InspectionFormState = {
  step: 1,
  vehicle: { vehicle_plate: '', vehicle_year: '', vehicle_model: '' },
  vehicleErrors: {},
  market: { inspection_type: '', inspection_location: '' },
  marketErrors: {},
  notes: '',
  attachment: null,
  additionalErrors: {},
  formError: null,
}

export const useInspectionFormStore = create<InspectionFormState & InspectionFormActions>(
  (set) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    setVehicleField: (field, value) =>
      set((s) => ({
        vehicle: { ...s.vehicle, [field]: value },
        vehicleErrors: { ...s.vehicleErrors, [field]: undefined },
      })),

    setVehicleErrors: (vehicleErrors) => set({ vehicleErrors }),

    setMarketField: (field, value) =>
      set((s) => ({
        market: { ...s.market, [field]: value },
        marketErrors: { ...s.marketErrors, [field]: undefined },
      })),

    setMarketErrors: (marketErrors) => set({ marketErrors }),

    setNotes: (notes) =>
      set((s) => ({
        notes,
        additionalErrors: { ...s.additionalErrors, notes: undefined },
      })),

    setAttachment: (attachment) =>
      set((s) => ({
        attachment,
        formError:
          s.formError === 'fileTooLarge' || s.formError === 'fileType' ? null : s.formError,
      })),

    setAdditionalErrors: (additionalErrors) => set({ additionalErrors }),

    setFormError: (formError) => set({ formError }),

    reset: () => set(initialState),
  }),
)
