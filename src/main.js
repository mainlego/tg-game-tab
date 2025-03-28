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
import Loading from './pages/LoadingPage.vue'
import Onboarding from './pages/OnboardingPage.vue'

// Создаем маршруты
const routes = [
    {
        path: '/',
        component: Home,
        meta: { requiresOnboarding: true }
    },
    {
        path: '/loading',
        component: Loading
    },
    {
        path: '/onboarding',
        component: Onboarding
    },
    { path: '/boost', component: Boost, meta: { requiresOnboarding: true } },
    { path: '/growth', component: Growth, meta: { requiresOnboarding: true } },
    { path: '/friends', component: Friends, meta: { requiresOnboarding: true } },
    { path: '/tasks', component: () => import('@/pages/Tasks.vue'), meta: { requiresOnboarding: true } },
    {
        path: '/products',
        component: () => import('@/pages/Products.vue'),
        meta: { requiresOnboarding: true }
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
    // Проверяем, не зациклилось ли приложение
    const MAX_REDIRECTS = 10;
    const redirectCount = localStorage.getItem('redirectCount') ? parseInt(localStorage.getItem('redirectCount')) : 0;

    if (redirectCount > MAX_REDIRECTS) {
        console.error('Обнаружен бесконечный цикл перенаправлений. Сбрасываем счетчик и идем на главную.');
        localStorage.removeItem('redirectCount');
        localStorage.setItem('onboardingCompleted', 'true'); // Форсируем завершение онбординга
        return next('/');
    }

    // Для всех маршрутов, кроме /loading
    if (to.path !== '/loading') {
        localStorage.setItem('redirectCount', redirectCount + 1);
    }

    // Проверка, загружено ли приложение
    const isAppLoaded = localStorage.getItem('appLoaded') === 'true';

    // Если приложение еще не загружено и пользователь не на странице загрузки, перенаправляем
    if (!isAppLoaded && to.path !== '/loading') {
        console.log('Приложение еще не загружено, перенаправляем на /loading');
        return next('/loading');
    }

    // Проверка требований авторизации админа
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin && to.path !== '/admin/login') {
            return next('/admin/login');
        }
    }

    // Проверка требований онбординга
    if (to.matched.some(record => record.meta.requiresOnboarding)) {
        const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
        if (!onboardingCompleted && to.path !== '/onboarding') {
            console.log('Онбординг не завершен, перенаправляем на /onboarding');
            return next('/onboarding');
        }
    }

    // Сбрасываем счетчик перенаправлений при успешном переходе
    if (to.path !== '/loading') {
        localStorage.setItem('redirectCount', '0');
    }

    next();
})

const pinia = createPinia()
const app = createApp(App)

// Используем плагины
app.use(router)
app.use(pinia)

// Монтируем приложение
app.mount('#app')