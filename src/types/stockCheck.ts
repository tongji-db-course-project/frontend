import type { PageQuery } from './common'

export type StockCheckStatus = '盘点中' | '已完成' | '已作废'

export interface StockCheckListItem {
  checkId: number; checkNo: string; productName: string; status: StockCheckStatus
  operatorName: string
  checkDate?: string | null; completeDate?: string | null; remark?: string | null
}
export interface StockCheckItem {
  productId: number; productName: string; barcode?: string | null; unit?: string | null
  systemQty: number; actualQty?: number | null; differenceQty?: number | null
  adjustPrice?: number | null; adjustAmount?: number | null; resultType: string
}
export interface StockCheckDetail extends StockCheckListItem { items: StockCheckItem[] }
export type StockCheckQuery = PageQuery
