<template>
  <div class="page-container">    <!-- Add Top Navbar with status props -->
    <AdminTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      :status="adminStatus"
      @sidebar-toggle="toggleSidebar"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
      @status-change="handleStatusChange"
    />

    <!-- Pass isSidebarCollapsed to the AdminNavbar -->
    <AdminNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="toggleSidebar"
      ref="adminNavbar"
    />

    <!-- Add content-expanded class to adjust content based on sidebar state -->
    <div class="content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <!-- Back Button -->
      <div class="admin-appoint-view-back-section">
        <button class="admin-appoint-view-back-btn" @click="goBack">
          <i class="bi bi-arrow-left"></i> Back to Services
        </button>
      </div>

      <!-- Enhanced Header Section -->
      <div class="admin-appoint-view-page-header">
        <div class="admin-appoint-view-header-content">
          <h1 class="admin-appoint-view-page-title">Queue Management</h1>
          <p class="admin-appoint-view-page-subtitle">Monitor and manage service queues in real-time</p>
        </div>
      </div>

      <!-- Currently Viewing Service Context -->
      <div class="admin-appoint-view-current-service" v-if="serviceName">
        <span class="current-service-label">
          <i class="bi bi-eye-fill"></i>
          Currently Viewing:
        </span>
        <span class="current-service-name">{{ serviceName }}</span>
      </div>

      <!-- Enhanced Status Cards -->
      <div class="admin-appoint-view-stats-container">
        <div class="admin-appoint-view-stat-card" style="animation-delay: 0ms">
          <div class="admin-appoint-view-stat-icon icon-serving">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="admin-appoint-view-stat-info">
            <h3>Now Serving</h3>
            <p class="admin-appoint-view-stat-number">{{ currentlyServing?.queue_number || 'None' }}</p>
            <div class="serving-time" v-if="currentlyServing">
              Time: {{ currentlyServing.elapsedTime }}
            </div>
          </div>
        </div>

        <div class="admin-appoint-view-stat-card" style="animation-delay: 100ms">
          <div class="admin-appoint-view-stat-icon icon-priority">
            <i class="bi bi-star-fill"></i>
          </div>
          <div class="admin-appoint-view-stat-info">
            <h3>Priority Express</h3>
            <p class="admin-appoint-view-stat-number">{{ currentlyServingPriority?.queue_number || 'None' }}</p>
            <div class="serving-time" v-if="currentlyServingPriority">
              Time: {{ currentlyServingPriority.elapsedTime }}
            </div>
          </div>
        </div>

        <div class="admin-appoint-view-stat-card" style="animation-delay: 200ms">
          <div class="admin-appoint-view-stat-icon icon-total">
            <i class="bi bi-people"></i>
          </div>
          <div class="admin-appoint-view-stat-info">
            <h3>Total Queues</h3>
            <p class="admin-appoint-view-stat-number">{{ totalQueueCount }}</p>
          </div>
        </div>
      </div>

      <!-- Enhanced Queue Management Section -->
      <div class="admin-appoint-view-queue-section">
        <div class="admin-appoint-view-queue-header">
          <h2 class="admin-appoint-view-queue-title">Queue Management</h2>
          <div class="admin-appoint-view-queue-tabs">
            <button
              :class="['admin-appoint-view-tab-btn', { 'admin-appoint-view-active': activeTab === 'today' }]"
              @click="activeTab = 'today'"
            >
              <i class="bi bi-calendar-day"></i>
              Queue Today ({{ pendingAndWaitingCount }})
            </button>
            <button
              :class="['admin-appoint-view-tab-btn', { 'admin-appoint-view-active': activeTab === 'scheduled' }]"
              @click="activeTab = 'scheduled'"
            >
              <i class="bi bi-calendar-check"></i>
              Scheduled Queue ({{ scheduledQueueCount }})
            </button>
            <button
              :class="['admin-appoint-view-tab-btn', { 'admin-appoint-view-active': activeTab === 'priority' }]"
              @click="activeTab = 'priority'"
            >
              <i class="bi bi-star"></i>
              Priority Queue ({{ priorityQueueCount }})
            </button>
          </div>
        </div>

        <div class="admin-appoint-view-table-container">

        <table v-if="activeTab === 'today'" class="admin-appoint-view-table">
          <thead>
            <tr>
              <th>Queue #</th>
              <th>Name</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="queue in sortedQueueList" :key="queue.id">
              <td>{{ queue.queue_number }}</td>
              <td v-tooltip="queue.name">
                <div class="queue-user">
                  <div v-if="queue.avatar" class="queue-user-avatar-container">
                    <img
                      :src="'https://flow-backend-yxdw.onrender.com' + queue.avatar"
                      :alt="queue.name"
                      class="queue-user-avatar"
                      @error="$event.target.style.display='none'"
                    >
                  </div>
                  <div v-else class="default-avatar">
                    <i class="bi bi-person"></i>
                  </div>
                  {{ queue.name }}
                </div>
              </td>
              <td>{{ queue.time }}</td>
              <td>
                <span :class="['admin-appoint-view-status-badge', queue.status]">
                  {{ queue.status }}
                </span>
              </td>
              <td>
                <!-- Actions for pending status -->
                <template v-if="queue.status === 'pending'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-accept" @click="acceptQueue(queue.id)">
                    Accept
                  </button>
                  <button class="admin-appoint-view-action-btn admin-appoint-view-decline" @click="declineQueue(queue.id)">
                    Decline
                  </button>
                </template>

                <!-- Actions for waiting status -->
                <template v-if="queue.status === 'waiting'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-serve" @click="serveQueue(queue.id)">
                    Start Serving
                  </button>
                </template>

                <!-- Actions for serving status -->
                <template v-if="queue.status === 'serving'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-done" @click="completeQueue(queue.id)">
                    Done
                  </button>
                </template>

                <!-- Actions for completed status -->
                <template v-if="queue.status === 'completed'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-archive" @click="archiveQueue(queue.id)">
                    Archive
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else-if="activeTab === 'scheduled'" class="admin-appoint-view-table">
          <thead>
            <tr>
              <th>Queue #</th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="queue in sortedScheduledList" :key="queue.id">
              <td>{{ queue.queue_number }}</td>
              <td>
                <div class="queue-user">
                  <div v-if="queue.avatar" class="queue-user-avatar-container">
                    <img
                      :src="'https://flow-backend-yxdw.onrender.com' + queue.avatar"
                      :alt="queue.name"
                      class="queue-user-avatar"
                      @error="$event.target.style.display='none'"
                    >
                  </div>
                  <div v-else class="default-avatar">
                    <i class="bi bi-person"></i>
                  </div>
                  {{ queue.name }}
                </div>
              </td>
              <td>{{ queue.appointmentDate }}</td>
              <td>{{ queue.time }}</td>
              <td>
                <span :class="['admin-appoint-view-status-badge', queue.status]">
                  {{ queue.status }}
                </span>
              </td>
              <td>
                <template v-if="queue.status === 'pending'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-accept" @click="acceptQueue(queue.id)">
                    Accept
                  </button>
                  <button class="admin-appoint-view-action-btn admin-appoint-view-decline" @click="declineQueue(queue.id)">
                    Decline
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else-if="activeTab === 'priority'" class="admin-appoint-view-table">
          <thead>
            <tr>
              <th>Queue #</th>
              <th>Name</th>
              <th>Time</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="queue in sortedPriorityList" :key="queue.id">
              <td>{{ queue.queue_number }}</td>
              <td>
                <div class="queue-user">
                  <div v-if="queue.avatar" class="queue-user-avatar-container">
                    <img
                      :src="'https://flow-backend-yxdw.onrender.com' + queue.avatar"
                      :alt="queue.name"
                      class="queue-user-avatar"
                      @error="$event.target.style.display='none'"
                    >
                  </div>
                  <div v-else class="default-avatar">
                    <i class="bi bi-person"></i>
                  </div>
                  {{ queue.name }}
                </div>
              </td>
              <td>{{ queue.time }}</td>
              <td>{{ queue.notes || '-' }}</td>
              <td>
                <span :class="['admin-appoint-view-status-badge', queue.status]">
                  {{ queue.status }}
                </span>
              </td>
              <td>
                <!-- Actions for pending status -->
                <template v-if="queue.status === 'pending'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-accept" @click="acceptPriorityQueue(queue.id)">
                    Accept
                  </button>
                  <button class="admin-appoint-view-action-btn admin-appoint-view-decline" @click="declinePriorityQueue(queue.id)">
                    Decline
                  </button>
                </template>

                <!-- Actions for waiting status -->
                <template v-if="queue.status === 'waiting'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-serve" @click="servePriorityQueue(queue.id)">
                    Start Serving
                  </button>
                </template>

                <!-- Actions for serving status -->
                <template v-if="queue.status === 'serving'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-done" @click="completePriorityQueue(queue.id)">
                    Done
                  </button>
                </template>

                <!-- Actions for completed status -->
                <template v-if="queue.status === 'completed'">
                  <button class="admin-appoint-view-action-btn admin-appoint-view-archive" @click="archivePriorityQueue(queue.id)">
                    Archive
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import AdminTopNavbar from './AdminTopNavbar.vue'
import axios from 'axios'

const tooltip = {
  mounted(el, binding) {
    if (el.scrollHeight > el.clientHeight) {
      el.title = binding.value;
    }
  }
}

export default {
  name: 'AdminAppointmentsView',
  components: {
    AdminNavbar,
    AdminTopNavbar
  },
  directives: {
    tooltip
  },
  data() {
    return {
      // Initialize from localStorage or default to false
      isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      userProfile: null, // Add user profile for TopNavbar
      adminStatus: 'active', // Add adminStatus property
      currentDate: '',
      currentTime: '',
      departmentName: '',
      activeTab: 'today',
      queueList: [],
      scheduledQueueList: [],
      priorityQueueList: [],
      serviceId: null, // Will be set from route params
      serviceName: '', // Will be set from route params
      updateInterval: null
    }
  },
  async created() {
    this.serviceId = this.$route.params.serviceId
    this.serviceName = this.$route.params.serviceName ? decodeURIComponent(this.$route.params.serviceName) : ''

    await this.fetchQueues()
    await this.fetchUserProfile() // Add this line
    await this.fetchAdminStatus() // Add this line
    // Update queues every 30 seconds
    this.updateInterval = setInterval(() => this.fetchQueues(), 30000)
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  },
  computed: {
    sortedQueueList() {
      return [...this.queueList].sort((a, b) => {
        const statusOrder = {
          'serving': 0,     // Move serving to top
          'waiting': 1,     // Then waiting
          'pending': 2,     // Then pending
          'declined': 3,    // Then declined
          'completed': 4    // Completed at bottom
        }
        return statusOrder[a.status] - statusOrder[b.status]
      })
    },
    currentlyServing() {
      return this.queueList.find(queue => queue.status === 'serving')
    },
    currentlyServingPriority() {
      return this.priorityQueueList.find(queue => queue.status === 'serving')
    },
    pendingAndWaitingCount() {
      return this.queueList.filter(queue =>
        queue.status === 'pending' || queue.status === 'waiting'
      ).length
    },
    sortedScheduledList() {
      return [...this.scheduledQueueList].sort((a, b) => {
        // Sort by date first, then time
        const dateA = new Date(`${a.appointmentDate} ${a.time}`);
        const dateB = new Date(`${b.appointmentDate} ${b.time}`);
        return dateA - dateB;
      });
    },
    sortedPriorityList() {
      return [...this.priorityQueueList].sort((a, b) => {
        const statusOrder = {
          'serving': 0,
          'waiting': 1,
          'pending': 2,
          'declined': 3,
          'completed': 4
        };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    },
    priorityQueueCount() {
      return this.priorityQueueList.filter(queue =>
        queue.status === 'pending' || queue.status === 'waiting'
      ).length
    },

    scheduledQueueCount() {
      return this.scheduledQueueList.filter(queue =>
        queue.status === 'pending'  // Change this line to only check for pending status
      ).length
    },

    totalQueueCount() {
      const regularQueue = this.queueList.filter(q => q.status === 'waiting').length;
      const priorityQueue = this.priorityQueueList.filter(q => q.status === 'waiting').length;
      const scheduledQueue = this.scheduledQueueList.filter(q => q.status === 'scheduled').length;
      return regularQueue + priorityQueue + scheduledQueue;
    }
  },
  mounted() {
    this.updateDateTime()
    setInterval(this.updateDateTime, 60000)
    this.departmentName = this.$route.params.departmentName || 'Department'
  },
  methods: {
    async fetchQueues() {
      try {
        const response = await fetch(`https://flow-backend-yxdw.onrender.com/adminqueuemanagement.php?service_id=${this.serviceId}`)
        const data = await response.json()

        if (data.error) {
          console.error(data.error)
          return
        }

        this.queueList = data.regular
        this.priorityQueueList = data.priority
        this.scheduledQueueList = data.scheduled
      } catch (error) {
        console.error('Failed to fetch queues:', error)
      }
    },
    async updateQueueStatus(id, status) {
      try {
        const response = await fetch('https://flow-backend-yxdw.onrender.com/adminqueuemanagement.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            queue_id: id,
            status: status
          })
        })

        const data = await response.json()
        if (data.success) {
          await this.fetchQueues() // Refresh the queues
        } else {
          console.error('Failed to update queue status:', data.error)
        }
      } catch (error) {
        console.error('Failed to update queue:', error)
      }
    },
    async archiveQueue(id) {
      try {
        const response = await fetch(`https://flow-backend-yxdw.onrender.com/adminqueuemanagement.php?id=${id}`, {
          method: 'DELETE'
        })

        const data = await response.json()
        if (data.success) {
          await this.fetchQueues() // Refresh the queues
        } else {
          console.error('Failed to archive queue:', data.error)
        }
      } catch (error) {
        console.error('Failed to archive queue:', error)
      }
    },
    async acceptQueue(id) {
      await this.updateQueueStatus(id, 'waiting')
    },
    async declineQueue(id) {
      await this.updateQueueStatus(id, 'declined')
    },
    async serveQueue(id) {
      const isServing = this.queueList.some(q => q.status === 'serving')
      if (isServing) {
        alert('Please complete the current queue first.')
        return
      }
      await this.updateQueueStatus(id, 'serving')
    },
    async completeQueue(id) {
      await this.updateQueueStatus(id, 'completed')
    },
    async acceptPriorityQueue(id) {
      await this.updateQueueStatus(id, 'waiting')
    },
    async declinePriorityQueue(id) {
      await this.updateQueueStatus(id, 'declined')
    },
    async servePriorityQueue(id) {
      const isServing = this.priorityQueueList.some(q => q.status === 'serving')
      if (isServing) {
        alert('Please complete the current priority queue first.')
        return
      }
      await this.updateQueueStatus(id, 'serving')
    },
    async completePriorityQueue(id) {
      await this.updateQueueStatus(id, 'completed')
    },
    async archivePriorityQueue(id) {
      await this.archiveQueue(id)
    },
    updateDateTime() {
      const now = new Date()
      this.currentDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    goBack() {
      this.$router.push('/admin/appointments');
    },    toggleSidebar(value) {
      // Use provided value or toggle current state
      const newState = value !== undefined ? value : !this.isSidebarCollapsed;
      this.isSidebarCollapsed = newState;

      // Save to localStorage for persistence
      localStorage.setItem('sidebarCollapsed', newState);
    },

    handleMobileSidebarToggle() {
      // Delegate mobile sidebar toggle to AdminNavbar component
      this.$refs.adminNavbar?.toggleSidebar();
    },

    async fetchUserProfile() {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          this.userProfile = JSON.parse(userData);
          return;
        }

        const admin = localStorage.getItem('admin');
        if (!admin) {
          this.$router.push('/admin/login');
          return;
        }

        const response = await axios.get('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          withCredentials: true
        });

        if (response.data) {
          this.userProfile = {
            name: response.data.name || 'Unknown User',
            email: response.data.email || '',
            role: 'Administrator',
            avatar: response.data.avatar || null
          };
          localStorage.setItem('userData', JSON.stringify(this.userProfile));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('admin');
          this.$router.push('/admin/login');
        }
      }
    },

    async fetchAdminStatus() {
      try {
        const response = await axios.get('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          withCredentials: true
        });
        
        if (response.data) {
          this.adminStatus = response.data.queue_status || 'active';
        }
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    },

    handleStatusChange(newStatus) {
      this.adminStatus = newStatus;
      
      // Save status change to backend
      axios.put('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
        queue_status: newStatus,
        action: 'update_status_only'
      }, { withCredentials: true })
      .then(response => {
        console.log('Status updated successfully:', response.data);
      })
      .catch(error => {
        console.error('Failed to update status:', error);
      });
    },

    async handleSignOut() {
      try {
        const response = await axios.post('/apihttps://flow-backend-yxdw.onrender.com/logout.php', {}, {
          withCredentials: true
        });

        if (response.data.success) {
          this.clearAuthData();
          this.$router.push('/admin/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
        this.clearAuthData();
        this.$router.push('/admin/login');
      }
    },

    clearAuthData() {
      localStorage.clear();
    },

    startTimeUpdate() {
      this.timeInterval = setInterval(() => {
        this.currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }, 60000) // Update every minute
    },

    async fetchAppointments() {
      try {
        // Existing fetch appointments logic
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    },

    // All other existing methods...
  }
}
</script>

<style>
@import '@/styles/mainpage-admin/appointmentview.css';
@import '@/styles/mainpage-admin/content.css';
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/topnav.css';
</style>