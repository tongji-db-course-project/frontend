<!-- 1.<template>是“视图层”，负责页面的HTML结构-->
<template>
    <!-- class属性用于绑定CSS样式，控制布局 -->
    <div class="login-page">
        <!-- 登录页面的标题 -->
        <h1 class="page-title">欢迎登录**业务系统</h1>

        <!-- 登录卡片 -->
        <div class="login-card">
            <h2>系统登录</h2>

            <!-- v-model 是 Vue 最核心的语法之一：双向绑定 -->
            <!-- 它让输入框的值 (input value) 和 script 中的变量 (loginForm.username) 永远保持同步 -->
            <!-- 账号输入-->
            <div class="form-group">
                <label>账号</label>
                <input 
                    type="text"
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                />
            </div>

            <!-- 密码输入-->
            <div class="form-group">
                <label>密码</label>
                <input 
                    type="password"
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                />
            </div>
            <!-- @click 是事件绑定语法，用于监听鼠标点击事件，触发 handleLogin 函数 -->
            <!-- 登录按钮 -->
            <button class="login-btn" @click="handleLogin">登录</button>
        </div>
    </div>
</template>

<!-- 2. <script setup> 是“逻辑层”，使用 Composition API 编写 JS 代码 -->
<script setup>
// 从 vue 库中导入 reactive 函数，它能把普通对象变成“响应式”数据
// 所谓“响应式”，就是当数据改变时，页面会自动更新
import {reactive} from 'vue'

//定义表单数据对象
const loginForm = reactive({
    username: '',   // 初始为空字符串
    password: ''
});

//处理登录逻辑的函数
const handleLogin= () =>{
    // 这里可以访问到 loginForm 里的数据
    console.log('准备提交的数据：',loginForm);
//此处放置后面要接入的API请求逻辑

    alert('登录按钮已点击！请在控制台查看数据。');
};
</script>

<!-- 3. <style scoped> 是“样式层”，scoped 表示这些样式只对当前组件生效 -->
<style scoped>
/*页面容器：居中显示*/
.login-page{
    /* Flex 布局实现完美的水平垂直居中 */
    display:flex;
    flex-direction:column;      /*垂直排列*/
    justify-content:center;    /*水平居中*/
    align-items:center;         /*垂直居中*/
    height:100vh;               /*占满整个视口高度*/
    background-color:#f5f7fa; /*淡灰色背景*/
}

.page-title{
    font-size:32px;
    margin-bottom:40px;
    color:#333;
}

/*登录卡片*/
.login-card{
    width:350px;                 /*固定宽度*/
    padding:30px;                /*内边距*/
    background:white;
    border-radius:8px;           /*圆角*/
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);   /* 阴影 */
}

/*标题样式*/
.login-card h2{
    text-align:center;
    margin-bottom:25px;
    color:#333;
}

/*输入框组合 */
.form-group{
    margin-bottom:15px;
}

.form-group label{
    display:block;
    margin-bottom:5px;
    font-size:14px;
    color:#666;
}

input{
    width:100%;
    padding:10px;
    border:1px solid #dcdfe6;
    border-radius:4px;
    box-sizing:border-box;    /*防止padding撑大盒子*/
    display:inline-block;
}

/*按钮样式*/
.login-btn{
    width:100%;
    padding:10px;
    margin-top:10px;
    background-color:#409eff;
    color:white;
    border:none;
    border-radius:4px;
    cursor:pointer;
    font-size:16px;
    display:block;
}

.login-btn:hover{
    background-color:#66b1ff;
}
</style>