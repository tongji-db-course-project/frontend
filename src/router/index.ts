import {createRouter,createWebHistory} from 'vue-router'
import LoginView from '../views/login/LoginView.vue'
import MainLayout from '../layout/MainLayout.vue'

const router = createRouter({
    //使用浏览器历史记录模式
    history:createWebHistory(),
    routes:[
        {path:'/login', name:'login',component:LoginView},
        {path:'/',component:MainLayout,redirect:'/dashboard',children:[
            //工作台
            {path:'dashboard',component:()=>import('../views/dashboard/DashboardView.vue')},
            
            //系统管理
            // 旧地址保留兼容，统一跳转到独立的会员管理页面
            {path:'system/users',redirect:'/members'},
            {path:'system/roles',component:()=>import('../views/system/RoleListView.vue')},
            {path:'system/menus',component:()=>import('../views/system/MenuListView.vue')},

            //商品管理
            {path:'product',component:()=>import('../views/product/ProductListView.vue')},
            {path:'categories',component:()=>import('../views/product/CategoryListView.vue')},
            {path:'suppliers',component:()=>import('../views/supplier/SupplierListView.vue')},
            {path:'members',component:()=>import('../views/member/MemberListView.vue')},

            //采购管理
            {path: 'purchases',name: 'PurchaseList',component: () => import('../views/purchase/PurchaseListView.vue'),meta: { title: '采购单列表', parent: '采购管理' },},
            {path:'purchases/create',name: 'PurchaseCreate',component:()=>import('../views/purchase/PurchaseFormView.vue'),meta: { title: '新建采购单', parent: '采购管理' }},
            {path:'purchases/edit/:id',name: 'PurchaseEdit',component:()=>import('../views/purchase/PurchaseFormView.vue'),meta: { title: '编辑采购单', parent: '采购管理' }},
            {path:'purchases/:id',name: 'PurchaseDetail',component:()=>import('../views/purchase/PurchaseDetailView.vue'),meta: { title: '采购单详情', parent: '采购管理' }},

            // 销售管理
            {path:'sales',component:()=>import('../views/sale/SaleListView.vue')},
            {path:'sales/checkout',component:()=>import('../views/sale/CheckoutView.vue')},
            {path:'sales/:id',component:()=>import('../views/sale/SaleDetailView.vue')},
            
            //退货管理
            {path:'returns',component:()=>import('../views/return/ReturnListView.vue')},
            {path:'returns/:id',component:()=>import('../views/return/ReturnDetailView.vue')},

            //库存与其他
            {path:'inventory',component:()=>import('../views/inventory/InventoryListView.vue')},
            {path:'inventory/records',component:()=>import('../views/inventory/InventoryRecordView.vue')},
            {path:'points/records',component:()=>import('../views/point/PointRecordView.vue')},
            {path:'settlements',component:()=>import('../views/settlement/SettlementListView.vue')},

            //统计分析
            {path:'statistics/sales',component:()=>import('../views/statistics/SalesStatisticsView.vue')},
            {path:'statistics/products',component:()=>import('../views/statistics/ProductRankView.vue')},
            {path:'statistics/profit',component:()=>import('../views/statistics/ProfitStatisticsView.vue')},
            {path:'statistics/inventory',component:()=>import('../views/statistics/InventoryStatisticsView.vue')},
        ]}
    ]
})

router.beforeEach((to,_from,next)=>{
    const token=localStorage.getItem('token')

    //没登录，并且访问的不是登录页
    if(!token&&to.path!=='/login'){
        next('/login')
        return
    }

    //已登录，却又访问登录页
    if(token&&to.path==='/login'){
        next('/dashboard')
        return
    }

    //其他情况正常放行
    next()
})

export default router
