import { describe, expect, it } from 'vitest'

import {
  postInspectionReportSchema,
  reportSummarySchema,
  requestIdParamSchema,
} from './inspection-schemas'

describe('reportSummarySchema', () => {
  it('accepts "aprovado"', () => {
    const result = reportSummarySchema.safeParse({ resultado: 'aprovado' })
    expect(result.success).toBe(true)
  })

  it('accepts "reprovado"', () => {
    const result = reportSummarySchema.safeParse({ resultado: 'reprovado' })
    expect(result.success).toBe(true)
  })

  it('accepts "aprovado_com_ressalvas"', () => {
    const result = reportSummarySchema.safeParse({ resultado: 'aprovado_com_ressalvas' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown resultado value', () => {
    const result = reportSummarySchema.safeParse({ resultado: 'invalido' })
    expect(result.success).toBe(false)
  })

  it('defaults observacoes to empty string when omitted', () => {
    const result = reportSummarySchema.safeParse({ resultado: 'aprovado' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.observacoes).toBe('')
    }
  })

  it('rejects observacoes longer than 4000 characters', () => {
    const result = reportSummarySchema.safeParse({
      resultado: 'aprovado',
      observacoes: 'a'.repeat(4001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts observacoes exactly 4000 characters', () => {
    const result = reportSummarySchema.safeParse({
      resultado: 'aprovado',
      observacoes: 'a'.repeat(4000),
    })
    expect(result.success).toBe(true)
  })
})

describe('postInspectionReportSchema', () => {
  it('passes on happy path', () => {
    const result = postInspectionReportSchema.safeParse({
      report_storage_path: 'inspections/abc123/report.pdf',
      result_summary: { resultado: 'aprovado', observacoes: 'Tudo ok.' },
    })
    expect(result.success).toBe(true)
  })

  it('fails when report_storage_path is missing', () => {
    const result = postInspectionReportSchema.safeParse({
      result_summary: { resultado: 'aprovado' },
    })
    expect(result.success).toBe(false)
  })

  it('fails when result_summary is missing', () => {
    const result = postInspectionReportSchema.safeParse({
      report_storage_path: 'inspections/abc123/report.pdf',
    })
    expect(result.success).toBe(false)
  })

  it('fails when report_storage_path is empty string', () => {
    const result = postInspectionReportSchema.safeParse({
      report_storage_path: '',
      result_summary: { resultado: 'aprovado' },
    })
    expect(result.success).toBe(false)
  })
})

describe('requestIdParamSchema', () => {
  it('accepts a valid UUID', () => {
    const result = requestIdParamSchema.safeParse({
      requestId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid string', () => {
    const result = requestIdParamSchema.safeParse({ requestId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing requestId', () => {
    const result = requestIdParamSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
