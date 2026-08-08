export interface ApiResponse<T> {
  code: number;      
  message: string;   
  data: T;
}

//分页结果包装
export interface PageResult<T> {
  list: T[];        
  total: number;    
  page: number;     
  size: number;     
}

export type PurchaseStatus = '草稿' | '待审批' | '已审批' | '已入库' | '已作废';

//采购明细项
export interface PurchaseOrderDetailDto {
  productId: number;       
  productName?: string; 
  purchaseQuantity: number;
  purchasePrice: number;  
}

//创建/修改
export interface PurchaseFormDto {
  supplierId: number | null;          
  supplierName?: string;     
  purchaseDate?: string;           
  applicantId: number | null;              
  details: PurchaseOrderDetailDto[]; 
}

//采购单实体信息
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
  updateTime: string | null;  
  details?: PurchaseOrderDetailDto[]; 
}

//查询参数
export interface PurchaseQueryParams {
  page?: number;
  size?: number;
  keyword?: string; //模糊搜索
  status?: PurchaseStatus;
}

//操作类接口响应
export type ActionResponse = ApiResponse<null>;

//路径参数定义
export interface PurchasePathParams {
  purchaseId: number;
}