// src/admin.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import AdminLayout from './src/layouts/AdminLayout.vue'
import Admin from './src/pages/Admin.vue'
import AdminLogin from './src/pages/AdminLogin.vue'

const router = createRouter({
    history: createWebHistory('/admin'),
    routes: [
        {
            path: '/',
            component: AdminLayout,
            children: [
                { path: '', component: Admin },
                { path: 'login', component: AdminLogin }
            ]
        }
    ]
})

// Проверка авторизации
router.beforeEach((to, from, next) => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin && to.path !== '/admin/login') {
        next('/admin/login')
    } else {
        next()
    }
})

const app = createApp(AdminLayout)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')