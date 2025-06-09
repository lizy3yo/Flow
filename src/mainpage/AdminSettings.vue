<template>
  <div class="page-container">    <AdminTopNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      :status="adminStatus"
      @sidebar-toggle="toggleSidebar"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
      @status-change="handleStatusChange"
    />
    
    <AdminNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="toggleSidebar"
      ref="adminNavbar"
    />
    
    <div class="content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-description">Manage your archive and notification preferences</p>
      </div>

      <!-- Tab Navigation -->
      <div class="settings-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'archive' }]"
          @click="activeTab = 'archive'"
        >
          <i class="bi bi-archive"></i>
          <span class="tab-text">Archive</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'notifications' }]"
          @click="activeTab = 'notifications'"
        >
          <i class="bi bi-bell"></i>
          <span class="tab-text">Notifications</span>
        </button>
      </div>      <!-- Archive Tab Content -->
      <div v-if="activeTab === 'archive'" class="settings-content">
        <div class="content-header">
          <h2 class="content-title">Archive Management</h2>
          <p class="content-subtitle">Restore or permanently delete archived items</p>
        </div>
        
        <!-- Archive Controls -->
        <div class="archive-controls">
          <div class="control-group">
            <label class="control-label">Archive Type</label>
            <select v-model="archiveType" class="control-select">
              <option value="services">Archived Services</option>
              <option value="queues">Archived Queues</option>
            </select>
          </div>
          
          <div class="archive-filters">
            <div class="filter-group">
              <label class="filter-label">Filter by Date</label>
              <input 
                type="date" 
                v-model="dateFilter"
                :max="currentDate"
                class="filter-input"
              >
            </div>
            <div class="filter-group">
              <label class="filter-label">Search</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery"
                  placeholder="Search archives..."
                  class="filter-input search-input"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="(archiveType === 'services' && filteredServices.length === 0) || 
                   (archiveType === 'queues' && filteredQueues.length === 0)" 
             class="empty-state">
          <i class="bi bi-archive empty-icon"></i>
          <h3 class="empty-title">No archived items found</h3>
          <p class="empty-description">
            {{ searchQuery || dateFilter ? 'Try adjusting your filters' : 'No items have been archived yet' }}
          </p>
        </div>

        <!-- Services Archive Table -->
        <div v-else-if="archiveType === 'services'" class="table-container">
          <div class="table-wrapper">
            <table class="archive-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th class="date-column">Archived Date</th>
                  <th class="actions-column">Actions</th>
                </tr>
              </thead>              <tbody>
                <tr v-for="service in filteredServices" :key="service.id" class="table-row">
                  <td class="service-name" data-label="Service">
                    <div class="service-info">
                      <span class="service-title">{{ service.name }}</span>
                    </div>
                  </td>
                  <td class="date-column" data-label="Archived Date">
                    <span class="date-text">{{ formatDate(service.archived_at) }}</span>
                  </td>
                  <td class="actions-column" data-label="Actions">
                    <div class="action-buttons">                      <button @click="restoreService(service.id)" class="btn restore-btn" title="Restore Service">
                        <i class="bi bi-arrow-clockwise"></i>
                        <span class="archive-btn-text">Restore</span>
                      </button>
                      <button @click="confirmDelete(service.id, 'service')" class="btn delete-btn" title="Delete Permanently">
                        <i class="bi bi-trash"></i>
                        <span class="archive-btn-text">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Queues Archive Table -->
        <div v-else class="table-container">
          <div class="table-wrapper">
            <table class="archive-table">
              <thead>
                <tr>
                  <th>Queue Info</th>
                  <th class="status-column">Status</th>
                  <th class="date-column">Archived Date</th>
                  <th class="actions-column">Actions</th>
                </tr>
              </thead>              <tbody>
                <tr v-for="queue in filteredQueues" :key="queue.id" class="table-row">                  <td class="queue-info" data-label="Queue Info">
                    <div class="queue-details">
                      <span class="archive-queue-number">{{ queue.queue_number }}</span>
                      <span class="service-name">{{ queue.service_name }}</span>
                      <!-- Add user name display -->
                      <span class="user-name">{{ queue.user_first_name }} {{ queue.user_last_name }}</span>
                    </div>
                  </td>
                  <td class="status-column" data-label="Status">
                    <span class="status-badge" :class="queue.status.toLowerCase()">
                      {{ queue.status }}
                    </span>
                  </td>
                  <td class="date-column" data-label="Archived Date">
                    <span class="date-text">{{ formatDate(queue.archived_at) }}</span>
                  </td>
                  <td class="actions-column" data-label="Actions">
                    <div class="action-buttons">                      <button @click="restoreQueue(queue.id)" class="btn restore-btn" title="Restore Queue">
                        <i class="bi bi-arrow-clockwise"></i>
                        <span class="archive-btn-text">Restore</span>
                      </button>
                      <button @click="confirmDelete(queue.id, 'queue')" class="btn delete-btn" title="Delete Permanently">
                        <i class="bi bi-trash"></i>
                        <span class="archive-btn-text">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>        <!-- Confirmation Modal -->
        <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <i class="bi bi-exclamation-triangle modal-icon"></i>
              <h3 class="modal-title">Confirm Permanent Deletion</h3>
            </div>
            <div class="modal-body">
              <p class="modal-description">
                Are you sure you want to permanently delete this {{ deleteType }}? 
                This action cannot be undone and all associated data will be lost.
              </p>
            </div>
            <div class="modal-actions">
              <button @click="showConfirmModal = false" class="btn cancel-btn">
                <i class="bi bi-x"></i>
                Cancel
              </button>
              <button @click="executeDelete" class="btn confirm-delete-btn">
                <i class="bi bi-trash"></i>
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>

        <!-- Restore Confirmation Modal -->
        <div v-if="showRestoreConfirmModal" class="modal-overlay" @click="showRestoreConfirmModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <i class="bi bi-arrow-clockwise modal-icon restore-icon"></i>
              <h3 class="modal-title">Confirm Restore</h3>
            </div>
            <div class="modal-body">
              <p class="modal-description">
                Are you sure you want to restore this {{ restoreType }}? 
                It will be moved back to the active {{ restoreType === 'service' ? 'services' : 'queue' }} list.
              </p>
            </div>
            <div class="modal-actions">
              <button @click="showRestoreConfirmModal = false" class="btn cancel-btn">
                <i class="bi bi-x"></i>
                Cancel
              </button>
              <button @click="executeRestore" class="btn confirm-restore-btn">
                <i class="bi bi-arrow-clockwise"></i>
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      </div>      <!-- Notifications Tab Content -->
      <div v-if="activeTab === 'notifications'" class="settings-content">
        <div class="content-header">
          <h2 class="content-title">Notification Settings</h2>
          <p class="content-subtitle">Configure how you receive alerts and updates</p>
        </div>
          <!-- Notifications Component Container -->
        <div class="notifications-section">
          <AdminNotifications />
        </div>
      </div>
    </div>

    <!-- Success Alert -->
    <div v-if="success" class="admin-service-alert-container">
      <div class="admin-service-alert admin-service-alert-success">
        <i class="bi bi-check-circle"></i>
        {{ success }}
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="admin-service-alert-container">
      <div class="admin-service-alert admin-service-alert-danger">
        <i class="bi bi-exclamation-circle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import AdminTopNavbar from './AdminTopNavbar.vue'
import AdminNotifications from './AdminNotifications.vue'
import axios from 'axios'

export default {
  name: 'AdminSettings',
  components: {
    AdminNavbar,
    AdminTopNavbar,
    AdminNotifications
  },
  data() {
    return {
      isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      userProfile: null,
      adminStatus: 'active',
      archiveType: 'services',
      archivedServices: [],
      archivedQueues: [],
      dateFilter: '',
      searchQuery: '',      showConfirmModal: false,
      showRestoreConfirmModal: false,
      itemToDelete: null,
      itemToRestore: null,
      deleteType: null,
      restoreType: null,
      currentDate: new Date().toISOString().split('T')[0],
      activeTab: 'archive',  // Changed default tab to archive
      notificationSettings: {
        email: true,
        system: true,
        queueUpdates: true
      },
      // Alert system
      success: null,
      error: null
    }
  },
  computed: {
    filteredServices() {
      let filtered = this.archivedServices;
      
      if (this.dateFilter) {
        const filterDate = new Date(this.dateFilter).setHours(0,0,0,0);
        filtered = filtered.filter(service => {
          const serviceDate = new Date(service.archived_at).setHours(0,0,0,0);
          return serviceDate === filterDate;
        });
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(service => 
          service.name.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },

    filteredQueues() {
      let filtered = this.archivedQueues;
      
      if (this.dateFilter) {
        const filterDate = new Date(this.dateFilter).setHours(0,0,0,0);
        filtered = filtered.filter(queue => {
          const queueDate = new Date(queue.archived_at).setHours(0,0,0,0);
          return queueDate === filterDate;
        });
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(queue => 
          queue.queue_number.toLowerCase().includes(query) ||
          queue.service_name.toLowerCase().includes(query) ||
          `${queue.user_first_name} ${queue.user_last_name}`.toLowerCase().includes(query)  // Add this line
        );
      }
      
      return filtered;
    }
  },
  async mounted() {
    await this.fetchUserProfile()
    await this.fetchAdminStatus()
    this.fetchArchives()
    
    // Check for tab query parameter
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab;
    }
  },
  methods: {
    navigateToArchives() {
      this.$router.push('/admin/archive')
    },
      toggleSidebar(value) {
      const newState = value !== undefined ? value : !this.isSidebarCollapsed
      this.isSidebarCollapsed = newState
      localStorage.setItem('sidebarCollapsed', newState)
    },

    handleMobileSidebarToggle() {
      // Delegate mobile sidebar toggle to AdminNavbar component
      this.$refs.adminNavbar?.toggleSidebar();
    },
    
    async fetchUserProfile() {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          this.userProfile = JSON.parse(userData)
          return
        }
        
        const admin = localStorage.getItem('admin')
        if (!admin) {
          this.$router.push('/admin/login')
          return
        }

        const response = await axios.get('/flow-application-cc/api/adminprofile.php', {
          withCredentials: true
        })

        if (response.data) {
          this.userProfile = {
            name: response.data.name || 'Unknown User',
            email: response.data.email || '',
            role: 'Administrator',
            avatar: response.data.avatar || null
          }
          localStorage.setItem('userData', JSON.stringify(this.userProfile))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('admin')
          this.$router.push('/admin/login')
        }
      }
    },
    
    async handleSignOut() {
      try {
        const response = await axios.post('/flow-application-cc/api/logout.php', {}, {
          withCredentials: true
        })
        
        if (response.data.success) {
          localStorage.clear()
          this.$router.push('/admin/login')
        }
      } catch (error) {
        console.error('Logout error:', error)
        localStorage.clear()
        this.$router.push('/admin/login')
      }
    },
    
    async fetchAdminStatus() {
      try {
        const response = await axios.get('/flow-application-cc/api/adminprofile.php', {
          withCredentials: true
        })
        
        if (response.data) {
          this.adminStatus = response.data.queue_status || 'active'
        }
      } catch (error) {
        console.error('Error fetching admin status:', error)
      }
    },
    
    handleStatusChange(newStatus) {
      this.adminStatus = newStatus
      axios.put('/flow-application-cc/api/adminprofile.php', {
        queue_status: newStatus,
        action: 'update_status_only'
      }, { withCredentials: true })
      .then(response => {
        console.log('Status updated successfully:', response.data)
      })
      .catch(error => {
        console.error('Failed to update status:', error)
      })
    },
    
    async fetchArchives() {
      try {
        const response = await axios.get(`/flow-application-cc/api/AdminArchive.php?type=${this.archiveType}`, {
          withCredentials: true
        });
        
        if (response.data) {
          if (this.archiveType === 'services') {
            this.archivedServices = response.data;
          } else {
            this.archivedQueues = response.data;
          }
        }
        console.log('Fetched archives:', response.data); // Add this for debugging
      } catch (error) {
        console.error('Error fetching archives:', error)
      }
    },    async restoreService(id) {
      this.confirmRestore(id, 'service')
    },

    async restoreQueue(id) {
      this.confirmRestore(id, 'queue')
    },

    confirmRestore(id, type) {
      this.itemToRestore = id
      this.restoreType = type
      this.showRestoreConfirmModal = true
    },

    async executeRestore() {
      try {
        const response = await axios.post('/flow-application-cc/api/AdminArchive.php', {
          action: 'restore',
          type: this.restoreType,
          id: this.itemToRestore
        }, {
          withCredentials: true
        });        if (response.data.success) {
          this.success = `${this.restoreType.charAt(0).toUpperCase() + this.restoreType.slice(1)} restored successfully`;
          setTimeout(() => {
            this.success = null;
          }, 3000);
          this.showRestoreConfirmModal = false;
          await this.fetchArchives();
        } else {
          throw new Error('Failed to restore item');
        }
      } catch (error) {
        console.error('Error restoring item:', error);
        this.error = `Failed to restore ${this.restoreType}. Please try again.`;
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    },

    confirmDelete(id, type) {
      this.itemToDelete = id
      this.deleteType = type
      this.showConfirmModal = true
    },

    async executeDelete() {
      try {
        const response = await axios.post('/flow-application-cc/api/AdminArchive.php', {
          action: 'delete',
          type: this.deleteType,
          id: this.itemToDelete
        }, {
          withCredentials: true
        });        if (response.data.success) {
          this.success = `${this.deleteType.charAt(0).toUpperCase() + this.deleteType.slice(1)} deleted successfully`;
          setTimeout(() => {
            this.success = null;
          }, 3000);
          this.showConfirmModal = false;
          await this.fetchArchives();
        } else {
          throw new Error('Delete operation failed');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        this.error = `Failed to delete ${this.deleteType}. Please try again.`;
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async saveNotificationSettings() {
      try {
        const response = await axios.post('/flow-application-cc/api/AdminSettings.php', {
          action: 'update_notifications',
          settings: this.notificationSettings
        }, {
          withCredentials: true
        });        if (response.data.success) {
          this.success = 'Notification settings saved successfully';
          setTimeout(() => {
            this.success = null;
          }, 3000);
        }
      } catch (error) {
        console.error('Error saving notification settings:', error);
        this.error = 'Failed to save notification settings';
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    }
  },

  watch: {
    archiveType: {
      handler() {
        this.fetchArchives();
      },
      immediate: true
    },
    
    'notificationSettings': {
      handler() {  // Remove newSettings parameter
        this.saveNotificationSettings();
      },
      deep: true
    }
  }
}
</script>

<style>
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/settings.css';
</style>