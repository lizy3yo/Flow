<template>  <div class="user-page-container" :class="{ 'user-sidebar-collapsed': isSidebarCollapsed }">
    <UserTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      @sidebar-toggle="handleSidebarToggle"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
    />
    <UserNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :sidebarOpen="mobileSidebarOpen"
      @update:sidebarOpen="handleMobileSidebarToggle" 
    />
    <div class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">
    
      <!-- Confirmation Modal -->
      <div class="confirmation-modal-overlay" v-if="showConfirmModal" @click="cancelConfirmation">
        <div class="confirmation-modal" @click.stop>          <div class="modal-header">
            <h3>
              <i class="bi bi-exclamation-triangle"></i>
              Confirm Cancellation
            </h3>
            <button class="modal-close" @click="cancelConfirmation" title="Close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to cancel this queue? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <div class="modal-actions">              <button class="btn-secondary" @click="cancelConfirmation">
                <i class="bi bi-check-circle"></i>
                Keep Queue
              </button>
              <button class="btn-danger" @click="confirmCancellation">
                <i class="bi bi-x-circle"></i>
                Yes, Cancel Queue
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Alert Container -->
      <div class="user-service-alert-container" v-if="success || error">
        <div v-if="success" class="user-service-alert user-service-alert-success">
          <i class="bi bi-check-circle"></i>
          <span>{{ success }}</span>
        </div>
        <div v-if="error" class="user-service-alert user-service-alert-danger">
          <i class="bi bi-exclamation-triangle"></i>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Modern Header Section -->
      <div class="user-appointments-header-section">
        <div class="header-content">
          <h1 class="user-appointments-main-header">My Appointments</h1>
          <p class="user-appointments-subtitle">View and manage all your appointments, queues, and scheduled services in one place.</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ priorityQueues.length }}</div>
            <div class="stat-label">Priority</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ regularQueues.length }}</div>
            <div class="stat-label">Regular</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ scheduledQueues.length }}</div>
            <div class="stat-label">Scheduled</div>
          </div>
        </div>
      </div>

      <div v-if="!loading">

        <!-- Priority Queues Section -->
        <div class="appointments-section priority-section" v-if="priorityQueues.length > 0">
          <div class="section-header">
            <h2 class="section-title">
              <i class="bi bi-exclamation-triangle-fill"></i>
              Priority Queues
            </h2>
            <div class="section-badge priority-badge">{{ priorityQueues.length }}</div>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-card-view">d
            <div v-for="queue in priorityQueues" :key="queue.number" class="appointment-card priority-card">
              <div class="card-header">
                <div class="queue-number">#{{ queue.number }}</div>
                <span class="appointment-status" :class="queue.status.toLowerCase()">
                  {{ queue.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="appointment-details">
                  <div class="detail-item">
                    <i class="bi bi-building"></i>
                    <span>{{ queue.department }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-calendar3"></i>
                    <span>{{ formatDate(queue.created_at) }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="action-btn primary" @click="viewQueue(queue)">
                    <i class="bi bi-eye"></i>
                    View Details
                  </button>
                  <button
                    v-if="canCancelQueue(queue.status)"
                    class="action-btn danger"
                    @click="cancelQueue(queue.number)"
                  >
                    <i class="bi bi-x-circle"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="desktop-table-view">
            <div class="table-container">
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>Queue #</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="queue in priorityQueues" :key="queue.number">
                    <td data-label="Queue #">
                      <span class="queue-number-cell">#{{ queue.number }}</span>
                    </td>
                    <td data-label="Department">{{ queue.department }}</td>
                    <td data-label="Status">
                      <span class="appointment-status" :class="queue.status.toLowerCase()">
                        {{ queue.status }}
                      </span>
                    </td>
                    <td data-label="Date Created">{{ formatDate(queue.created_at) }}</td>
                    <td data-label="Actions">
                      <div class="table-actions">
                        <button class="action-btn primary" @click="viewQueue(queue)">
                          <i class="bi bi-eye"></i>
                          View
                        </button>
                        <button
                          v-if="canCancelQueue(queue.status)"
                          class="action-btn danger"
                          @click="cancelQueue(queue.number)"
                        >
                          <i class="bi bi-x-circle"></i>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Regular Queues Section -->
        <div class="appointments-section regular-section" v-if="regularQueues.length > 0">
          <div class="section-header">
            <h2 class="section-title">
              <i class="bi bi-list-ul"></i>
              Regular Queues
            </h2>
            <div class="section-badge regular-badge">{{ regularQueues.length }}</div>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-card-view">
            <div v-for="queue in regularQueues" :key="queue.number" class="appointment-card regular-card">
              <div class="card-header">
                <div class="queue-number">#{{ queue.number }}</div>
                <span class="appointment-status" :class="queue.status.toLowerCase()">
                  {{ queue.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="appointment-details">
                  <div class="detail-item">
                    <i class="bi bi-building"></i>
                    <span>{{ queue.department }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-calendar3"></i>
                    <span>{{ formatDate(queue.created_at) }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="action-btn primary" @click="viewQueue(queue)">
                    <i class="bi bi-eye"></i>
                    View Details
                  </button>
                  <button
                    v-if="canCancelQueue(queue.status)"
                    class="action-btn danger"
                    @click="cancelQueue(queue.number)"
                  >
                    <i class="bi bi-x-circle"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="desktop-table-view">
            <div class="table-container">
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>Queue #</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="queue in regularQueues" :key="queue.number">
                    <td data-label="Queue #">
                      <span class="queue-number-cell">#{{ queue.number }}</span>
                    </td>
                    <td data-label="Department">{{ queue.department }}</td>
                    <td data-label="Status">
                      <span class="appointment-status" :class="queue.status.toLowerCase()">
                        {{ queue.status }}
                      </span>
                    </td>
                    <td data-label="Date Created">{{ formatDate(queue.created_at) }}</td>
                    <td data-label="Actions">
                      <div class="table-actions">
                        <button class="action-btn primary" @click="viewQueue(queue)">
                          <i class="bi bi-eye"></i>
                          View
                        </button>
                        <button
                          v-if="canCancelQueue(queue.status)"
                          class="action-btn danger"
                          @click="cancelQueue(queue.number)"
                        >
                          <i class="bi bi-x-circle"></i>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Scheduled Appointments Section -->
        <div class="appointments-section scheduled-section" v-if="scheduledQueues.length > 0">
          <div class="section-header">
            <h2 class="section-title">
              <i class="bi bi-calendar-check"></i>
              Scheduled Appointments
            </h2>
            <div class="section-badge scheduled-badge">{{ scheduledQueues.length }}</div>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-card-view">
            <div v-for="queue in scheduledQueues" :key="queue.number" class="appointment-card scheduled-card">
              <div class="card-header">
                <div class="queue-number">#{{ queue.number }}</div>
                <span class="appointment-status" :class="queue.status.toLowerCase()">
                  {{ queue.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="appointment-details">
                  <div class="detail-item">
                    <i class="bi bi-building"></i>
                    <span>{{ queue.department }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-calendar3"></i>
                    <span>{{ formatDateOnly(queue.scheduled_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-clock"></i>
                    <span>{{ formatTimeOnly(queue.scheduled_date) }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="action-btn primary" @click="viewQueue(queue)">
                    <i class="bi bi-eye"></i>
                    View Details
                  </button>
                  <button
                    v-if="canCancelQueue(queue.status)"
                    class="action-btn danger"
                    @click="cancelQueue(queue.number)"
                  >
                    <i class="bi bi-x-circle"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="desktop-table-view">
            <div class="table-container">
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>Queue #</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="queue in scheduledQueues" :key="queue.number">
                    <td data-label="Queue #">
                      <span class="queue-number-cell">#{{ queue.number }}</span>
                    </td>
                    <td data-label="Date">{{ formatDateOnly(queue.scheduled_date) }}</td>
                    <td data-label="Time">{{ formatTimeOnly(queue.scheduled_date) }}</td>
                    <td data-label="Department">{{ queue.department }}</td>
                    <td data-label="Status">
                      <span class="appointment-status" :class="queue.status.toLowerCase()">
                        {{ queue.status }}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div class="table-actions">
                        <button class="action-btn primary" @click="viewQueue(queue)">
                          <i class="bi bi-eye"></i>
                          View
                        </button>
                        <button
                          v-if="canCancelQueue(queue.status)"
                          class="action-btn danger"
                          @click="cancelQueue(queue.number)"
                        >
                          <i class="bi bi-x-circle"></i>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="priorityQueues.length === 0 && regularQueues.length === 0 && scheduledQueues.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-calendar-x"></i>
          </div>
          <h3>No Appointments Found</h3>
          <p>You don't have any appointments or queues at the moment.</p>
          <button class="action-btn primary large" @click="navigateToBooking">
            <i class="bi bi-plus-circle"></i>
            Book New Appointment
          </button>
        </div>

      </div>
      <div v-else class="loading-state">
        <div class="loading-spinner">
          <i class="bi bi-arrow-clockwise"></i>
        </div>
        <p>Loading your appointments...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import UserNavbar from './UserNavbar.vue';
import UserTopNavbar from './UserTopNavbar.vue';

const API_BASE_URL = 'http://localhost:8080/flow-application-cc/api';

export default {
  name: 'UserMyAppointments',
  components: {
    UserNavbar,
    UserTopNavbar
  },  data() {
    return {
      queues: [],
      loading: true,
      error: null,
      success: null,
      isSidebarCollapsed: false,
      mobileSidebarOpen: false, // For mobile sidebar state
      userProfile: {
        name: 'User',
        email: '',
        avatar: null
      },
      showConfirmModal: false,
      queueToCancel: null,
      firstLoad: true
    }
  },
  computed: {
    priorityQueues() {
      return this.queues.filter(queue =>
        queue.priority && queue.priority.toLowerCase() === 'yes' && !queue.scheduled_time);
    },
    regularQueues() {
      return this.queues.filter(queue =>
        (!queue.priority || queue.priority.toLowerCase() === 'no') &&
        (!queue.scheduled_time || queue.scheduled_time === null || queue.scheduled_time === ''));
    },
    scheduledQueues() {
      return this.queues.filter(queue =>
        queue.scheduled_time && queue.scheduled_time !== null && queue.scheduled_time !== '');
    }
  },
  async created() {
    await this.fetchUserQueues();
  },
  methods: {    async fetchUserQueues() {
      try {
        const response = await axios.get(`${API_BASE_URL}/userappointments.php`, {
          withCredentials: true
        });
        this.queues = response.data;
        this.loading = false;
        
        // Only show success message on first load
        if (this.firstLoad) {
          this.success = 'Your appointments loaded successfully';
          setTimeout(() => {
            this.success = null;
          }, 3000);
          this.firstLoad = false;
        }
      } catch (err) {
        this.error = 'Failed to fetch appointments. Please try again later.';
        setTimeout(() => {
          this.error = null;
        }, 3000);
        this.loading = false;
        console.error('Error fetching queues:', err);
      }
    },

    canCancelQueue(status) {
      return ['pending', 'waiting'].includes(status.toLowerCase());
    },    cancelQueue(queueNumber) {
      this.queueToCancel = queueNumber;
      this.showConfirmModal = true;
    },
    
    cancelConfirmation() {
      this.showConfirmModal = false;
      this.queueToCancel = null;
    },
    
    async confirmCancellation() {
      if (!this.queueToCancel) return;
      
      try {
        // Call the API to cancel and archive the queue
        await axios.put(`${API_BASE_URL}/userappointments.php`, {
          queue_number: this.queueToCancel,
          action: 'cancel_and_archive'
        }, {
          withCredentials: true
        });

        // Remove the cancelled queue from the local queues array
        this.queues = this.queues.filter(queue => queue.number !== this.queueToCancel);
        
        // Show success alert
        this.success = 'Queue cancelled successfully';
        setTimeout(() => {
          this.success = null;
        }, 3000);
        
        // Reset confirmation modal state
        this.showConfirmModal = false;
        this.queueToCancel = null;

      } catch (err) {
        // Show error alert
        this.error = 'Failed to cancel queue';
        setTimeout(() => {
          this.error = null;
        }, 3000);
        console.error('Error cancelling queue:', err);
        
        // Close the modal but keep queue number in case they want to try again
        this.showConfirmModal = false;
      }
    },    viewQueue(queue) {
      if (!queue.serviceId || !queue.departmentId) {
        console.error('Service ID or Department ID is missing');
        this.error = 'Cannot view this queue: Required information is missing';
        setTimeout(() => {
          this.error = null;
        }, 3000);
        return;
      }

      // Determine queue type
      let queueType = 'regular';
      if (queue.priority && queue.priority.toLowerCase() === 'yes') {
        queueType = 'priority';
      } else if (queue.scheduled_time && queue.scheduled_time !== null && queue.scheduled_time !== '') {
        queueType = 'scheduled';
      }

      this.$router.push({
        name: 'UserBookAppointmentView',
        params: {
          serviceId: queue.serviceId.toString(),
          departmentId: queue.departmentId.toString()
        },
        query: {
          tab: queueType
        }
      });
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDateOnly(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatTimeOnly(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });    },
    navigateToBooking() {
      this.$router.push({ name: 'UserBook' });
    },
    handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed
      
      // On desktop, when collapsing sidebar, ensure mobile sidebar is closed
      if (window.innerWidth > 768) {
        this.mobileSidebarOpen = false
      }
    },
    handleMobileSidebarToggle(isOpen) {
      // Handle the mobile sidebar open/close state
      // Toggle if no value is provided
      if (isOpen === undefined) {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
      } else {
        this.mobileSidebarOpen = isOpen;
      }
    },
    handleSignOut() {
      // Clear user data and redirect to login
      localStorage.clear();
      this.$router.push('/login');
    }
  },
  mounted() {
    // Initialize sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = JSON.parse(savedState);
    }

    // Load user profile from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userProfile = {
        name: user.name || 'User',
        email: user.email || '',
        avatar: user.avatar || null
      };
    }
  }
}
</script>

<style>
@import '@/styles/mainpage-user/myappointments.css';
</style>
