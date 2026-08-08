export type PurchaseStatus = '草稿' | '待审批' | '已审批' | '已驳回' | '已入库';

//采购单明细项
export interface PurchaseOrderDetail {
  id?: number;
  productId: number;
  productName?: string; 
  purchaseQuantity: number;
  purchasePrice: number;
  totalAmount?: number;
}

//采购单信息
export interface PurchaseOrder {
  orderId: number;
  orderCode: string;
  supplierId: number;
  supplierName?: string;
  purchaseDate: string;
  totalAmount: number;
  applicantId: number;
  applicantName?: string;
  approverId?: number;
  status: PurchaseStatus;
  createTime: string;
  updateTime: string;
  details?: PurchaseOrderDetail[]; 
}

//查询参数
export interface PurchaseQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
}

//创建/修改提交的数据结构
export interface PurchaseFormDto {
  supplierId: number | null;
  supplierName?: string;
  purchaseDate: string;
  applicantId: number | null;
  details: {
    productId: number | null;
    productName?: string;
    purchaseQuantity: number;
    purchasePrice: number;
  }[];
}