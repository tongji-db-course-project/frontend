import type { PageQuery } from './common'

export interface Member {
  memberId: number
  memberName: string
  phone: string
  gender?: '男' | '女' | '未知' | null
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
  gender?: '男' | '女' | '未知'
  levelName?: string | null
  status?: string | null
}
