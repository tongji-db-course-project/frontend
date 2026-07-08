<template>
    <div class="side-menu">
        <div class="logo">管理系统</div>

        <!-- 循环遍历菜单项 -->
        <nav class="menu-list">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="menu-item"
            >
                {{ item.name }}
            </router-link>
        </nav>
    </div>
</template>

<script setup>
const menuItems = [
    {name:'工作台', path:'/'},
    {name:'商品管理',path:'/product'},
    {name:'会员管理',path:'/member'},
    {name:'销售记录',path:'/sale'}
];
</script>

<style scoped>
.logo{
    height:60px;
    line-height:60px;
    text-align:center;
    font-weight:bold;
    color:#fff;
    background:#2b3644;
}

.menu-list{
    display:flex;
    flex-direction:column;
}

.menu-item{
    padding:15px 20px;
    color:#bfcbd9;
    text-decoration:none;  /*去掉下划线*/
    background-color:#304156;
    transition:0.3s;
}


.menu-item:hover{
    background-color:#1890ff;
    color:#fff;
}

</style>