<template>  <div class="user-page-container" :class="{ 'user-sidebar-collapsed': isSidebarCollapsed }">    <UserTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="topNavUserProfile"
      @sidebar-toggle="handleSidebarToggle"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
    />
    <UserNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :sidebarOpen="mobileSidebarOpen"
      @update:sidebarOpen="handleMobileSidebarToggle" 
    /><div class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">
      <!-- Welcome Banner and Active Queue Side by Side -->
      <div class="dashboard-top-row">
        <!-- Welcome Banner with Quick Actions -->
        <div class="welcome-banner">
          <div class="welcome-content">
            <h1>Welcome back, {{ userData.name }}</h1>
            <p>What would you like to do today?</p>            <div class="quick-actions">
              <button class="action-btn tertiary" @click="navigateToMyAppointments">
                <i class="bi bi-list-check"></i>
                <span>My Appointments</span>
              </button>
            </div>
          </div>
          <div class="welcome-illustration">
            <img src="" alt="Queue illustration" />
          </div>
        </div>

        <!-- Active Queue Status -->        <div class="active-queue" v-if="hasActiveQueue">
          <div class="active-queue-header">
            <h2>
              <i class="bi bi-hourglass-split"></i> Your active queue
            </h2>
            <button class="view-queue-btn" @click="viewActiveQueue">
              View Status
            </button>
          </div>          <div class="active-queue-content">
            <div class="queue-number">{{ activeQueue.number }}</div>
            <div class="queue-details">
              <div class="queue-location">{{ activeQueue.department }}</div>
              <div class="queue-progress">
                <div class="progress-bar">
                  <div class="progress-filled" :style="{ width: queueProgress + '%' }"></div>
                </div>
                <div class="progress-text">
                  <span class="status-badge" :class="activeQueue.status">
                    {{ activeQueue.status }}
                  </span>
                  <span class="queue-time">Est. wait: {{ activeQueue.waitTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Overview -->
      <div class="overview-section">
        <h2>Today's Overview</h2>
        <div class="overview-grid">          <div class="overview-card">
            <div class="overview-icon calendar-icon"><i class="bi bi-calendar-event"></i></div>
            <div class="overview-info">
              <div class="overview-title">Today's Appointments</div>
              <div class="overview-value">{{ todayAppointments.length }}</div>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon stopwatch-icon"><i class="bi bi-stopwatch"></i></div>
            <div class="overview-info">
              <div class="overview-title">Active Queues</div>
              <div class="overview-value">{{ activeQueuesCount }}</div>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon building-icon"><i class="bi bi-building"></i></div>
            <div class="overview-info">
              <div class="overview-title">Available Services</div>
              <div class="overview-value">{{ departmentsCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-column layout for upcoming events and recent activity -->
      <div class="home-grid">
        <!-- Upcoming Appointments -->
        <div class="home-card upcoming-appointments">
          <div class="card-header">
            <h2><i class="bi bi-calendar-check"></i> Upcoming Appointments</h2>
            <button class="btn-text" @click="navigateToBooking">View All</button>
          </div>
          <div class="appointments-list">
            <div v-if="upcomingAppointments.length === 0" class="empty-state">
              <i class="bi bi-calendar-x"></i>
              <p>No upcoming appointments</p>
              <button class="btn-primary" @click="navigateToBooking">
                Book Now
              </button>
            </div>
            <div v-else v-for="apt in upcomingAppointments" :key="apt.id" class="appointment-item">
              <div class="appointment-date">
                <div class="date-day">{{ formatDateDay(apt.date) }}</div>
                <div class="date-month">{{ formatDateMonth(apt.date) }}</div>
              </div>
              <div class="appointment-details">
                <div class="appointment-title">{{ apt.department }}</div>
                <div class="appointment-time">{{ apt.time }}</div>
              </div>
              <div class="appointment-status">
                <span class="status-badge" :class="apt.status.toLowerCase()">
                  {{ apt.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Queue Activity -->
        <div class="home-card recent-activity">
          <div class="card-header">            <h2><i class="bi bi-activity"></i> Recent Queue Activity</h2>
            <button class="btn-text" @click="navigateToActivityLog">View All</button>
          </div>
          <div class="activity-list">            <div v-if="recentQueues.length === 0" class="empty-state">
              <i class="bi bi-list"></i>
              <p>No recent queue activity</p>
              <button class="btn-primary" @click="navigateToQueue">
                Join Queue
              </button>
            </div>
            <div v-else v-for="queue in recentQueues" :key="queue.number" class="activity-item">
              <div class="activity-icon" :class="getActivityIconClass(queue.status)">
                <i :class="getActivityIcon(queue.status)"></i>
              </div>
              <div class="activity-details">
                <div class="activity-title">
                  {{ queue.number }} - {{ queue.department }}
                </div>
                <div class="activity-time">{{ queue.time }}</div>
              </div>
              <div class="activity-status">
                <span class="status-badge" :class="queue.status">
                  {{ queue.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserNavbar from './UserNavbar.vue'
import UserTopNavbar from './UserTopNavbar.vue'
import { format } from 'date-fns'
import axios from 'axios'

const API_BASE_URL = 'https://flow-backend-yxdw.onrender.com'

export default {
  name: 'UserHome',
  components: {
    UserNavbar,
    UserTopNavbar
  },  data() {
    return {
      userData: {
        name: '',
        email: '',
        avatar: null
      },
      topNavUserProfile: {
        name: 'User',
        email: '',
        avatar: null
      },
      departments: [],
      queues: [],
      appointments: [],
      isSidebarCollapsed: false,
      mobileSidebarOpen: false, // For mobile sidebar state
      loading: true,
      error: null
    }
  },
  computed: {
    hasActiveQueue() {
      // Check for multiple possible active statuses
      return this.queues.some(q => ['waiting', 'pending', 'confirmed'].includes(q.status?.toLowerCase()))
    },
    activeQueue() {
      // Find first active queue with any of these statuses
      const active = this.queues.find(q => ['waiting', 'pending', 'confirmed'].includes(q.status?.toLowerCase()))
      if (!active) return {}
      
      // Return queue with required properties
      return {
        number: active.queue_number || active.id || 'N/A',
        department: active.service_name || active.department || 'Unknown Service',
        status: active.status || 'pending',
        waitTime: active.estimated_wait_time || '15 min',
        ...active
      }
    },
    queueProgress() {
      // Calculate based on position in queue and total queues
      const totalQueues = this.queues.filter(q => q.status === 'waiting').length
      const position = this.queues.findIndex(q => q.number === this.activeQueue.number)
      return position > -1 ? ((totalQueues - position) / totalQueues) * 100 : 0
    },
    activeQueuesCount() {
      return this.queues.filter(q => q.status === 'waiting').length
    },
    departmentsCount() {
      return this.departments.length
    },
    todayAppointments() {
      const today = new Date().toISOString().split('T')[0]
      return this.queues.filter(q => 
        q.created_at?.split('T')[0] === today || 
        q.scheduled_time?.split('T')[0] === today
      )
    },
    upcomingAppointments() {
      const today = new Date().toISOString().split('T')[0];
      return this.queues
        .filter(q => q.scheduled_time >= today || q.status === 'pending')
        .sort((a, b) => new Date(a.scheduled_time || a.created_at) - new Date(b.scheduled_time || b.created_at))
        .slice(0, 3)
        .map(apt => ({
          ...apt,
          date: apt.scheduled_time || apt.created_at,
          time: this.formatTime(apt.scheduled_time || apt.created_at)
        }));
    },
    recentQueues() {
      return [...this.queues]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
        .map(queue => ({
          ...queue,
          time: this.formatTime(queue.created_at) // Add formatted time
        }));
    },
  },
  methods: {
    // Add resize handler method for sidebar
    handleResize() {
      // If on mobile (width <= 768px), sidebar should behave differently
      if (window.innerWidth <= 768) {
        // On mobile we don't want sidebar collapsed state to persist
        // Instead manage only the open/closed state for the slide-in panel
        this.mobileSidebarOpen = false; // Close sidebar on resize to mobile
      }
    },      async fetchUserProfile() {
      try {
        const response = await axios.get(`${API_BASE_URL}/user-profile.php`, {
          withCredentials: true
        })
        this.userData = response.data
        
        // Update topNavUserProfile object for the TopNavbar component
        this.topNavUserProfile = {
          name: this.userData.name || `${this.userData.first_name || ''} ${this.userData.last_name || ''}`.trim() || 'User',
          email: this.userData.email || '',
          avatar: this.userData.avatar || null
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get(`${API_BASE_URL}/establishments.php`)
        this.departments = response.data.map(dept => ({
          id: dept.admin_id,
          name: dept.name,
          description: dept.description,
          status: dept.queue_status,
          icon: 'bi bi-building',
          avatar: dept.avatar, // Add this line
          currentQueue: 0,
          maxQueue: 100
        }))

        // Fetch current queue counts for each department
        for (let dept of this.departments) {
          const queueResponse = await axios.get(
            `${API_BASE_URL}/appointments.php?service_id=${dept.id}&count=true`
          )
          dept.currentQueue = queueResponse.data.count || 0
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    },

    async fetchQueues() {
      try {
        const response = await axios.get(`${API_BASE_URL}/userappointments.php`, {
          withCredentials: true
        })
        this.queues = response.data
      } catch (error) {
        console.error('Error fetching queues:', error)
      }
    },

    formatTime(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error('Invalid date for time formatting:', dateString);
        return '';
      }
    },

    formatDate(date) {
      if (!date) return '';
      try {
        return format(new Date(date), 'MMM dd, yyyy');
      } catch (error) {
        console.error('Invalid date:', date);
        return '';
      }
    },
    
    formatDateDay(date) {
      if (!date) return '';
      try {
        return format(new Date(date), 'dd');
      } catch (error) {
        console.error('Invalid date:', date);
        return '';
      }
    },
    
    formatDateMonth(date) {
      if (!date) return '';
      try {
        return format(new Date(date), 'MMM');
      } catch (error) {
        console.error('Invalid date:', date);
        return '';
      }
    },

    // Navigation methods
    navigateToQueue() {
      this.$router.push('/user/book')
    },
    navigateToBooking() {
      this.$router.push('/user/book')
    },
    navigateToMyAppointments() {
      this.$router.push('/user/my-appointments')
    },    viewActiveQueue() {
      this.$router.push('/user/my-appointments')
    },
    navigateToActivityLog() {
      this.$router.push('/user/activity-log')
    },
    getActivityIcon(status) {
      const icons = {
        'waiting': 'bi bi-hourglass-split',
        'completed': 'bi bi-check-circle',
        'cancelled': 'bi bi-x-circle',
        'pending': 'bi bi-clock'
      }
      return icons[status] || 'bi bi-circle'
    },
    getActivityIconClass(status) {
      const classes = {
        'waiting': 'icon-waiting',
        'completed': 'icon-completed',
        'cancelled': 'icon-cancelled',
        'pending': 'icon-pending'
      }
      return classes[status] || ''
    },    handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed
      
      // On desktop, when collapsing sidebar, ensure mobile sidebar is closed
      if (window.innerWidth > 768) {
        this.mobileSidebarOpen = false
      }
    },    handleMobileSidebarToggle(isOpen) {
      // Handle the mobile sidebar open/close state
      // Toggle if no value is provided
      if (isOpen === undefined) {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
      } else {
        this.mobileSidebarOpen = isOpen;
      }
    },
    handleSignOut() {
      localStorage.clear()
      this.$router.push('/login')
    }
  },  beforeUnmount() {
    // Clean up resize listener when component is destroyed
    window.removeEventListener('resize', this.handleResize)
  },  async mounted() {
    try {
      this.loading = true
      
      // Initialize sidebar state from localStorage
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        this.isSidebarCollapsed = JSON.parse(savedState)
      }
      
      // Add resize listener for responsive behavior
      window.addEventListener('resize', this.handleResize)
      // Initialize based on current window size
      this.handleResize()      // Load user profile from localStorage for TopNavbar display
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        this.topNavUserProfile = {
          name: user.name || 'User',
          email: user.email || '',
          avatar: user.avatar || null
        }
      }

      // Fetch all data concurrently
      await Promise.all([
        this.fetchUserProfile(),
        this.fetchDepartments(),
        this.fetchQueues()
      ])
    } catch (error) {
      console.error('Error initializing dashboard:', error)
      this.error = 'Failed to load dashboard data'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style>
@import '@/styles/mainpage-user/content.css';
@import '@/styles/mainpage-user/dashboard.css';

/* Force white background with maximum specificity - ONLY for user dashboard */
.user-page-container.user-page-container {
  background-color: #ffffff !important;
  background: #ffffff !important;
}

/* Only apply white background when inside user dashboard */
.user-page-container html, 
.user-page-container body {
  background-color: #ffffff !important;
  background: #ffffff !important;
}
</style>