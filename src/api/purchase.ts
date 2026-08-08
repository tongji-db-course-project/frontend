import request from '../utils/request';
import type { PurchaseOrder, PurchaseQueryParams, PurchaseFormDto } from '../types/purchase';
import type { ApiResponse, PageResult } from '../types/common';

// 1. 获取环境变量中的 Mock 开关
const isMock = import.meta.env.VITE_USE_LOCAL_MOCK === 'true';

// 2. 本地模拟数据（仅在 Mock 模式下使用）
const MOCK_LIST: PurchaseOrder[] = [
  {
    orderId: 1001,
    orderCode: 'CG202608040001',
    supplierId: 1,
    supplierName: '华东食品供应链',
    purchaseDate: '2026-08-04',
    totalAmount: 12860.00,
    status: '待审批',
    applicantId: 3, 
    applicantName: '陈经理',
    createTime: '2026-08-04 09:00:00',
    updateTime: '2026-08-04 09:00:00',
    details: [
      { productId: 101, productName: '可口可乐 500ml', purchaseQuantity: 100, purchasePrice: 2.50 },
      { productId: 102, productName: '乐事原味薯片', purchaseQuantity: 50, purchasePrice: 7.00 }
    ]
  },
  {
    orderId: 1002,
    orderCode: 'CG202608030002',
    supplierId: 2,
    supplierName: '城市生鲜配送',
    purchaseDate: '2026-08-03',
    totalAmount: 540.00,
    status: '草稿',
    applicantId: 4,
    applicantName: '林晓',
    createTime: '2026-08-03 14:20:00',
    updateTime: '2026-08-03 14:20:00',
    details: [
      { productId: 103, productName: '农夫山泉 2L', purchaseQuantity: 200, purchasePrice: 2.70 }
    ]
  },
  {
    orderId: 1003,
    orderCode: 'CG202608020003',
    supplierId: 1,
    supplierName: '华东食品供应链',
    purchaseDate: '2026-08-02',
    totalAmount: 21500.00,
    status: '已入库',
    applicantId: 1,
    applicantName: '管理员',
    createTime: '2026-08-02 10:00:00',
    updateTime: '2026-08-02 11:30:00'
  }
];

// 辅助函数：模拟 Axios 响应结构
const mockResponse = <T>(data: T): Promise<any> => {
  return Promise.resolve({
    data: {
      code: 200,
      message: '操作成功 (来自本地 Mock 数据)',
      data: data
    }
  });
};

// 3. API 导出
export const purchaseApi = {
  // 查询采购单列表
  getList(params: PurchaseQueryParams) {
    if (isMock) {
      // 在模拟模式下，根据状态进行简单过滤
      let filtered = MOCK_LIST;
      if (params.status) filtered = filtered.filter(i => i.status === params.status);
      if (params.keyword) filtered = filtered.filter(i => i.orderCode.includes(params.keyword!) || i.supplierName?.includes(params.keyword!));

      return mockResponse<PageResult<PurchaseOrder>>({
        list: filtered,
        total: filtered.length,
        page: params.page || 1,
        size: params.size || 10
      });
    }
    // 真实模式
    return request.get<ApiResponse<PageResult<PurchaseOrder>>>('/purchases', { params });
  },

  // 获取采购单详情
  getDetail(id: number) {
    if (isMock) {
      const item = MOCK_LIST.find(o => o.orderId === id) || MOCK_LIST[0];
      return mockResponse<PurchaseOrder>(item);
    }
    return request.get<ApiResponse<PurchaseOrder>>(`/purchases/${id}`);
  },

  // 创建采购单
  create(data: PurchaseFormDto) {
    if (isMock) { //测试模拟
      console.log('Mock 接收到创建请求:', data);
      const totalAmount = data.details.reduce((sum, item) => sum + item.purchasePrice * item.purchaseQuantity, 0);
      const newOrder: PurchaseOrder = {
        orderId: Date.now(),
        orderCode: 'CG_NEW_' + Date.now(),
        supplierId: data.supplierId ?? 0,
        supplierName: data.supplierName || `供应商 #${data.supplierId || 0}`,
        purchaseDate: data.purchaseDate,
        totalAmount,
        status: '草稿',
        applicantId: data.applicantId || 1,
        applicantName: '管理员',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        details: data.details.map(item => ({
          productId: item.productId || 0,
          productName: item.productName,
          purchaseQuantity: item.purchaseQuantity,
          purchasePrice: item.purchasePrice,
        })),
      };
      MOCK_LIST.unshift(newOrder);
      return mockResponse(newOrder);
    }
    return request.post<ApiResponse<PurchaseOrder>>('/purchases', data);
  },

  // 修改采购单
  update(id: number, data: PurchaseFormDto) {
    if (isMock) {
      console.log(`Mock 接收到修改请求 (ID: ${id}):`, data);
      return mockResponse(null);
    }
    return request.put<ApiResponse<any>>(`/purchases/${id}`, data);
  },

  // 删除采购单
  delete(id: number) {
    if (isMock) return mockResponse(null);
    return request.delete<ApiResponse<any>>(`/purchases/${id}`);
  },

  // 提交审批
  submit(id: number) {
    return isMock ? mockResponse(null) : request.post(`/purchases/${id}/submit`);
  },

  // 审批通过
  approve(id: number) {
    return isMock ? mockResponse(null) : request.post(`/purchases/${id}/approve`);
  },

  // 驳回
  reject(id: number) {
    return isMock ? mockResponse(null) : request.post(`/purchases/${id}/reject`);
  },

  // 采购入库
  stockIn(id: number) {
    return isMock ? mockResponse(null) : request.post(`/purchases/${id}/stock-in`);
  }
};