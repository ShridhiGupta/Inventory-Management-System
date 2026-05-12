/** Extract a readable error message from an axios/API error */
export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg
  return fallback
}

export function formatCurrency(value, currency = 'USD') {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)
}
