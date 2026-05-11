import { NextResponse } from 'next/server'

export type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function jsonOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}
