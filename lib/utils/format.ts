export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-"
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date)
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

export function formatNumber(value: number | null | undefined, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatSquareMetres(value: number | null | undefined) {
  return `${formatNumber(value, 2)} m2`
}

export function differenceInDaysFromToday(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  return Math.round((target - start) / (1000 * 60 * 60 * 24))
}
