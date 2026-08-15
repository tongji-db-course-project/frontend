<template>
  <div class="biz-page checkout-page">
    <PageHeader eyebrow="销售管理 · 门店收银" title="POS 收银" description="扫描条码或搜索商品，将商品加入购物车后完成结算" />
    <div class="checkout-grid">
      <section class="biz-card product-panel">
        <div class="checkout-search">
          <el-input v-model="productKeyword" size="large" placeholder="扫描条码或输入商品名称" :prefix-icon="Search" clearable @keyup.enter="searchProducts" />
          <el-button size="large" type="primary" :loading="productLoading" @click="searchProducts">搜索</el-button>
        </div>
        <el-table v-loading="productLoading" :data="products" row-key="productId" class="biz-table">
          <el-table-column label="商品" min-width="200">
            <template #default="{ row }"><div class="biz-product"><span class="biz-product__avatar">{{ row.productName.slice(0, 1) }}</span><div><b>{{ row.productName }}</b><small>{{ row.barcode || '-' }} · {{ row.specification || '暂无规格' }}</small></div></div></template>
          </el-table-column>
          <el-table-column label="售价" width="105" align="right">
            <template #default="{ row }"><strong>{{ formatMoney(effectivePrice(row)) }}</strong></template>
          </el-table-column>
          <el-table-column label="操作" width="95" align="center"><template #default="{ row }"><el-button type="primary" link @click="addToCart(row)">加入</el-button></template></el-table-column>
        </el-table>
        <el-empty v-if="!productLoading && !products.length" description="输入商品名称或条码开始查询" :image-size="80" />
      </section>

      <section class="biz-card cart-panel">
        <header><div><h3><ShoppingCart />购物车</h3><small>{{ cart.length }} 种商品 / {{ cartQuantity }} 件</small></div><el-button link type="danger" :disabled="!cart.length" @click="clearCart">清空</el-button></header>
        <div class="cart-list">
          <article v-for="item in cart" :key="item.product.productId"><div><b>{{ item.product.productName }}</b><small>{{ formatMoney(effectivePrice(item.product)) }} / {{ item.product.unit || '件' }}</small></div><el-input-number v-model="item.quantity" :min="1" :max="999" size="small" /><strong>{{ formatMoney(effectivePrice(item.product) * item.quantity) }}</strong><el-button circle text type="danger" :icon="Delete" @click="removeFromCart(item.product.productId)" /></article>
          <el-empty v-if="!cart.length" description="购物车为空" :image-size="80" />
        </div>
        <div class="member-box">
          <el-input v-model="memberPhone" placeholder="输入会员手机号" clearable><template #append><el-button :icon="Search" :loading="memberLoading" @click="findMember" /></template></el-input>
          <p v-if="member"><el-tag type="success">普通会员</el-tag><b>{{ member.memberName }}</b><span>{{ member.phone }} · {{ member.points ?? 0 }} 积分</span><el-button link type="danger" @click="removeMember">移除</el-button></p>
        </div>
        <div class="checkout-options">
          <label>支付方式</label><el-radio-group v-model="payType"><el-radio-button value="现金">现金</el-radio-button><el-radio-button value="微信">微信</el-radio-button><el-radio-button value="支付宝">支付宝</el-radio-button></el-radio-group>
          <label>出库仓库</label><el-input-number v-model="warehouseId" :min="1" :precision="0" controls-position="right" />
          <label>兑换积分</label><el-input-number v-model="redeemPoints" :min="0" :max="member?.points ?? 0" :precision="0" :disabled="!member" />
        </div>
        <el-alert title="商品价格、库存扣减、积分兑换和最终实付金额由后端结算。" type="info" :closable="false" show-icon />
        <dl class="checkout-total"><div><dt>商品金额</dt><dd>{{ formatMoney(totalAmount) }}</dd></div><div class="grand"><dt>预计金额</dt><dd>{{ formatMoney(totalAmount) }}</dd></div></dl>
        <el-button size="large" type="primary" :loading="submitting" :disabled="!cart.length" @click="checkout">确认收款</el-button>
      </section>
    </div>
    <el-result v-if="lastSale" icon="success" title="收款成功" :sub-title="`销售单号：${lastSale.saleNo}`"><template #extra><el-button @click="lastSale = null">继续收银</el-button><el-button type="primary" @click="router.push(`/sales/${lastSale.saleId}`)">查看销售单</el-button></template></el-result>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Delete, Search, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import { productApi } from '../../api/product'
import { memberApi } from '../../api/member'
import { saleApi } from '../../api/sale'
import type { ProductListItem } from '../../types/product'
import type { Member } from '../../types/member'
import type { PayType, SaleOrder } from '../../types/sale'
import { formatMoney } from '../../utils/format'

type CheckoutProduct = ProductListItem
interface CartItem { product: CheckoutProduct; quantity: number }

const router = useRouter()
const productKeyword = ref('')
const products = ref<CheckoutProduct[]>([])
const productLoading = ref(false)
const cart = ref<CartItem[]>([])
const memberPhone = ref('')
const member = ref<Member | null>(null)
const memberLoading = ref(false)
const payType = ref<PayType>('微信')
const warehouseId = ref(1)
const redeemPoints = ref(0)
const submitting = ref(false)
const lastSale = ref<SaleOrder | null>(null)

const effectivePrice = (product: CheckoutProduct) => Number(product.salePrice || 0)
const cartQuantity = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0))

async function searchProducts() {
  const keyword = productKeyword.value.trim()
  if (!keyword) return
  productLoading.value = true
  try {
    const result = await productApi.getList({ page: 1, size: 20, keyword, status: '在售' })
    products.value = result?.list ?? []
  } catch { products.value = [] } finally { productLoading.value = false }
}

function addToCart(product: CheckoutProduct) {
  const current = cart.value.find(item => item.product.productId === product.productId)
  if (current) current.quantity += 1
  else cart.value.push({ product, quantity: 1 })
  ElMessage.success(`${product.productName} 已加入购物车`)
}

function removeFromCart(productId: number) { cart.value = cart.value.filter(item => item.product.productId !== productId) }
async function clearCart() { await ElMessageBox.confirm('确认清空购物车吗？', '清空购物车', { type: 'warning' }); cart.value = [] }
function removeMember() { member.value = null; redeemPoints.value = 0 }

async function findMember() {
  if (!memberPhone.value.trim()) return
  memberLoading.value = true
  try { member.value = await memberApi.getByPhone(memberPhone.value.trim()); redeemPoints.value = 0 }
  catch { removeMember() }
  finally { memberLoading.value = false }
}

async function checkout() {
  if (!cart.value.length) return
  submitting.value = true
  try {
    lastSale.value = await saleApi.create({
      memberId: member.value?.memberId,
      warehouseId: warehouseId.value,
      payType: payType.value,
      redeemPoints: redeemPoints.value,
      items: cart.value.map(item => ({ productId: item.product.productId, quantity: item.quantity })),
    })
    cart.value = []; member.value = null; memberPhone.value = ''; redeemPoints.value = 0
    ElMessage.success('收款成功')
  } finally { submitting.value = false }
}
</script>

<style scoped>
.checkout-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(380px,.65fr);gap:14px}.checkout-search{display:flex;gap:9px;margin-bottom:12px}.original-price{display:block;color:#a0a8b5;text-decoration:line-through}.cart-panel>header{display:flex;justify-content:space-between;align-items:center}.cart-panel h3{margin:0;display:flex;align-items:center;gap:7px}.cart-panel h3 svg{width:17px}.cart-panel header small{color:#98a4b6}.cart-list{min-height:220px;max-height:340px;overflow:auto;margin:12px 0;border-block:1px solid #edf1f5}.cart-list article{padding:11px 0;display:grid;grid-template-columns:minmax(110px,1fr) 105px 90px 32px;align-items:center;gap:8px;border-bottom:1px solid #edf1f5}.cart-list article>div{display:grid}.cart-list small{color:#98a4b6;font-size:10px}.member-box{padding:12px;border-radius:7px;background:#f7f9fc}.member-box p{margin:9px 0 0;display:flex;align-items:center;gap:8px}.member-box p span{color:#7d899a;font-size:11px}.member-box p .el-button{margin-left:auto}.checkout-options{padding:14px 0;display:grid;grid-template-columns:90px 1fr;align-items:center;gap:10px}.checkout-total{margin:14px 0}.checkout-total div{display:flex;justify-content:space-between;padding:6px 0}.checkout-total dt{color:#7d899a}.checkout-total dd{margin:0}.checkout-total .grand{padding-top:11px;border-top:1px dashed #dfe5ed;font-size:18px;font-weight:700}.cart-panel>.el-button{width:100%}@media(max-width:1150px){.checkout-grid{grid-template-columns:1fr}.cart-panel{min-width:0}}@media(max-width:600px){.cart-list article{grid-template-columns:1fr 100px}.cart-list article>strong{grid-column:1}.checkout-options{grid-template-columns:1fr}}
</style>
