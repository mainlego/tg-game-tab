// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Импортируем компоненты для маршрутизации
import Home from './views/Home.vue'
import Boost from './views/Boost.vue'
import Growth from './views/Growth.vue'
import Friends from './views/Friends.vue'
import AdminView from './views/AdminView.vue'
import AdminLoginView from './views/AdminLoginView.vue'

// Создаем маршруты
const routes = [
    { path: '/', component: Home },
    { path: '/boost', component: Boost },
    { path: '/growth', component: Growth },
    { path: '/friends', component: Friends },
    { path: '/tasks', component: () => import('@/views/Tasks.vue') },
    {
        path: '/products',
        component: () => import('@/views/Products.vue')
    },
    {
        path: '/admin',
        component: AdminView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/login',
        component: AdminLoginView
    },
    // Редирект для несуществующих путей
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

// Создаем экземпляр маршрутизатора
const router = createRouter({
    history: createWebHistory(),
    routes
})

// Добавляем защиту роутов
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
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

// Создаем экземпляр Pinia
const pinia = createPinia()

// Создаем приложение
const app = createApp(App)

// Подключаем плагины
app.use(router)
app.use(pinia)

// Монтируем приложение
app.mount('#app')