<template>
  <div class="login-wrapper">
    <div class="login-panel">
      <div class="login-banner">
        <div class="brand-mark">
          <el-icon :size="36" color="#ffffff">
            <Shop />
          </el-icon>
        </div>
        <h1>商品零食管理系统</h1>
        <p>统一管理商品、采购、销售、库存与统计数据</p>
        <ul class="feature-list">
          <li><span>✓</span>商品、库存与供应商统一管理</li>
          <li><span>✓</span>采购、销售与退货全流程追踪</li>
          <li><span>✓</span>经营数据实时汇总分析</li>
        </ul>
      </div>

      <el-card class="login-card" shadow="never">
        <div class="title">
          <h2>欢迎登录</h2>
          <span>请输入账号和密码进入系统</span>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keydown="detectCapsLock"
              @keyup="detectCapsLock"
              @blur="capsLockOn = false"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <p v-if="capsLockOn" class="form-notice warning" role="status">Caps Lock 已开启，请注意密码大小写</p>
          <p v-if="submitError" class="form-notice error" role="alert">{{ submitError }}</p>

          <div class="extra-row">
            <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
            <button type="button" class="forgot-link" @click="handleForgotPassword">忘记密码</button>
          </div>

          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...': '立即登录'}}
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance,FormRules } from 'element-plus'
import {Shop,User,Lock} from '@element-plus/icons-vue'
// 导入Store
import { useAuthStore } from '../../stores/auth'
// 导入类型约束
import type { LoginParams } from '../../types/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const formRef=ref<FormInstance>()
const rememberedUsername = localStorage.getItem('rememberedUsername') || ''
const rememberMe = ref(Boolean(rememberedUsername))
const capsLockOn = ref(false)
const submitError = ref('')

const loginForm = reactive<LoginParams>({
  username: rememberedUsername,
  password: ''
})

const rules:FormRules={
  username:[
    {required:true,message:'请输入账号',trigger:'blur'}
  ],
  password:[
    {required:true,message:'请输入密码',trigger:'blur'},
    {min:6,message:'密码长度不能够少于6位',trigger:'blur'}
  ]
}

const handleLogin = async () => {
  if(!formRef.value) return
  submitError.value = ''

  try{
    await formRef.value.validate()
  }catch{
    return
  }

  loading.value = true
  try {
    // 调用 Store 里的登录 Action
    await authStore.login(loginForm)
    if (rememberMe.value) localStorage.setItem('rememberedUsername', loginForm.username)
    else localStorage.removeItem('rememberedUsername')
    ElMessage.success('登录成功，正在跳转...')
    // 登录成功跳转到首页 (Dashboard)
    router.push('/dashboard')
  } catch (err: any) {
    if (!err?._handled) {
      const msg = err?.message || err?.response?.data?.message || '登录失败'
      submitError.value = msg
      ElMessage.error(msg)
    } else {
      submitError.value = err?.message || '账号或密码不正确，请重新输入'
    }
    console.error('登录失败详情:', err)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码')
}

const detectCapsLock = (event: KeyboardEvent) => {
  capsLockOn.value = event.getModifierState?.('CapsLock') ?? false
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display:flex;
  align-items:center;
  justify-content: center;
  padding: 32px;
  background:
    radial-gradient(circle at 12% 12%, rgba(22,119,255,0.18), transparent 34%),
    radial-gradient(circle at 88% 84%, rgba(51,195,217,0.14), transparent 30%),
    linear-gradient(135deg,#edf5ff 0%,#f8fbff 52%,#eef7fc 100%);

  background-size: 200% 200%;
  animation: gradientMove 10s ease infinite;
  position: relative;
  overflow: hidden;
}

.login-wrapper::before,
.login-wrapper::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(22,119,255,0.1);
  pointer-events: none;
}

.login-wrapper::before {
  width: 420px;
  height: 420px;
  left: -150px;
  top: -160px;
  box-shadow:
    0 0 0 55px rgba(22,119,255,0.025),
    0 0 0 110px rgba(22,119,255,0.018);
}

.login-wrapper::after {
  width: 300px;
  height: 300px;
  right: -110px;
  bottom: -120px;
  box-shadow: 0 0 0 65px rgba(51,195,217,0.025);
}

/* 定义动画关键帧 */
@keyframes gradientMove{
  0%{background-position: 0% 50%;}
  50%{background-position: 100% 50%;}
  100%{background-position: 0% 50%;}
}

.login-panel{
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap:32px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.login-banner{
  color:#173b73;
  padding: 24px;
}

.brand-mark{
  width:64px;
  height:64px;
  border-radius:18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:linear-gradient(135deg,#1677ff 0%,#55a3ff 100%);
  box-shadow: 0 12px 30px rgba(22,119,255,0.22);
  margin-bottom:20px;
}

.login-banner h1{
  font-size: 40px;
  line-height: 1.2;
  margin-bottom: 16px;
  font-weight: 700;
}

.login-banner p{
  font-size: 16px;
  line-height: 1.8;
  color:#647895;
  max-width: 420px;
}

.feature-list {
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  gap: 13px;
  color: #536b8c;
  font-size: 14px;
  list-style: none;
}

.feature-list li { display: flex; align-items: center; gap: 9px; }
.feature-list span { width: 22px; height: 22px; display: grid; place-items: center; color: #1677ff; border-radius: 50%; background: rgba(22,119,255,.1); font-size: 12px; font-weight: 700; }

.login-card {
  border-radius: 24px;
  padding:18px;
  border:1px solid rgba(209,222,239,0.9);
  background:rgba(255,255,255,0.94);
  box-shadow: 0 24px 60px rgba(39,91,160,0.14);
  backdrop-filter: blur(16px);
}

.title {
  text-align: center;
  margin-bottom: 28px;
}

.title h2 {
  margin-top: 8px;
  color: #111827;
  font-size: 28px;
}

.title span{
  font-size: 14px;
  color: #6b7280;
}

.login-form{
  margin-top:8px;
}

.form-notice {
  margin: -9px 0 12px;
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 12px;
  line-height: 1.45;
}

.form-notice.warning { color: #9a6108; background: #fff7e6; }
.form-notice.error { color: #b4232a; background: #fff1f1; }

.extra-row{
  display:flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 18px;
  font-size: 14px;
  color:#606266;
}

.forgot-link{
  padding: 4px 0;
  color:#409eff;
  border: 0;
  background: transparent;
  cursor:pointer;
}

.forgot-link:hover { color: #1677ff; text-decoration: underline; }

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border-color: #1677ff;
  background: linear-gradient(135deg,#1677ff,#438ff2);
  box-shadow: 0 10px 22px rgba(22,119,255,0.2);
}

:deep(.el-input__wrapper){
  min-height:46px;
  border-radius: 12px;
  box-shadow:0 0 0 1px #dce5f0 inset !important;
  padding: 0 15px;
  display:flex ;
  align-items:center;
  background:#fbfdff;
}

:deep(.el-input__wrapper:hover){
  box-shadow:0 0 0 1px #aacbf4 inset !important;
}

:deep(.el-input__wrapper.is-focus){
  box-shadow:0 0 0 1px #1677ff inset, 0 0 0 3px rgba(22,119,255,0.08) !important;
}

:deep(.el-form-item){
  margin-bottom:20px;
}

:deep(.el-input__prefix){
  display: flex ;
  align-items: center ;
  justify-content: center;
  width: 24px;    /* 显示设置宽度 */
  margin-right: 8px ;
}

:deep(.el-input__prefix .el-icon){
  font-size:16px;    /* 强制指定图标大小 */
}

@media(max-width:900px){
  .login-panel{
    grid-template-columns: 1fr;
  }

  .login-banner{
    display: none;
  }

  .login-card{
    width: 100%;
    max-width: 460px;
    margin:0 auto;
  }
}

@media(max-width:520px){
  .login-wrapper { min-height: 100dvh; padding: 20px 14px; overflow-y: auto; }
  .login-panel { gap: 0; }
  .login-card { padding: 10px; border-radius: 18px; }
  .title { margin-bottom: 22px; }
  .title h2 { font-size: 24px; }
  .submit-btn { height: 46px; }
}

@media(prefers-reduced-motion: reduce){
  .login-wrapper { animation: none; }
  .submit-btn, .forgot-link { transition: none; }
}
</style>
