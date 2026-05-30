import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { InspectionReportForm } from './inspection-report-form'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── Helpers ────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderForm(props?: { requestId?: string; initialSummary?: null }) {
  const qc = makeQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <InspectionReportForm
        requestId={props?.requestId ?? 'test-id'}
        initialSummary={props?.initialSummary ?? null}
      />
    </QueryClientProvider>,
  )
}

function makePdfFile(name = 'report.pdf') {
  return new File(['%PDF-1.4 content'], name, { type: 'application/pdf' })
}

function getFileInput(container: HTMLElement) {
  // The hidden <input type="file"> — use querySelector since it's sr-only
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

function getSubmitButton() {
  // The submit button label is 'actions.submit' (key returned by mock)
  return screen.getByRole('button', { name: 'actions.submit' })
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('InspectionReportForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    expect(() => renderForm()).not.toThrow()
  })

  it('shows validation error when submit is clicked with no file and no result', async () => {
    renderForm()

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert').textContent).toContain('errors.validation')
  })

  it('shows validation error when file is selected but no resultado is chosen', async () => {
    const { container } = renderForm()

    const fileInput = getFileInput(container)
    expect(fileInput).not.toBeNull()

    fireEvent.change(fileInput, { target: { files: [makePdfFile()] } })
    // resultado still empty — click submit
    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert').textContent).toContain('errors.validation')
  })

  it('shows forbidden error when the report POST returns 403', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (String(url).includes('/attachments')) {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ path: 'inspections/x/report.pdf' }),
          })
        }
        if (String(url).includes('/report')) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ error: { code: 'forbidden' } }),
          })
        }
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
      },
    )

    const { container } = renderForm()

    // Select a file
    const fileInput = getFileInput(container)
    fireEvent.change(fileInput, { target: { files: [makePdfFile()] } })

    // Select resultado via radio button
    const radio = screen.getByRole('radio', { name: 'result.aprovado' })
    fireEvent.click(radio)

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert').textContent).toContain('errors.forbidden')
  })

  it('shows uploadFailed error when the attachments POST returns 500', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (String(url).includes('/attachments')) {
          return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) })
      },
    )

    const { container } = renderForm()

    const fileInput = getFileInput(container)
    fireEvent.change(fileInput, { target: { files: [makePdfFile()] } })

    const radio = screen.getByRole('radio', { name: 'result.aprovado' })
    fireEvent.click(radio)

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert').textContent).toContain('errors.uploadFailed')
  })

  it('redirects to request detail on happy path', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (String(url).includes('/attachments')) {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ path: 'inspections/x/report.pdf' }),
          })
        }
        if (String(url).includes('/report')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: {} }),
          })
        }
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
      },
    )

    const { container } = renderForm({ requestId: 'abc-123' })

    const fileInput = getFileInput(container)
    fireEvent.change(fileInput, { target: { files: [makePdfFile()] } })

    const radio = screen.getByRole('radio', { name: 'result.aprovado' })
    fireEvent.click(radio)

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/requests/abc-123')
    })
  })
})
