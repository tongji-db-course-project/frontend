export const formatMoney = (value: number | null | undefined) => {
  const amount = Number(value ?? 0)
  return `¥ ${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`
}

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  return value.slice(0, 10)
}

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export const formatQuantity = (value: number | null | undefined, unit = '') => {
  return `${Number(value ?? 0).toLocaleString('zh-CN')}${unit ? ` ${unit}` : ''}`
}

export const maskPhone = (value: string | null | undefined) => {
  if (!value) return '-'
  return value.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
}

export const maskBankAccount = (value: string | null | undefined) => {
  if (!value) return '-'
  return value.length <= 8 ? value : `${value.slice(0, 4)} **** **** ${value.slice(-4)}`
}
