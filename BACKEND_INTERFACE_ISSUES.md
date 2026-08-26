# 后端接口问题清单

核对基准：当前 `dev` 后端 Swagger。

## 缺失接口

1. 供应商结算
   - `GET /settlements`
   - `GET /settlements/{settlementId}`
2. 供应商维护
   - `POST /suppliers`
   - `PUT /suppliers/{supplierId}`
   - `DELETE /suppliers/{supplierId}` 或启用/禁用接口
3. 销售退货
   - `GET /return-orders`
   - `GET /return-orders/{returnId}`
   - `POST /return-orders`
   - `POST /return-orders/{returnId}/confirm`
   - `POST /return-orders/{returnId}/reject`
4. 采购退货
   - `GET /purchase-returns`
   - `GET /purchase-returns/{returnId}`
   - `POST /purchase-returns`
   - `POST /purchase-returns/{returnId}/confirm`
5. 每日营业结转
   - `GET /daily-settlements`
   - `GET /daily-settlements/{date}`
   - `POST /daily-settlements/{date}/close`（如允许人工补结）

## 接口契约或行为问题

1. `/suppliers` 直接返回数据库实体，字段格式与前端 `supplierId`、`supplierName` 等约定不一致，应改用 Supplier DTO。
2. `GET /purchase-orders` 缺少 `supplierName`。
3. `POST /purchase-orders/{orderId}/reject` 当前仍将状态写成“待审批”，应改为“已驳回”。
4. `GET /inventory` 缺少前端仓库筛选所需的 `warehouseId` 参数。
5. 新会员应由后端强制设置为普通会员；销售后应根据累计消费自动升级，升级门槛待确认。
6. 若 POS 最终采用会员卡余额支付，需增加会员余额、余额校验、扣款/退款事务及余额流水；该方案待组内确认。
