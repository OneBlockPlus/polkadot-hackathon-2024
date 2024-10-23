import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'


export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  // 新增的 Market 一级目录
  {
    path: '/market',
    component: Layout,
    redirect: '/market/index',
    children: [{
      path: 'index',
      name: 'Market',
      component: () => import('@/views/market/index'),
      meta: { title: 'Market', icon: 'tree' }
    }]
  },
  //个人中心目录
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/order',
    name: 'Personal Center',
    meta: { title: 'Personal Center', icon: 'user' },
    children: [
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/personal/order'),
        meta: { title: 'Order' }
      },
      {
        path: 'sell',
        name: 'Sell',
        component: () => import('@/views/personal/sell'),
        meta: { title: 'Sell' }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/personal/address'),
        meta: { title: 'Address' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
