<template>
    <div class="header-bar">
        <div class="left">
            <span>数据库课程设计-业务系统</span>
        </div>
        <div class="right">
            <span class="user-info">管理员</span>
            <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
    </div>
</template>

<script setup>
const handleLogout=()=>{
    alert('退出登录');
    //后续这里会跳转到/login页面
};
</script>

<style scoped>
.header-bar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:0 20px;
    height:100%;
}

.logout-btn{
    margin-left:15px;
    cursor:pointer;
}
</style>