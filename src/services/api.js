const defaultBaseUrl = 'http://localhost:4000'

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).replace(
  /\/+$/,
  '',
)

export async function apiRequest(path, { method, body }) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = typeof data?.error === 'string' && data.error ? data.error : 'Request failed'
    throw new Error(message)
  }

  return data
}
