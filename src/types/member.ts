export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface Member {
  memberId: number
  memberName: string
  phone: string
  gender?: string | null
  birthday?: string | null
  points?: number | null
  totalAmount?: number | null
  recentYearAmount?: number | null
  levelName?: string | null
  discountRate?: number | null
  status?: string | null
  registerTime?: string | null
}

export interface MemberQuery {
  page: number
  size: number
  keyword?: string
  status?: string
}

export interface MemberDto {
  memberName: string
  phone: string
  gender?: string
  birthday?: string
  status?: string
  initialPoints?: number
}

export interface SaleOrder {
  saleId: number
  saleNo?: string | null
  saleDate?: string | null
  totalAmount?: number | null
  discountAmount?: number | null
  paidAmount?: number | null
  payType?: string | null
  status?: string | null
  pointsChange?: number | null
}
