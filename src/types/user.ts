import type { PageQuery } from './common'

export interface SystemUser {
  userId: number
  roleId?: number | null
  roleName?: string | null
  username: string
  realName?: string | null
  gender?: string | null
  phone?: string | null
  status?: string | null
  createTime?: string | null
}

export interface UserQuery extends PageQuery {}

export interface CreateUserPayload {
  roleId?: number | null
  username: string
  password: string
  realName?: string | null
  gender?: string | null
  phone?: string | null
  status?: string | null
}

export type UpdateUserPayload = Omit<CreateUserPayload, 'username' | 'password'>
