export interface TableColumn{
    label:string;
    prop:string;
    width?:number | string;
}

export interface PageQuery {
    page: number;
    size: number;
    keyword?: string;
    status?: string;
}

export interface PageResult<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface OrderTimelineItem {
  logId: number
  orderType?: string
  orderId: number
  oldStatus?: string | null
  newStatus: string
  operatorId: number
  changeTime?: string | null
  remark?: string | null
}


