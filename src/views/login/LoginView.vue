<template>
  <div class="login-wrapper">
    <el-card class="login-card">
      <div class="title">
        <el-icon :size="30" color="#409EFF"><Shop /></el-icon>
        <h2>商品零售管理系统</h2>
      </div>

      <el-form :model="loginForm" size="large">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="账号 " 
            prefix-icon="User" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码 " 
            prefix-icon="Lock" 
            show-password 
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          :loading="loading" 
          class="submit-btn" 
          @click="handleLogin"
        >
          立即登录
        </el-button>
      </el-form>

      
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 导入Store
import { useAuthStore } from '../../stores/auth'
// 导入类型约束
import type { LoginParams } from '../../types/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
})

const handleLogin = async () => {
  // 简单校验
  if (!loginForm.username || !loginForm.password) {
    return ElMessage.warning('请输入完整的账号和密码')
  }

  loading.value = true
  try {
    // 调用 Store 里的登录 Action
    await authStore.login(loginForm)

    // 登录成功跳转到首页 (Dashboard)
    router.push('/dashboard')
    
    ElMessage.success('登录成功，正在跳转...')
    
    
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
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 深蓝渐变色 */
  background: linear-gradient(135deg, #2d3a4b 0%, #1c242f 100%);
}

.login-card {
  width: 400px;
  border-radius: 8px;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 40px;
}

.title h2 {
  margin-top: 10px;
  color: #333;
  font-size: 24px;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  height: 48px;
}

.tips {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 13px;
}
</style>