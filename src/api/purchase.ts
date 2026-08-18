import request from '../utils/request';
import type {
  ApiResponse,
  ApprovalDto,
  OrderStatusResult,
  PageResult,
  PurchaseCreateDto,
  PurchaseOrder,
  PurchaseQueryParams,
  PurchaseStockInDto,
  PurchaseStockInResult,
} from '../types/purchase';

const PURCHASE_ORDER_PATH = '/purchase-orders';
const useLocalMock = import.meta.env.VITE_USE_LOCAL_MOCK === 'true';

const MOCK_PURCHASES: PurchaseOrder[] = [
  {
    orderId: 1001,
    orderCode: 'CG202607060001',
    supplierId: 1,
    purchaseDate: '2026-07-06',
    totalAmount: 275,
    applicantId: 3,
    approverId: 1,
    status: '待审批',
    createTime: '2026-07-06T10:00:00',
    updateTime: '2026-07-06T11:00:00',
    details: [
      { productId: 101, purchaseQuantity: 50, purchasePrice: 2.5 },
    ],
  },
  {
    orderId: 1002,
    orderCode: 'CG202607060002',
    supplierId: 2,
    purchaseDate: '2026-07-07',
    totalAmount: 520,
    applicantId: 4,
    approverId: 1,
    status: '已审批',
    createTime: '2026-07-07T09:00:00',
    updateTime: '2026-07-07T10:30:00',
    details: [
      { productId: 102, purchaseQuantity: 40, purchasePrice: 13 },
    ],
  },
  {
    orderId: 1003,
    orderCode: 'CG202607060003',
    supplierId: 3,
    purchaseDate: '2026-07-08',
    totalAmount: 880,
    applicantId: 5,
    approverId: 2,
    status: '已入库',
    createTime: '2026-07-08T11:00:00',
    updateTime: '2026-07-08T16:00:00',
    details: [
      { productId: 105, purchaseQuantity: 20, purchasePrice: 44 },
    ],
  },
];

const mockResponse = <T>(data: T, code = 200, message = '成功') =>
  Promise.resolve({
    data: {
      code,
      message,
      data,
    },
  });

const normalizeId = (id: number | null | undefined, fallback = 1) => {
  const value = Number(id);
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
};

export const purchaseApi = {
  getList(params: PurchaseQueryParams = {}) {
    if (useLocalMock) {
      let list = [...MOCK_PURCHASES];
      if (params.keyword) {
        const keyword = params.keyword.trim();
        list = list.filter((item) =>
          item.orderCode.includes(keyword) ||
          String(item.supplierId).includes(keyword) ||
          String(item.orderId).includes(keyword),
        );
      }
      if (params.status) {
        list = list.filter((item) => item.status === params.status);
      }
      if (params.supplierId) {
        list = list.filter((item) => item.supplierId === params.supplierId);
      }
      const page = Number(params.page || 1);
      const size = Number(params.size || 10);
      const start = (page - 1) * size;
      return mockResponse<PageResult<PurchaseOrder>>({
        list: list.slice(start, start + size),
        total: list.length,
        page,
        size,
      });
    }
    return request.get<unknown, PageResult<PurchaseOrder>>(PURCHASE_ORDER_PATH, { params });
  },

  getDetail(orderId: number) {
    if (useLocalMock) {
      const item = MOCK_PURCHASES.find((x) => x.orderId === orderId) || null;
      return mockResponse<PurchaseOrder | null>(item);
    }
    return request.get<unknown, PurchaseOrder>(`${PURCHASE_ORDER_PATH}/${orderId}`);
  },

  create(data: PurchaseCreateDto) {
    if (useLocalMock) {
      const newOrder: PurchaseOrder = {
        orderId: Date.now(),
        orderCode: `CG${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-4)}`,
        supplierId: normalizeId(data.supplierId, 1),
        purchaseDate: data.purchaseDate || '2026-07-06',
        totalAmount: (data.details || []).reduce((sum, item) => sum + item.purchaseQuantity * item.purchasePrice, 0),
        applicantId: normalizeId(data.applicantId, 1),
        approverId: null,
        status: '待审批',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        details: data.details.map((item) => ({
          productId: normalizeId(item.productId, 1),
          purchaseQuantity: item.purchaseQuantity,
          purchasePrice: item.purchasePrice,
        })),
      };
      MOCK_PURCHASES.unshift(newOrder);
      return mockResponse<PurchaseOrder>(newOrder);
    }
    return request.post<unknown, PurchaseOrder>(PURCHASE_ORDER_PATH, data);
  },

  update(orderId: number, data: PurchaseCreateDto) {
    if (useLocalMock) {
      const index = MOCK_PURCHASES.findIndex((x) => x.orderId === orderId);
      if (index === -1) {
        return mockResponse<null>(null, 404, '未找到采购单');
      }
      if (MOCK_PURCHASES[index].status !== '待审批') {
        return mockResponse<null>(null, 400, '只有待审批状态的采购单才能编辑');
      }
      const updated: PurchaseOrder = {
        ...MOCK_PURCHASES[index],
        supplierId: normalizeId(data.supplierId, 1),
        purchaseDate: data.purchaseDate || MOCK_PURCHASES[index].purchaseDate,
        applicantId: normalizeId(data.applicantId, 1),
        totalAmount: (data.details || []).reduce((sum, item) => sum + item.purchaseQuantity * item.purchasePrice, 0),
        updateTime: new Date().toISOString(),
        details: data.details.map((item) => ({
          productId: normalizeId(item.productId, 1),
          purchaseQuantity: item.purchaseQuantity,
          purchasePrice: item.purchasePrice,
        })),
      };
      MOCK_PURCHASES[index] = updated;
      return mockResponse<PurchaseOrder>(updated);
    }
    return request.put<unknown, PurchaseOrder>(`${PURCHASE_ORDER_PATH}/${orderId}`, data);
  },

  remove(orderId: number) {
    if (useLocalMock) {
      const index = MOCK_PURCHASES.findIndex((x) => x.orderId === orderId);
      if (index >= 0) {
        MOCK_PURCHASES[index] = { ...MOCK_PURCHASES[index], status: '已作废', updateTime: new Date().toISOString() };
      }
      return mockResponse<null>(null);
    }
    return request.delete<unknown, null>(`${PURCHASE_ORDER_PATH}/${orderId}`);
  },

  approve(orderId: number, data: ApprovalDto) {
    if (useLocalMock) {
      const item = MOCK_PURCHASES.find((x) => x.orderId === orderId);
      if (!item) {
        return mockResponse<null>(null, 404, '未找到采购单');
      }
      if (item.status !== '待审批') {
        return mockResponse<null>(null, 400, '只有待审批状态的采购单才能审批');
      }
      item.approverId = data.approverId;
      item.status = '已审批';
      item.updateTime = new Date().toISOString();
      return mockResponse<OrderStatusResult>({
        orderId: item.orderId,
        orderCode: item.orderCode,
        status: item.status,
        operatorId: data.approverId,
        changeTime: new Date().toISOString(),
      });
    }
    return request.post<unknown, OrderStatusResult>(`${PURCHASE_ORDER_PATH}/${orderId}/approve`, data);
  },

  reject(orderId: number, data: ApprovalDto) {
    if (useLocalMock) {
      const item = MOCK_PURCHASES.find((x) => x.orderId === orderId);
      if (!item) {
        return mockResponse<null>(null, 404, '未找到采购单');
      }
      if (item.status !== '待审批') {
        return mockResponse<null>(null, 400, '只有待审批状态的采购单才能驳回');
      }
      item.status = '已驳回';
      item.approverId = data.approverId;
      item.updateTime = new Date().toISOString();
      return mockResponse<null>(null);
    }
    return request.post<unknown, null>(`${PURCHASE_ORDER_PATH}/${orderId}/reject`, data);
  },

  stockIn(orderId: number, data: PurchaseStockInDto) {
    if (useLocalMock) {
      const item = MOCK_PURCHASES.find((x) => x.orderId === orderId);
      if (!item) {
        return mockResponse<null>(null, 404, '未找到采购单');
      }
      if (item.status !== '已审批') {
        return mockResponse<null>(null, 400, '只有审批通过的采购单才能入库');
      }
      item.status = '已入库';
      item.updateTime = new Date().toISOString();
      return mockResponse<PurchaseStockInResult>({
        orderId: item.orderId,
        orderCode: item.orderCode,
        status: '已入库',
        stockInTime: new Date().toISOString(),
        totalAmount: item.totalAmount,
      });
    }
    return request.post<unknown, PurchaseStockInResult>(`${PURCHASE_ORDER_PATH}/${orderId}/stock-in`, data);
  },
};

export const prApi = purchaseApi;
export const poApi = purchaseApi;

export type PurchaseApi = typeof purchaseApi;

export type PurchaseApiResponse<T> = ApiResponse<T>;
