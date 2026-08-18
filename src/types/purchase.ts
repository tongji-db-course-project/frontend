export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export type PurchaseStatus = '待审批' | '已审批' | '已入库' | '已驳回' |'已作废';

export interface PurchaseOrderDetailDto {
  productId: number;
  productName?: string;
  purchaseQuantity: number;
  purchasePrice: number;
}

export interface PurchaseCreateDto {
  supplierId: number | null;
  purchaseDate?: string;
  applicantId: number | null;
  details: PurchaseOrderDetailDto[];
}

export type PurchaseFormDto = PurchaseCreateDto;

export interface PurchaseOrder {
  orderId: number;
  orderCode: string;
  supplierId: number | null;
  purchaseDate: string;
  totalAmount: number | null;
  applicantId: number | null;
  approverId?: number | null;
  supplierName?: string;
  applicantName?: string;
  status: PurchaseStatus;
  createTime: string;
  updateTime?: string | null;
  details?: PurchaseOrderDetailDto[];
}

export interface PurchaseQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: PurchaseStatus;
  supplierId?: number;
}

export interface ApprovalDto {
  approverId: number;
  remark?: string;
}

export interface PurchaseStockInDetailDto {
  productId: number;
  stockInQuantity: number;
}

export interface PurchaseStockInDto {
  operatorId: number;
  warehouseId: number;
  stockInDate: string;
  details: PurchaseStockInDetailDto[];
  remark?: string;
}

export interface OrderStatusResult {
  orderId: number;
  orderCode: string;
  status: PurchaseStatus;
  operatorId?: number | null;
  changeTime: string;
}

export interface PurchaseStockInResult {
  orderId: number;
  orderCode: string;
  status: PurchaseStatus;
  stockInTime: string;
  totalAmount: number | null;
}

export type ActionResponse = ApiResponse<null>;

export interface PurchasePathParams {
  purchaseId: number;
}