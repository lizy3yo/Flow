import { createRouter, createWebHistory } from 'vue-router';
import LoginSelector from '@/pages/LoginSelector.vue';
import AdminLogin from '@/pages/AdminLogin.vue';
import UserLogin from '@/pages/UserLogin.vue';
import Landing from './pages/Landing.vue';
import NotFound from './pages/NotFound.vue';
import UserSignup from '@/pages/UserSignup.vue';
import AdminDashboard from '@/mainpage/AdminDashboard.vue';
import UserDashboard from '@/mainpage/UserDashboard.vue';

const routes = [
    {
        path: '/', // Add root path redirect
        redirect: '/landing'
    },
    {
        path: '/login',
        name: 'LoginSelector',
        component: LoginSelector
    },
    {
        path: '/landing',
        name: 'Landing',
        component: Landing
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin
    },
    {
        path: '/user/login',
        name: 'UserLogin',
        component: UserLogin
    },
    {
        path: '/signup/user',
        name: 'UserSignup',
        component: UserSignup
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/user/dashboard',
        name: 'UserDashboard',
        component: UserDashboard,
        meta: { requiresAuth: true, requiresUser: true }
    },
  
    {
        path: '/admin/appointments',
        name: 'AdminAppointments',
        component: () => import('@/mainpage/AdminAppointments.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/analytics',
        name: 'AdminAnalytics',
        component: () => import('@/mainpage/AdminAnalytics.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/settings',
        name: 'AdminSettings',
        component: () => import('@/mainpage/AdminSettings.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/profile',
        name: 'AdminProfile',
        component: () => import('@/mainpage/AdminProfile.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/user/book',
        name: 'UserBook',
        component: () => import('@/mainpage/UserBook.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/book-appointment',
        name: 'UserBookAppointment',
        component: () => import('@/mainpage/UserBookAppointment.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/book-appointment/:departmentId/view',
        name: 'UserBookAppointmentView',
        component: () => import('@/mainpage/UserBookAppointmentView.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/admin/appointmentsview',
        name: 'AdminAppointmentsView',
        component: () => import('@/mainpage/AdminAppointmentsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/user/my-appointments',
        name: 'UserMyAppointments',
        component: () => import('@/mainpage/UserMyAppointments.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('@/mainpage/UserProfile.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/pages/forgotPasswordView.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/pages/resetPasswordView.vue')
    },
    {
        path: '/user/activity-log',
        name: 'UserActivityLog',
        component: () => import('@/mainpage/UserActivityLog.vue'),
        meta: { requiresAuth: true, requiresUser: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guard
// ...existing code...

// Navigation guard
router.beforeEach((to, from, next) => {
    const admin = localStorage.getItem('admin')
    const userType = localStorage.getItem('userType')
    
    console.log('Route:', to.path, 'UserType:', userType)

    if (to.meta.requiresAuth) {
        if (to.meta.requiresAdmin && (!admin || userType !== 'admin')) {
            next('/admin/login')
        } else if (to.meta.requiresUser && userType !== 'user') {
            next('/user/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router