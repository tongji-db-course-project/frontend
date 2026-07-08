import {createRouter,createWebHistory} from 'vue-router'
import LoginView from '../views/login/LoginView.vue'
import MainLayout from '../layout/MainLayout.vue'

const router = createRouter({
    //使用浏览器历史记录模式
    history:createWebHistory(),
    routes:[
        {path:'/login', name:'login',component:LoginView},
        {path:'/',component:MainLayout,children:[
            {
                path:'',
                component:()=>import('../views/dashboard/DashboardView.vue')
            },
            {
                path:'product',
                component:()=>import('../views/product/ProductView.vue')
            }
        ]}
    ]
})

export default router