<template>
    <div class="side-menu">
        <div class="logo">管理系统</div>

        <!-- 
        :default-active="route.path" -> 自动高亮当前所在的路由
        router -> 开启路由模式，点击 item 直接跳转到 index 指定的 path
        unique-opened -> （可选）只保持一个子菜单展开 
         -->
        <el-menu
            :default-active="route.path"
            class="el-menu-vertical"
            background-color="#304156"
            text-color="#1890ff"
            active-text-color="#1890ff"
            router
            >
            <template v-for="item in menuItems" :key="item.path || item.name">
                <!-- 情况1：没有子菜单 -->
                <el-menu-item v-if="!item.children" :index="item.path">
                   <span>{{ item.name }}</span>
                </el-menu-item>
                <!-- 情况二：有子菜单(如基础资料) -->
                <el-sub-menu v-else :index="item.name">
                    <template #title>
                        <div class="menu-title-container">
                            <span>{{ item.name }}</span>
                        </div>
                    </template>
                    <el-menu-item
                        v-for="sub in item.children"
                        :key="sub.path"
                        :index="sub.path"
                    >
                      {{ sub.name }}
                    </el-menu-item>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import{useRoute}from 'vue-router'
//获取当前路由对象，用于自动高亮当前菜单项
const route=useRoute();
const menuItems = [
    {name:'首页',path:'/dashboard'},
    {
        name:'基础资料',
        children:[
            {name:'商品管理',path:'/product'},
            {name:'商品分类',path:'/categories'},
            {name:'供应商管理',path:'/suppliers'},
            {name:'会员管理',path:'/members'}
        ]
    },
    {
        name:'采购管理',
        children:[
            {name:'采购单列表',path:'/purchases'},
            {name:'新建采购单',path:'/purchases/create'}
        ]
    },
    {
        name:'销售管理',
        children:[
            {name:'POS机收银',path:'/sales/checkout'},
            {name:'销售单列表',path:'/sales'},
            {name:'退货管理',path:'/returns'}
        ]
    },
    {
        name:'库存管理', 
        children:[
            {name:'当前库存',path:'/inventory'},
            {name:'库存流水',path:'/inventory/records'},
        ]
    },
    {
        name:'财务与统计',
        children:[
            {name:'供应商结算',path:'/settlements'},
            {name:'销售统计',path:'/statistics/sales'},
            {name:'商品排行',path:'/statistics/products'},
            {name:'毛利分析',path:'/statistics/profit'},
        ]
    },
    {
        name:'系统管理',
        children:[
            {name:'用户管理',path:'/system/users'},
            {name:'角色管理',path:'/system/roles'},
            {name:'菜单管理',path:'/system/menus'}
        ]
    },
];
</script>

<style scoped>
.side-menu{
    height:100%;
    display:flex;
    flex-direction:column;
}

.logo{
    height:60px;
    line-height:60px;
    text-align:center;
    font-weight:bold;
    color:#fff;
    background:#2b3644;
}

.el-menu-vertical{
    border-right:none;
    flex:1;   /*让菜单区占满剩余空间*/
    overflow-y:auto;  /* 允许滚动 */
}

.el-menu-vertical::-webkit-scrollbar{
    width:6px;
}
.el-menu-vertical::-webkit-scrollbar-thumb{
    background-color: #5a6e85;
}

:deep(.el-sub-menu__icon-arrow){
    margin-top: -5px;  /* 微调垂直居中 */
    right:20px;        /* 确保固定在右侧 */
    position:absolute;
}

:deep(.el-menu-item),:deep(.el-sub-menu__title){
    display:flex !important;
    align-items: center !important;
    justify-content: space-between;
    padding-right:20px !important;
}

:deep(.el-sub-menu__title){
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding-right: 20px !important;
    width:100%;
    box-sizing: border-box;
}

:deep(.el-sub-menu__title .el-sub-menu__icon-arrow){
    position: relative;
    margin: 0 !important;
    margin-left: auto;
    align-self: center;
}

:deep(.el-menu--inline .el-menu-item){
    padding-left:50px !important;  /* 控制左侧缩进，适当调小可减少空间浪费 */
    font-size:13px;                /* 文字大小，调小可以节省垂直空间 */
    height:25px !important;        /* 调小可以减小行高 */
    line-height:25px !important;   /* 必须与height保持一致，保持垂直居中 */
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover){
    background-color: #1890ff !important;
    color:#fff !important;
}

:deep(.el-menu-item.is-active){
    background-color:#1890ff !important;
    border-left:4px solid #fff;
}

</style>