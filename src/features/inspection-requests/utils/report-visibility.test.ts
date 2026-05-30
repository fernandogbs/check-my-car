import { describe, expect, it } from 'vitest'

import { canSubmitReport, canViewReport } from './report-visibility'

const CREATOR_ID = 'user-creator-001'
const ACCEPTOR_ID = 'user-acceptor-002'
const THIRD_PARTY_ID = 'user-third-003'

describe('canViewReport', () => {
  it('returns true for the creator', () => {
    expect(
      canViewReport({
        userId: CREATOR_ID,
        createdBy: CREATOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(true)
  })

  it('returns true for the acceptor', () => {
    expect(
      canViewReport({
        userId: ACCEPTOR_ID,
        createdBy: CREATOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(true)
  })

  it('returns false for an unrelated third party', () => {
    expect(
      canViewReport({
        userId: THIRD_PARTY_ID,
        createdBy: CREATOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(false)
  })

  it('returns true when status is pending and acceptedBy is null (unassigned)', () => {
    expect(
      canViewReport({
        userId: THIRD_PARTY_ID,
        createdBy: CREATOR_ID,
        acceptedBy: null,
        status: 'pending',
      }),
    ).toBe(true)
  })

  it('returns false for third party when status is pending but already assigned', () => {
    expect(
      canViewReport({
        userId: THIRD_PARTY_ID,
        createdBy: CREATOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'pending',
      }),
    ).toBe(false)
  })

  it('returns true for creator regardless of status', () => {
    expect(
      canViewReport({
        userId: CREATOR_ID,
        createdBy: CREATOR_ID,
        acceptedBy: null,
        status: 'completed',
      }),
    ).toBe(true)
  })
})

describe('canSubmitReport', () => {
  it('returns true for inspector acceptor with status accepted', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'accepted',
      }),
    ).toBe(true)
  })

  it('returns true for inspector acceptor with status in_progress', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(true)
  })

  it('returns true for inspector acceptor with status awaiting_report', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'awaiting_report',
      }),
    ).toBe(true)
  })

  it('returns false for wrong role (buyer)', () => {
    expect(
      canSubmitReport({
        navRole: 'buyer',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(false)
  })

  it('returns false for inspector who is not the acceptor', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: THIRD_PARTY_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'in_progress',
      }),
    ).toBe(false)
  })

  it('returns false for status pending', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'pending',
      }),
    ).toBe(false)
  })

  it('returns false for status completed', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: ACCEPTOR_ID,
        status: 'completed',
      }),
    ).toBe(false)
  })

  it('returns false when acceptedBy is null', () => {
    expect(
      canSubmitReport({
        navRole: 'inspector',
        userId: ACCEPTOR_ID,
        acceptedBy: null,
        status: 'in_progress',
      }),
    ).toBe(false)
  })
})
