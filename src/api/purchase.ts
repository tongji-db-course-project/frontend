import axios from 'axios';
import type { 
  PurchaseOrder, 
  PurchaseQueryParams, 
  PurchaseFormDto, 
  ApiResponse, 
  PageResult 
} from '../types/purchase';

const isMock = import.meta.env.VITE_USE_LOCAL_MOCK === 'true';

//模拟商品
const PRODUCT_DICT: Record<number, string> = {
  101: '可口可乐 330ml',
  102: '乐事薯片 原味',
  105: '农夫山泉 550ml',
  305: '办公椅'
};

//模拟数据库
const MOCK_DB: PurchaseOrder[] = [
  {
    orderId: 1001,
    orderCode: 'PR20240801001',
    supplierId: 1,
    supplierName: '农夫山泉股份有限公司',
    purchaseDate: '2024-08-01',
    totalAmount: 1250.0,
    applicantId: 3,
    status: '草稿',
    createTime: '2024-08-01T10:00:00',
    updateTime: '2024-08-01T10:00:00',
    details: [
      { productId: 101, productName: PRODUCT_DICT[101], purchaseQuantity: 100, purchasePrice: 5.5 },
      { productId: 102, productName: PRODUCT_DICT[102], purchaseQuantity: 200, purchasePrice: 3.5 }
    ]
  },
  {
    orderId: 2001,
    orderCode: 'PR20240802005',
    supplierId: 2,
    supplierName: '晨光文具供应商',
    purchaseDate: '2024-08-02',
    totalAmount: 8800.0,
    applicantId: 2,
    approverId: 1,
    status: '待审批',
    createTime: '2024-08-02T14:00:00',
    updateTime: '2024-08-03T09:30:00',
    details: [
      { productId: 305, productName: PRODUCT_DICT[305], purchaseQuantity: 10, purchasePrice: 880.0 }
    ]
  },
  {
    orderId: 2002,
    orderCode: 'PR20240804009',
    supplierId: 1,
    supplierName: '农夫山泉股份有限公司',
    purchaseDate: '2024-08-04',
    totalAmount: 450.0,
    applicantId: 3,
    status: '已入库',
    createTime: '2024-08-04T10:00:00',
    updateTime: '2024-08-05T16:00:00',
    details: [
      { productId: 101, productName: PRODUCT_DICT[101], purchaseQuantity: 80, purchasePrice: 5.0 },
      { productId: 105, productName: PRODUCT_DICT[105], purchaseQuantity: 10, purchasePrice: 5.0 }
    ]
  }
];

//模拟响应辅助函数
const mockResponse = <T>(data: T, code = 200, message = '成功'): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const res = { data: { code, message: `[Mock] ${message}`, data } };
      code >= 400 ? reject({ response: { status: code, data: res.data } }) : resolve(res);
    }, 400);
  });
};

//通用Axios响应校验辅助函数
const handleResponse = <T>(promise: Promise<any>): Promise<ApiResponse<T>> => {
  return promise.then(res => {
    if (res.data && res.data.code !== 200) {
      return Promise.reject(new Error(res.data.message || '请求处理失败'));
    }
    return res;
  });
};

//采购单(PR)
export const prApi = {
  getList: (params: PurchaseQueryParams) => {
    if (isMock) {
      let list = [...MOCK_DB];
      if (params.status) list = list.filter(i => i.status === params.status);
      if (params.keyword) {
        list = list.filter(i => i.orderCode.includes(params.keyword!) || (i.supplierName && i.supplierName.includes(params.keyword!)));
      }
      return mockResponse<PageResult<PurchaseOrder>>({ list, total: list.length, page: 1, size: 10 });
    }
    return handleResponse<PageResult<PurchaseOrder>>(axios.get('/purchases', { params }));
  },
  
  create: (data: PurchaseFormDto) => {
    if (isMock) {
      const newId = Date.now();
      // 计算总金额
      const total = (data.details || []).reduce((s, i) => s + (i.purchaseQuantity || 0) * (i.purchasePrice || 0), 0);
      const newOrder = { 
        orderId: newId, 
        orderCode: 'PR' + newId, 
        ...data, 
        totalAmount: total, 
        status: '草稿', 
        createTime: new Date().toISOString(),
        details: (data.details || []).map(d => ({ 
          ...d, 
          productName: d.productName || PRODUCT_DICT[d.productId] || `商品${d.productId}` 
        }))
      };
      MOCK_DB.unshift(newOrder as any);
      return mockResponse(newOrder);
    }
    return handleResponse<PurchaseOrder>(axios.post('/purchases', data));
  },

  getDetail: (id: number) => {
    if (isMock) {
      const item = MOCK_DB.find(o => o.orderId === id);
      return mockResponse(item);
    }
    return handleResponse<PurchaseOrder>(axios.get(`/purchases/${id}`));
  },

  update: (id: number, data: PurchaseFormDto) => {
    if (isMock) {
      const index = MOCK_DB.findIndex(o => o.orderId === id);
      if (index !== -1) {
        // 重新计算总金额
        const total = (data.details || []).reduce((s, i) => s + (i.purchaseQuantity || 0) * (i.purchasePrice || 0), 0);
        MOCK_DB[index] = {
          ...MOCK_DB[index],
          supplierName: data.supplierName || MOCK_DB[index].supplierName,
          supplierId: data.supplierId || MOCK_DB[index].supplierId,
          purchaseDate: data.purchaseDate || MOCK_DB[index].purchaseDate,
          totalAmount: total, // 更新总金额
          updateTime: new Date().toISOString(),
          details: (data.details || []).map(d => ({
            productId: d.productId || 0,
            productName: d.productName || `商品${d.productId}`,
            purchasePrice: d.purchasePrice || 0,
            purchaseQuantity: d.purchaseQuantity || 0
          }))
        };
        return mockResponse(MOCK_DB[index]);
      }
      return mockResponse(null, 404, '未找到该采购单');
    }
    return handleResponse<PurchaseOrder>(axios.put(`/purchases/${id}`, data));
  },

  delete: (id: number) => {
    if (isMock) {
      const index = MOCK_DB.findIndex(o => o.orderId === id);
      if (index !== -1) MOCK_DB.splice(index, 1);
      return mockResponse(null);
    }
    return handleResponse<null>(axios.delete(`/purchases/${id}`));
  },

  submit: (id: number) => {
     if (isMock) { 
       const o = MOCK_DB.find(i => i.orderId === id); 
       if(o) o.status = '待审批'; 
       return mockResponse(null); 
     }
     return handleResponse<null>(axios.post(`/purchases/${id}/submit`));
  },

  approve: (id: number) => 
    isMock ? mockResponse(null) : handleResponse<null>(axios.post(`/purchases/${id}/approve`)),

  reject: (id: number) => 
    isMock ? mockResponse(null) : handleResponse<null>(axios.post(`/purchases/${id}/reject`)),

  inStock: (id: number) => 
    isMock ? mockResponse(null) : handleResponse<null>(axios.post(`/purchases/${id}/stock-in`)),
};

export const poApi = prApi;
export const purchaseApi = prApi;