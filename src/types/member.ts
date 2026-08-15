import type { PageQuery } from './common'

export interface Member {
  memberId: number
  memberName: string
  phone: string
  gender?: string | null
  levelName?: string | null
  points?: number | null
  totalAmount?: number | null
  registerTime?: string | null
  status?: string | null
}

export interface MemberQuery extends PageQuery {}

export interface MemberDto {
  memberName: string
  phone: string
  gender?: string
  levelName?: string
  status?: string
}
