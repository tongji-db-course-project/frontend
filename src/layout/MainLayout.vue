<template>
    <div class="main-layout">
        <!-- 左侧菜单 -->
        <aside class="sidebar">
            <SideMenu />
        </aside>

        <div class="content-wrapper">
            <!-- 顶部导航栏-->
            <header class="header">
                <HeaderBar />
            </header>

            <!-- 核心内容区，所有业务页面都将渲染在这里 -->
            <main class="main-body">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import SideMenu from './SideMenu.vue'
import HeaderBar from './HeaderBar.vue'
</script>

<style scoped>
.main-layout{
    display:flex;
    height:100vh;  /* 占满整个视口高度 */
}

.sidebar{
    width:240px;
    background-color:#304156;
    color:white;
}

.content-wrapper{
    flex:1;
    display:flex;
    flex-direction:column;
}
.header{
    height:60px;
    background-color:#fff;
    border-bottom:1px solid #e6e6e6;
}
.main-body{
    flex:1;
    padding:20px;
    background-color:#f0f2f5;
    overflow:auto;   /* 让内容区可以滚动 */
}

</style>