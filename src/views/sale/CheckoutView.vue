<template>
  <div class="biz-page checkout-page">
    <PageHeader eyebrow="销售管理 · 门店收银" title="POS 收银" description="扫描条码或搜索商品，将商品加入购物车后完成结算" />
    <div class="checkout-grid">
      <section class="biz-card product-panel">
        <div class="checkout-search">
          <el-autocomplete v-model="productKeyword" size="large" placeholder="扫描条码或输入商品名称" :prefix-icon="Search" clearable :fetch-suggestions="queryProductSuggestions" :trigger-on-focus="false" @keyup.enter="searchProducts" @select="selectProductSuggestion">
            <template #default="{ item }"><div class="product-suggestion"><div><b>{{ item.productName }}</b><small>{{ item.barcode || '无条码' }} · {{ item.specification || '暂无规格' }}</small></div><strong>{{ formatMoney(effectivePrice(item)) }}</strong></div></template>
          </el-autocomplete>
          <el-button size="large" type="primary" :loading="productLoading" @click="searchProducts">搜索</el-button>
          <el-button size="large" :icon="VideoCamera" @click="openScanner">摄像头扫码</el-button>
          <el-button size="large" :loading="imageDecoding" @click="barcodeFileInput?.click()">上传条码图片</el-button>
          <input ref="barcodeFileInput" class="hidden-file-input" type="file" accept="image/*" @change="decodeBarcodeImage" />
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
          <p v-if="member"><el-tag type="success">{{ member.levelName || '普通会员' }}</el-tag><b>{{ member.memberName }}</b><span>{{ member.phone }} · {{ member.points ?? 0 }} 积分</span><el-button link type="danger" @click="removeMember">移除</el-button></p>
        </div>
        <div class="checkout-options">
          <label>出库仓库</label><el-select v-model="warehouseId" placeholder="请选择仓库" :loading="warehouseLoading"><el-option v-for="item in warehouses" :key="item.warehouseId" :label="item.warehouseName" :value="item.warehouseId" /></el-select>
          <label>兑换积分</label><el-input-number v-model="redeemPoints" :min="0" :max="member?.points ?? 0" :precision="0" :disabled="!member" />
        </div>
        <el-alert title="支付方式：会员卡扣款。商品价格、优惠、积分和最终实付金额由后端统一结算。" type="info" :closable="false" show-icon />
        <dl class="checkout-total"><div><dt>商品金额</dt><dd>{{ formatMoney(totalAmount) }}</dd></div><div class="grand"><dt>预计金额</dt><dd>{{ formatMoney(totalAmount) }}</dd></div></dl>
        <el-button size="large" type="primary" :loading="submitting" :disabled="!cart.length" @click="checkout">确认收款</el-button>
      </section>
    </div>
    <el-dialog v-model="scannerVisible" title="摄像头扫描商品条码" width="620px" destroy-on-close @closed="stopScanner">
      <div class="scanner-panel">
        <video ref="scannerVideo" autoplay muted playsinline />
        <div class="scanner-frame"><span /></div>
        <p v-if="scannerLoading">正在启动摄像头…</p>
        <p v-else>{{ scannerHint }}</p>
      </div>
      <el-alert title="摄像头画面仅在当前浏览器中用于识别，不会上传到服务器。部署环境需要使用 HTTPS。" type="info" :closable="false" show-icon />
      <template #footer><el-button :loading="frameDecoding" type="primary" @click="decodeCurrentFrame">识别当前画面</el-button><el-button :loading="imageDecoding" @click="barcodeFileInput?.click()">上传条码图片测试</el-button><el-button @click="scannerVisible=false">关闭摄像头</el-button></template>
    </el-dialog>
    <el-result v-if="lastSale" icon="success" title="收款成功" :sub-title="`销售单号：${lastSale.saleNo}`"><template #extra><el-button @click="lastSale = null">继续收银</el-button><el-button type="primary" @click="router.push(`/sales/${lastSale.saleId}`)">查看销售单</el-button></template></el-result>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Delete, Search, ShoppingCart, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { IScannerControls } from '@zxing/browser'
import { useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import { productApi } from '../../api/product'
import { memberApi } from '../../api/member'
import { saleApi } from '../../api/sale'
import { inventoryApi } from '../../api/inventory'
import type { ProductListItem } from '../../types/product'
import type { Member } from '../../types/member'
import type { SaleOrder } from '../../types/sale'
import type { Warehouse } from '../../types/inventory'
import { formatMoney } from '../../utils/format'

type CheckoutProduct = ProductListItem
interface CartItem { product: CheckoutProduct; quantity: number }
type ProductSuggestion = CheckoutProduct & { value: string }
interface CheckoutDraft {
  cart: CartItem[]
  memberPhone: string
  member: Member | null
  warehouseId: number | null
  redeemPoints: number
}

const CHECKOUT_DRAFT_KEY = 'retail-pos-checkout-draft'

const router = useRouter()
const productKeyword = ref('')
const products = ref<CheckoutProduct[]>([])
const productLoading = ref(false)
const cart = ref<CartItem[]>([])
const memberPhone = ref('')
const member = ref<Member | null>(null)
const memberLoading = ref(false)
const warehouseId = ref<number | null>(null)
const warehouses = ref<Warehouse[]>([])
const warehouseLoading = ref(false)
const redeemPoints = ref(0)
const submitting = ref(false)
const lastSale = ref<SaleOrder | null>(null)
const scannerVisible = ref(false)
const scannerLoading = ref(false)
const scannerHint = ref('将商品条形码放入取景框，识别成功后会自动加入购物车')
const scannerVideo = ref<HTMLVideoElement | null>(null)
const barcodeFileInput = ref<HTMLInputElement | null>(null)
const imageDecoding = ref(false)
const frameDecoding = ref(false)
let scannerControls: IScannerControls | null = null
let scanHandled = false
let scanHintTimer: number | null = null
let nativeScanTimer: number | null = null
let visionScanTimer: number | null = null
let scanCandidate = ''
let scanCandidateCount = 0
let scanCandidateTime = 0
let validatingBarcode = false

interface NativeBarcodeDetector {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>
}
interface NativeBarcodeDetectorConstructor {
  new(options?: { formats?: string[] }): NativeBarcodeDetector
}

function restoreCheckoutDraft() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw) as Partial<CheckoutDraft>
    if (Array.isArray(draft.cart)) {
      cart.value = draft.cart.filter(item => item?.product?.productId && Number(item.quantity) > 0)
    }
    memberPhone.value = typeof draft.memberPhone === 'string' ? draft.memberPhone : ''
    member.value = draft.member?.memberId ? draft.member : null
    warehouseId.value = typeof draft.warehouseId === 'number' ? draft.warehouseId : null
    redeemPoints.value = Math.max(0, Number(draft.redeemPoints) || 0)
  } catch {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY)
  }
}

function saveCheckoutDraft() {
  const draft: CheckoutDraft = {
    cart: cart.value,
    memberPhone: memberPhone.value,
    member: member.value,
    warehouseId: warehouseId.value,
    redeemPoints: redeemPoints.value,
  }
  try { sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft)) }
  catch { /* 浏览器禁用存储时保持原有内存行为 */ }
}

restoreCheckoutDraft()
watch([cart, memberPhone, member, warehouseId, redeemPoints], saveCheckoutDraft, { deep: true })

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

async function queryProductSuggestions(keyword: string, callback: (items: ProductSuggestion[]) => void) {
  const query = keyword.trim()
  if (!query) { callback([]); return }
  try {
    const result = await productApi.getList({ page: 1, size: 10, keyword: query, status: '在售' })
    callback((result?.list ?? []).map(item => ({ ...item, value: item.productName })))
  } catch { callback([]) }
}

function selectProductSuggestion(product: ProductSuggestion) {
  products.value = [product]
  productKeyword.value = product.productName
  addToCart(product)
}

async function addBarcodeProduct(barcode: string, showNotFound = true) {
  productKeyword.value = barcode
  productLoading.value = true
  try {
    const result = await productApi.getList({ page: 1, size: 20, keyword: barcode, status: '在售' })
    products.value = result?.list ?? []
    const product = products.value.find(item => item.barcode?.trim() === barcode)
    if (!product) {
      if (showNotFound) ElMessage.warning(`未找到条码为 ${barcode} 的在售商品`)
      return false
    }
    addToCart(product)
    return true
  } catch { products.value = []; return false }
  finally { productLoading.value = false }
}

async function createBarcodeReader() {
  const { BarcodeFormat, BrowserMultiFormatReader } = await import('@zxing/browser')
  const formats = [BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]
  const reader = new BrowserMultiFormatReader(undefined, { delayBetweenScanAttempts: 80, delayBetweenScanSuccess: 300 })
  // DecodeHintType.TRY_HARDER = 3；避免额外打包一份 @zxing/library。
  reader.hints.set(3, true)
  reader.possibleFormats = formats
  return reader
}

async function handleScannedBarcode(barcode: string) {
  if (!barcode || scanHandled || validatingBarcode) return
  const now = Date.now()
  if (barcode !== scanCandidate || now - scanCandidateTime > 1800) {
    scanCandidate = barcode
    scanCandidateCount = 1
  } else {
    scanCandidateCount += 1
  }
  scanCandidateTime = now
  if (scanCandidateCount < 2) {
    scannerHint.value = `检测到 ${barcode}，正在复核…`
    return
  }

  validatingBarcode = true
  scannerHint.value = `正在核验商品条码 ${barcode}…`
  const found = await addBarcodeProduct(barcode, false)
  validatingBarcode = false
  if (!found) {
    scanCandidate = ''
    scanCandidateCount = 0
    scannerHint.value = '刚才的结果疑似误读，已继续扫描，请保持条码稳定'
    return
  }
  scanHandled = true
  stopScanner()
  scannerVisible.value = false
  ElMessage.success(`条码核验成功：${barcode}`)
}

function startNativeBarcodeScanner() {
  const Detector = (globalThis as typeof globalThis & { BarcodeDetector?: NativeBarcodeDetectorConstructor }).BarcodeDetector
  const video = scannerVideo.value
  if (!Detector || !video) return
  const detector = new Detector({ formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e'] })
  let detecting = false
  nativeScanTimer = window.setInterval(async () => {
    if (detecting || scanHandled || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
    detecting = true
    try {
      const result = await detector.detect(video)
      const barcode = result[0]?.rawValue?.trim()
      if (barcode) void handleScannedBarcode(barcode)
    } catch { /* 原生识别不可用时继续由 ZXing 扫描 */ }
    finally { detecting = false }
  }, 160)
}

async function decodeBarcodeImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) { ElMessage.warning('请选择条码图片文件'); return }
  imageDecoding.value = true
  const imageUrl = URL.createObjectURL(file)
  try {
    const reader = await createBarcodeReader()
    const result = await reader.decodeFromImageUrl(imageUrl)
    const barcode = result.getText().trim()
    if (!barcode) throw new Error('empty barcode')
    stopScanner()
    scannerVisible.value = false
    ElMessage.success(`识别到条码：${barcode}`)
    await addBarcodeProduct(barcode)
  } catch {
    ElMessage.error('图片中未识别到有效的一维商品条码，请确认图片完整、清晰且左右有留白')
  } finally {
    URL.revokeObjectURL(imageUrl)
    imageDecoding.value = false
  }
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('capture failed')), 'image/png')
  })
}

async function decodeCanvas(canvas: HTMLCanvasElement, reader?: Awaited<ReturnType<typeof createBarcodeReader>>) {
  const imageUrl = URL.createObjectURL(await canvasToBlob(canvas))
  try {
    const decoder = reader ?? await createBarcodeReader()
    return (await decoder.decodeFromImageUrl(imageUrl)).getText().trim()
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function enhanceBarcodeCanvas(source: HTMLCanvasElement, scale = 2) {
  const canvas = document.createElement('canvas')
  canvas.width = source.width * scale
  canvas.height = source.height * scale
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('canvas unavailable')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  let min = 255
  let max = 0
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = Math.round(image.data[index]! * .299 + image.data[index + 1]! * .587 + image.data[index + 2]! * .114)
    min = Math.min(min, gray)
    max = Math.max(max, gray)
  }
  const range = Math.max(32, max - min)
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = Math.round(image.data[index]! * .299 + image.data[index + 1]! * .587 + image.data[index + 2]! * .114)
    const contrasted = Math.max(0, Math.min(255, Math.round((gray - min) * 255 / range)))
    image.data[index] = contrasted
    image.data[index + 1] = contrasted
    image.data[index + 2] = contrasted
  }
  context.putImageData(image, 0, 0)
  return canvas
}

function addWhiteQuietZone(source: HTMLCanvasElement, ratio = .14) {
  const paddingX = Math.max(18, Math.round(source.width * ratio))
  const paddingY = Math.max(10, Math.round(source.height * ratio * .5))
  const canvas = document.createElement('canvas')
  canvas.width = source.width + paddingX * 2
  canvas.height = source.height + paddingY * 2
  const context = canvas.getContext('2d')
  if (!context) return source
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(source, paddingX, paddingY)
  return canvas
}

function thresholdBarcodeCanvas(source: HTMLCanvasElement) {
  const canvas = enhanceBarcodeCanvas(source, 3)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return canvas
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  let luminanceTotal = 0
  for (let index = 0; index < image.data.length; index += 4) luminanceTotal += image.data[index]!
  const threshold = luminanceTotal / (image.data.length / 4)
  for (let index = 0; index < image.data.length; index += 4) {
    const value = image.data[index]! > threshold ? 255 : 0
    image.data[index] = value
    image.data[index + 1] = value
    image.data[index + 2] = value
  }
  context.putImageData(image, 0, 0)
  return canvas
}

function cropCanvas(source: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  canvas.getContext('2d')?.drawImage(source, x, y, width, height, 0, 0, canvas.width, canvas.height)
  return canvas
}

function captureVideoCanvas(video: HTMLVideoElement) {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0)
  return canvas
}

function dominantRange(scores: number[], smoothingRadius: number) {
  const smoothed = scores.map((_, index) => {
    let total = 0
    let count = 0
    for (let offset = -smoothingRadius; offset <= smoothingRadius; offset += 1) {
      const value = scores[index + offset]
      if (value !== undefined) { total += value; count += 1 }
    }
    return count ? total / count : 0
  })
  const peak = Math.max(...smoothed)
  if (!Number.isFinite(peak) || peak <= 0) return null
  const threshold = peak * .34
  const peakIndex = smoothed.indexOf(peak)
  const allowedGap = Math.max(2, smoothingRadius * 2)
  let start = peakIndex
  let end = peakIndex
  let gap = 0
  for (let index = peakIndex - 1; index >= 0; index -= 1) {
    if (smoothed[index]! >= threshold) gap = 0
    else if (++gap > allowedGap) break
    start = index
  }
  gap = 0
  for (let index = peakIndex + 1; index < smoothed.length; index += 1) {
    if (smoothed[index]! >= threshold) gap = 0
    else if (++gap > allowedGap) break
    end = index
  }
  return { start, end }
}

function detectBarcodeRegion(source: HTMLCanvasElement) {
  const analysis = document.createElement('canvas')
  const analysisScale = Math.min(1, 640 / source.width)
  analysis.width = Math.round(source.width * analysisScale)
  analysis.height = Math.round(source.height * analysisScale)
  const context = analysis.getContext('2d', { willReadFrequently: true })
  if (!context || analysis.width < 40 || analysis.height < 30) return null
  context.drawImage(source, 0, 0, analysis.width, analysis.height)
  const image = context.getImageData(0, 0, analysis.width, analysis.height)
  const rowScores = new Array<number>(analysis.height).fill(0)
  const columnScores = new Array<number>(analysis.width).fill(0)
  for (let y = 1; y < analysis.height - 1; y += 1) {
    for (let x = 1; x < analysis.width - 1; x += 1) {
      const left = (y * analysis.width + x - 1) * 4
      const right = left + 8
      const leftGray = image.data[left]! * .299 + image.data[left + 1]! * .587 + image.data[left + 2]! * .114
      const rightGray = image.data[right]! * .299 + image.data[right + 1]! * .587 + image.data[right + 2]! * .114
      const edge = Math.abs(rightGray - leftGray)
      rowScores[y]! += edge
      columnScores[x]! += edge
    }
  }
  const rows = dominantRange(rowScores, Math.max(2, Math.round(analysis.height / 60)))
  const columns = dominantRange(columnScores, Math.max(2, Math.round(analysis.width / 80)))
  if (!rows || !columns) return null
  const paddingX = Math.round(analysis.width * .05)
  const paddingY = Math.round(analysis.height * .06)
  const x = Math.max(0, columns.start - paddingX)
  const y = Math.max(0, rows.start - paddingY)
  const width = Math.min(analysis.width - x, columns.end - columns.start + 1 + paddingX * 2)
  const height = Math.min(analysis.height - y, rows.end - rows.start + 1 + paddingY * 2)
  if (width < analysis.width * .2 || height < analysis.height * .1) return null
  const sourceRatio = 1 / analysisScale
  return cropCanvas(source, x * sourceRatio, y * sourceRatio, width * sourceRatio, height * sourceRatio)
}

async function decodeVisualCandidate(source: HTMLCanvasElement) {
  const detected = detectBarcodeRegion(source)
  const scannerArea = cropCanvas(source, source.width * .05, source.height * .15, source.width * .9, source.height * .7)
  const candidates = detected ? [detected, scannerArea, source] : [scannerArea, source]
  const reader = await createBarcodeReader()
  let lastError: unknown = new Error('barcode not found')
  for (const candidate of candidates) {
    const variants = [
      addWhiteQuietZone(candidate),
      addWhiteQuietZone(enhanceBarcodeCanvas(candidate, 2)),
      addWhiteQuietZone(thresholdBarcodeCanvas(candidate)),
    ]
    for (const variant of variants) {
      try { return await decodeCanvas(variant, reader) }
      catch (error) { lastError = error }
    }
  }
  throw lastError
}

function startVisionBarcodeScanner() {
  const video = scannerVideo.value
  if (!video) return
  let detecting = false
  visionScanTimer = window.setInterval(async () => {
    if (detecting || scanHandled || validatingBarcode || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
    detecting = true
    try {
      const barcode = await decodeVisualCandidate(captureVideoCanvas(video))
      if (barcode) void handleScannedBarcode(barcode)
    } catch { /* 当前帧无有效候选时等待下一帧 */ }
    finally { detecting = false }
  }, 900)
}

async function decodeCurrentFrame() {
  const video = scannerVideo.value
  if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
    ElMessage.warning('摄像头画面尚未准备好，请稍后再试')
    return
  }
  frameDecoding.value = true
  scanHandled = true
  scannerHint.value = '正在截取扫描框并增强识别…'
  try {
    const barcode = await decodeVisualCandidate(captureVideoCanvas(video))
    if (!barcode) throw new Error('empty barcode')
    stopScanner()
    scannerVisible.value = false
    ElMessage.success(`识别到条码：${barcode}`)
    await addBarcodeProduct(barcode)
  } catch {
    scanHandled = false
    scannerHint.value = '当前画面仍未识别，请让条码正对镜头并保持稳定后重试'
    ElMessage.warning('当前画面未识别成功，请调整距离或光线后再次点击')
  } finally {
    frameDecoding.value = false
  }
}

function stopScanner() {
  if (scanHintTimer !== null) window.clearTimeout(scanHintTimer)
  if (nativeScanTimer !== null) window.clearInterval(nativeScanTimer)
  if (visionScanTimer !== null) window.clearInterval(visionScanTimer)
  scanHintTimer = null
  nativeScanTimer = null
  visionScanTimer = null
  scannerControls?.stop()
  scannerControls = null
  scannerLoading.value = false
  if (scannerVideo.value) scannerVideo.value.srcObject = null
}

async function openScanner() {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    ElMessage.warning('当前页面无法访问摄像头，请使用 HTTPS 地址或在 localhost 环境测试')
    return
  }
  scannerVisible.value = true
  scannerLoading.value = true
  scannerHint.value = '将商品条形码完整放入取景框'
  scanHandled = false
  scanCandidate = ''
  scanCandidateCount = 0
  scanCandidateTime = 0
  validatingBarcode = false
  await nextTick()
  try {
    const reader = await createBarcodeReader()
    scannerControls = await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      scannerVideo.value ?? undefined,
      (result) => {
        if (result) void handleScannedBarcode(result.getText().trim())
      },
    )
    scannerLoading.value = false
    startNativeBarcodeScanner()
    startVisionBarcodeScanner()
    scanHintTimer = window.setTimeout(() => {
      scannerHint.value = '暂未识别，请调整距离、避免反光，并确保条码左右留白完整'
    }, 8000)
  } catch (error) {
    scannerVisible.value = false
    stopScanner()
    const name = error instanceof DOMException ? error.name : ''
    ElMessage.error(name === 'NotAllowedError' ? '摄像头权限被拒绝，请在浏览器设置中允许访问' : '摄像头启动失败，请检查设备和浏览器权限')
  }
}

async function loadWarehouses() {
  warehouseLoading.value = true
  try {
    warehouses.value = (await inventoryApi.getWarehouses() ?? []).filter(item => item.status !== '禁用')
    if (!warehouses.value.some(item => item.warehouseId === warehouseId.value)) {
      warehouseId.value = warehouses.value.length === 1 ? warehouses.value[0]?.warehouseId ?? null : null
    }
  } catch { warehouses.value = [] }
  finally { warehouseLoading.value = false }
}

async function checkout() {
  if (!cart.value.length) return
  if (!member.value) { ElMessage.warning('会员卡支付需要先查询并选择会员'); return }
  if (!warehouseId.value) { ElMessage.warning('请选择出库仓库'); return }
  await ElMessageBox.confirm(`确认从 ${member.value.memberName} 的会员卡完成本次扣款吗？`, '确认收款', { type: 'warning', confirmButtonText: '确认扣款' })
  submitting.value = true
  try {
    lastSale.value = await saleApi.create({
      memberId: member.value?.memberId,
      warehouseId: warehouseId.value,
      payType: '会员卡',
      redeemPoints: redeemPoints.value,
      items: cart.value.map(item => ({ productId: item.product.productId, quantity: item.quantity })),
    })
    cart.value = []; member.value = null; memberPhone.value = ''; redeemPoints.value = 0
    ElMessage.success('收款成功')
  } finally { submitting.value = false }
}

onMounted(loadWarehouses)
onBeforeUnmount(stopScanner)
</script>

<style scoped>
.checkout-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(380px,.65fr);gap:14px}.checkout-search{display:flex;gap:9px;margin-bottom:12px}.checkout-search .el-autocomplete{flex:1;min-width:220px}.product-suggestion{width:100%;display:flex;align-items:center;justify-content:space-between;gap:18px}.product-suggestion>div{display:grid}.product-suggestion small{color:#98a4b6}.product-suggestion strong{color:#1769e0}.original-price{display:block;color:#a0a8b5;text-decoration:line-through}.cart-panel>header{display:flex;justify-content:space-between;align-items:center}.cart-panel h3{margin:0;display:flex;align-items:center;gap:7px}.cart-panel h3 svg{width:17px}.cart-panel header small{color:#98a4b6}.cart-list{min-height:220px;max-height:340px;overflow:auto;margin:12px 0;border-block:1px solid #edf1f5}.cart-list article{padding:11px 0;display:grid;grid-template-columns:minmax(110px,1fr) 105px 90px 32px;align-items:center;gap:8px;border-bottom:1px solid #edf1f5}.cart-list article>div{display:grid}.cart-list small{color:#98a4b6;font-size:10px}.member-box{padding:12px;border-radius:7px;background:#f7f9fc}.member-box p{margin:9px 0 0;display:flex;align-items:center;gap:8px}.member-box p span{color:#7d899a;font-size:11px}.member-box p .el-button{margin-left:auto}.checkout-options{padding:14px 0;display:grid;grid-template-columns:90px 1fr;align-items:center;gap:10px}.checkout-total{margin:14px 0}.checkout-total div{display:flex;justify-content:space-between;padding:6px 0}.checkout-total dt{color:#7d899a}.checkout-total dd{margin:0}.checkout-total .grand{padding-top:11px;border-top:1px dashed #dfe5ed;font-size:18px;font-weight:700}.cart-panel>.el-button{width:100%}.scanner-panel{position:relative;margin-bottom:12px;overflow:hidden;border-radius:10px;background:#101820;aspect-ratio:4/3}.scanner-panel video{width:100%;height:100%;display:block;object-fit:cover}.scanner-panel>p{position:absolute;right:0;bottom:12px;left:0;margin:0;color:#fff;text-align:center;text-shadow:0 1px 3px #000}.scanner-frame{position:absolute;inset:22% 10%;border:2px solid rgba(255,255,255,.9);border-radius:10px;box-shadow:0 0 0 999px rgba(0,0,0,.28)}.scanner-frame span{position:absolute;right:6%;left:6%;top:50%;height:2px;background:#45e6a5;box-shadow:0 0 8px #45e6a5}.hidden-file-input{display:none}@media(max-width:1150px){.checkout-grid{grid-template-columns:1fr}.cart-panel{min-width:0}}@media(max-width:600px){.checkout-search{flex-wrap:wrap}.checkout-search .el-autocomplete{width:100%;flex-basis:100%}.cart-list article{grid-template-columns:1fr 100px}.cart-list article>strong{grid-column:1}.checkout-options{grid-template-columns:1fr}}
</style>
