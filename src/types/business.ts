import type { PageQuery } from './common'

export type BusinessQuery = PageQuery & Record<string, string | number | undefined>
export type BusinessRecord = Record<string, unknown>

export interface BusinessPage<T = BusinessRecord> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface IdPayload { id: number }
export interface StatusPayload { status: string }
