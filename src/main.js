// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Импортируем компоненты для маршрутизации
import Home from './pages/Home.vue'
import Boost from './pages/Boost.vue'
import Growth from './pages/Growth.vue'
import AdminLayout from './layouts/AdminLayout.vue'
import Admin from './pages/Admin.vue'
import AdminLogin from './pages/AdminLogin.vue'
import Friends from './pages/Friends.vue'
import Onboarding from './components/onboarding/Onboarding.vue'

// Создаем маршруты
const routes = [
    { path: '/', component: Home },
    { path: '/boost', component: Boost },
    { path: '/growth', component: Growth },
    { path: '/friends', component: Friends },
    { path: '/tasks', component: () => import('@/pages/Tasks.vue') },
    {
        path: '/products',
        component: () => import('@/pages/Products.vue')
    },
    {
        path: '/onboarding',
        component: Onboarding
    },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            { path: '', component: Admin },
            { path: 'login', component: AdminLogin }
        ],
        meta: { requiresAuth: true }
    }
]

// Создаем экземпляр маршрутизатора
const router = createRouter({
    history: createWebHistory(),
    routes
})

// Добавляем защиту роутов
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const isAdmin = localStorage.getItem('isAdmin')
        if (!isAdmin && to.path !== '/admin/login') {
            next('/admin/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

const pinia = createPinia()
const app = createApp(App)

// Используем плагины
app.use(router)
app.use(pinia)

// Монтируем приложение
app.mount('#app')