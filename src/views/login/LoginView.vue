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
                <el-icon ><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon ><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="extra-row">
            <el-checkbox>记住我</el-checkbox>
            <span class="forgot-link">忘记密码</span>
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

const loginForm = reactive<LoginParams>({
  username: '',
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

  try{
    await formRef.value.validate()
  }catch{
    return
  }

  loading.value = true
  try {
    // 调用 Store 里的登录 Action
    await authStore.login(loginForm)
    ElMessage.success('登录成功，正在跳转...')
    // 登录成功跳转到首页 (Dashboard)
    router.push('/dashboard')
  } catch (err: any) {
    if (!err?._handled) {
      const msg = err?.message || err?.response?.data?.message || '登录失败'
      ElMessage.error(msg)
    }
    console.error('登录失败详情:', err)
  } finally {
    loading.value = false
  }
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
    radial-gradient(circle at top left,rgba(64,158,255,0.28),transparent 30%),
    radial-gradient(circle at bottom right,rgba(32,201,151,0.18),transparent 30%),
    linear-gradient(135deg,#0f172a 0%,#1e293b);
}

.login-panel{
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap:32px;
  align-items: center;
}

.login-banner{
  color:#fff;
  padding: 24px;
}

.brand-mark{
  width:64px;
  height:64px;
  border-radius:18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:linear-gradient(135deg,#409eff 0%,#36cfc9 100%);
  box-shadow: 0 12px 30px rgba(64,158,255,0.28);
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
  color:rgba(255,255,255,0.78);
  max-width: 420px;
}

.login-card {
  border-radius: 24px;
  padding:18px;
  border:none;
  background:rgba(255,255,255,0.96);
  box-shadow: 0 24px 60px rgba(15,23,42,0.22);
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

.extra-row{
  display:flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 18px;
  font-size: 14px;
  color:#606266;
}

.forgot-link{
  color:#409eff;
  cursor:pointer;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-input__wrapper){
  min-height:46px;
  border-radius: 12px;
  box-shadow:0 0 0 1px #dcdfe6 inset !important;
  padding: 0 15px; 
  display:flex ;
  align-items:center;
}

:deep(.el-form-item){
  margin-bottom:20px;
}

:deep(.el-input__prefix){
  display: flex ;
  align-items: center ;
  margin-right: 8px ;
}

@media(max-width:900px){
  .login-panel{
    grid-template-columns: 1fr;
  }

  .login-banner{
    display: none;
  }

  .login-card{
    max-width: 460px;
    margin:0 auto;
  }
}
</style>