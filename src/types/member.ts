import type { PageQuery } from './common'

export interface Member {
  memberId: number
  memberName: string
  phone: string
  gender?: '男' | '女' | '未知' | null
  birthday?: string | null
  levelName?: string | null
  points?: number | null
  cardBalance?: number | null
  totalAmount?: number | null
  registerTime?: string | null
  status?: string | null
}

export interface MemberQuery extends PageQuery {}

export interface MemberDto {
  memberName: string
  phone: string
  gender?: '男' | '女' | '未知'
  /** 后端支持会员生日后可直接启用表单字段。 */
  birthday?: string | null
  /** 仅创建会员时使用；后端应通过积分流水原子性写入。 */
  initialPoints?: number
  levelName?: string | null
  status?: string | null
}
