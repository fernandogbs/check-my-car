import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireUser } from '@/lib/api/supabase-session'

const ATTACHMENT_BUCKET = 'inspection-attachments'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = ['application/pdf', 'image/jpeg']

function generatePath(userId: string, file: File): string {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  return `${userId}/${crypto.randomUUID()}/${safeName}`
}

export async function POST(request: Request) {
  const session = await requireUser()
  if (!session.ok) {
    return session.response
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError(400, 'validation_error', 'Invalid form data.')
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return jsonError(400, 'validation_error', 'Missing file.')
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return jsonError(400, 'validation_error', 'Invalid file type.')
  }

  if (file.size > MAX_BYTES) {
    return jsonError(400, 'validation_error', 'File too large.')
  }

  const { user, admin } = session
  const path = generatePath(user.id, file)
  const buffer = await file.arrayBuffer()

  const { error } = await admin.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    return jsonError(500, 'upload_failed', error.message)
  }

  return jsonOk({ path }, 201)
}
