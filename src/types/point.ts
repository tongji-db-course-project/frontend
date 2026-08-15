import type { PageQuery } from './common'

export interface PointRecord {
  pointRecordId: number
  memberId: number
  memberName: string
  saleId?: number | null
  saleNo?: string | null
  changeType: string
  changePoints: number
  remainPoints: number
  recordTime?: string | null
  remark?: string | null
}

export interface PointQuery extends PageQuery {
  memberId?: number
  changeType?: string
}
