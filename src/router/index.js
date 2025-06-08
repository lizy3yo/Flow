import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboard from '../mainpage/AdminDashboard.vue'
import AdminAppointments from '../mainpage/AdminAppointments.vue'
import AdminQueues from '../mainpage/AdminQueues.vue'
import AdminProfile from '../mainpage/AdminProfile.vue'
import AdminAppointmentsView from '@/mainpage/AdminAppointmentsView.vue'
import AppointmentsView from '@/mainpage/AppointmentsView.vue'
import UserProfile from '@/mainpage/UserProfile.vue'  // Update the import to match filename case

const routes = [
  {
    path: '/admin/dashboard',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/dashboard',
    name: 'dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/appointments',
    name: 'appointments',
    component: AdminAppointments,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/queues',
    name: 'queues',
    component: AdminQueues,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/profile',
    name: 'profile',
    component: AdminProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/:pathMatch(.*)*',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/appointments/:serviceId',
    name: 'AdminAppointmentsView',
    component: AdminAppointmentsView,
    props: true
  },
  {
    path: '/user/userprofile',
    name: 'UserProfile', // Update name to match component name
    component: UserProfile, // Use the correct component name
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Updated navigation guard to handle both admin and user routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const userType = localStorage.getItem('userType')
    const isAdmin = userType === 'admin'
    const isUser = userType === 'user'
    
    // Check if trying to access admin routes
    if (to.path.startsWith('/admin/')) {
      if (!isAdmin) {
        next('/admin/login')
      } else {
        next()
      }
    }
    // Check if trying to access user routes
    else if (to.path.startsWith('/user/')) {
      if (!isUser) {
        next('/login')
      } else {
        next()
      }
    }
    else {
      next()
    }
  } else {
    next()
  }
})

export default router