<template>
  <div class="user-page-container" :class="{ 'user-sidebar-collapsed': isSidebarCollapsed }">
    <!-- Update TopNavbar -->
    <UserTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      @sidebar-toggle="handleSidebarToggle"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
    />
    <!-- Update Navbar -->
    <UserNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :sidebarOpen="mobileSidebarOpen"
      @update:sidebarOpen="handleMobileSidebarToggle" 
    />
    <main class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">
      <!-- Tab Navigation -->
      <div class="activity-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'archive' }]"
          @click="activeTab = 'archive'"
        >
          <i class="bi bi-archive"></i> Queue History
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'notifications' }]"
          @click="activeTab = 'notifications'"
        >
          <i class="bi bi-bell"></i> Notifications
        </button>
      </div>

      <!-- Archive Tab Content -->
      <div v-if="activeTab === 'archive'" class="activity-content">
        <div class="archive-header">
          <h2 class="activity-title">Queue History</h2>
          <button @click="refreshArchives" class="refresh-btn">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        
        <div class="activity-controls">
          <div class="activity-filters">
            <input                                                                    
              type="date" 
              v-model="dateFilter"
              :max="currentDate"
              placeholder="Filter by date"
            >
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search queue number or service..."
            >
            <select v-model="statusFilter" class="status-filter">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingArchives" class="loading-state">
          <i class="bi bi-hourglass-split spinning"></i>
          <span>Loading archived queues...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredArchives.length === 0" class="empty-state">
          <i class="bi bi-archive"></i>
          <h3>No Queues</h3>
          <p>Your completed and cancelled queues will appear here.</p>
        </div>

        <!-- Archived Queues Table -->
        <div v-else class="archive-table-container">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Queue Number</th>
                <th>Service</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Date Archived</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="archive in filteredArchives" :key="archive.id" class="archive-row">
                <td>
                  <span class="queue-number">{{ archive.queue_number }}</span>
                </td>
                <td>
                  <div class="service-info">
                    <strong>{{ archive.service_name || 'Unknown Service' }}</strong>
                    <small v-if="archive.service_location">{{ archive.service_location }}</small>
                  </div>
                </td>
                <td>
                  <span :class="'status-badge status-' + (archive.status || '').toLowerCase()">
                    {{ archive.status || 'Unknown' }}
                  </span>
                </td>
                <td>{{ formatDate(archive.created_at) }}</td>
                <td>{{ formatDate(archive.archived_at) }}</td>
                <td>
                  <span class="duration">{{ calculateDuration(archive.created_at, archive.archived_at) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreArchives" class="load-more-container">
          <button @click="loadMoreArchives" class="load-more-btn" :disabled="loadingMore">
            <i v-if="loadingMore" class="bi bi-hourglass-split spinning"></i>
            <i v-else class="bi bi-plus-circle"></i>
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>

      <!-- Notifications Tab Content -->
      <div v-if="activeTab === 'notifications'" class="activity-content">
        <UserNotification />
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import UserTopNavbar from './UserTopNavbar.vue'
import UserNavbar from './UserNavbar.vue'
import UserNotification from './UserNotification.vue'

export default {
  name: 'UserActivityLog',
  components: {
    UserTopNavbar,
    UserNavbar,
    UserNotification
  },
  data() {
    return {
      activeTab: 'archive',
      dateFilter: '',
      searchQuery: '',
      statusFilter: '',
      currentDate: new Date().toISOString().split('T')[0],
      archivedQueues: [],
      loadingArchives: false,
      loadingMore: false,
      hasMoreArchives: true,
      currentPage: 0,
      pageSize: 20,
      isSidebarCollapsed: false,
      mobileSidebarOpen: false, // For mobile sidebar state
      userProfile: {
        name: '',
        email: '',
        avatar: null
      }
    }
  },

  computed: {
    filteredArchives() {
      let filtered = this.archivedQueues;
      
      if (this.dateFilter) {
        const filterDate = new Date(this.dateFilter).setHours(0,0,0,0);
        filtered = filtered.filter(archive => {
          const archiveDate = new Date(archive.archived_at).setHours(0,0,0,0);
          return archiveDate === filterDate;
        });
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(archive => 
          archive.queue_number.toLowerCase().includes(query) ||
          (archive.service_name && archive.service_name.toLowerCase().includes(query))
        );
      }

      if (this.statusFilter) {
        filtered = filtered.filter(archive => 
          archive.status && archive.status.toLowerCase() === this.statusFilter.toLowerCase()
        );
      }
      
      return filtered;
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    calculateDuration(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMs = end - start;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    },

    async fetchArchivedQueues(loadMore = false) {
      try {
        if (!loadMore) {
          this.loadingArchives = true;
          this.currentPage = 0;
          this.archivedQueues = [];
        } else {
          this.loadingMore = true;
        }

        const offset = this.currentPage * this.pageSize;
        const response = await axios.get('https://flow-backend-yxdw.onrender.com/UserQueueArchive.php', {
          params: {
            limit: this.pageSize,
            offset: offset
          },
          withCredentials: true
        });

        const newArchives = response.data;
        
        if (loadMore) {
          this.archivedQueues = [...this.archivedQueues, ...newArchives];
        } else {
          this.archivedQueues = newArchives;
        }

        this.hasMoreArchives = newArchives.length === this.pageSize;
        this.currentPage++;

      } catch (error) {
        console.error('Error fetching archived queues:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.loadingArchives = false;
        this.loadingMore = false;
      }
    },

    async loadMoreArchives() {
      await this.fetchArchivedQueues(true);
    },

    async refreshArchives() {
      // First trigger auto-archive for any completed/cancelled queues
      try {
        await axios.get('https://flow-backend-yxdw.onrender.com/UserQueueArchive.php?action=auto-archive', {
          withCredentials: true
        });
      } catch (error) {
        console.error('Auto-archive error:', error);
      }
      
      // Then refresh the archived queues list
      await this.fetchArchivedQueues();
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
    },

    async fetchUserProfile() {
      try {
        const response = await axios.get('https://flow-backend-yxdw.onrender.com/user-profile.php', {
          withCredentials: true
        });
        if (response.data) {
          this.userProfile = {
            name: `${response.data.first_name} ${response.data.last_name}`.trim() || 'User',
            email: response.data.email,
            avatar: response.data.avatar
          };
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  },

  watch: {
    activeTab(newTab) {
      if (newTab === 'archive') {
        // Refresh archives when switching to archive tab
        this.refreshArchives();
      }
    }
  },

  async mounted() {
    await this.fetchUserProfile();
    await this.fetchArchivedQueues();

    // Initialize sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = JSON.parse(savedState);
    }

    // Auto-refresh every 10 seconds to catch newly archived items
    this.autoRefreshInterval = setInterval(() => {
      if (this.activeTab === 'archive') {
        this.refreshArchives();
      }
    }, 10000);
  },

  beforeUnmount() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/content.css';
@import '@/styles/mainpage-user/useractivitylog.css';
</style>
