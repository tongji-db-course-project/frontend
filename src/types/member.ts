import type { PageQuery } from './common'

export interface Member {
  memberId: number
  memberName: string
  phone: string
  gender?: '男' | '女' | '未知' | null
  birthday?: string | null
  points?: number | null
  memberTag?: string | null
  totalAmount?: number | null
  createTime?: string | null
}

export interface MemberQuery extends PageQuery {}

export interface MemberDto {
  memberName: string
  phone: string
  gender?: '男' | '女' | '未知'
  birthday?: string | null
  memberTag?: string | null
}
