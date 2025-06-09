<template>  <div class="notifications-container">
    <div class="notifications-header">
      <h2>Notifications</h2>
      <div class="notifications-info">
        <span class="page-info">Showing 5 notifications per page</span>
      </div>
      <div class="actions">
        <button @click="markAllAsRead" v-if="hasUnreadNotifications">
          Mark all as read
        </button>
        <button @click="refreshNotifications">
          Refresh
        </button>
      </div>
    </div>    <div class="notifications-list" v-if="!loading && notifications.length && !isChangingPage">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-item', { unread: !notification.read_at }]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-type">{{ notification.type }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">
            {{ formatDate(notification.created_at) }}
          </div>
        </div>
      </div>      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          :disabled="currentPage === 1 || isChangingPage"
          @click="changePage(currentPage - 1)"
          class="pagination-btn"
        >
          <i class="bi bi-chevron-left"></i>
          Previous
        </button>
        <div class="pagination-info">
          <span class="page-text">Page {{ currentPage }} of {{ totalPages }}</span>
          <span class="total-text">(Total: {{ totalNotifications }} notifications)</span>
        </div>
        <button 
          :disabled="currentPage === totalPages || isChangingPage"
          @click="changePage(currentPage + 1)"
          class="pagination-btn"
        >
          Next
          <i class="bi bi-chevron-right"></i>
        </button>      </div>
    </div>

    <div v-else-if="loading && !isChangingPage" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading notifications...</p>
    </div>

    <div v-else class="no-notifications">
      <div class="empty-state">
        <i class="bi bi-bell-slash empty-icon"></i>
        <h3 class="empty-title">No notifications yet</h3>
        <p class="empty-description">
          You'll see important updates and alerts here when they arrive.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminNotifications',  data() {
    return {
      notifications: [],
      currentPage: 1,
      totalPages: 1,
      totalNotifications: 0,
      loading: false,
      isChangingPage: false,
      unreadCount: 0  // Add this missing property
    };
  },
  computed: {
    hasUnreadNotifications() {
      return this.notifications.some(n => !n.read_at);
    }
  },
  methods: {
    async fetchNotifications() {
      try {
        if (!this.isChangingPage) {
          this.loading = true;
        }

        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        // Add page and limit as query parameters
        const response = await axios.get(`https://flow-backend-yxdw.onrender.com/AdminNotifications.php`, {
          params: {
            page: this.currentPage,
            limit: 5  // Match the limit shown in your template
          },
          headers: headers,
          withCredentials: true
        });
        
        if (response.data.error) {
          console.error('Server error:', response.data.error);
          return;
        }

        this.notifications = response.data.notifications;
        this.totalPages = response.data.totalPages;
        this.totalNotifications = response.data.totalCount || 0;
        this.unreadCount = response.data.unread;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        if (error.response?.status === 401) {
          this.$router.push('/admin/login');
        }
      } finally {
        this.loading = false;
        this.isChangingPage = false;
      }
    },

    async markAsRead(notificationId) {
      try {
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        await axios.put('https://flow-backend-yxdw.onrender.com/AdminNotifications.php', {
          notification_id: notificationId
        }, {
          headers: headers, // Add this line
          withCredentials: true
        });
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read_at = new Date().toISOString();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    async markAllAsRead() {
      try {
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        await axios.put('https://flow-backend-yxdw.onrender.com/AdminNotifications.php', {
          markAllAsRead: true
        }, {
          headers: headers, // Add this line
          withCredentials: true
        });
        
        // Update local state
        this.notifications.forEach(n => {
          if (!n.read_at) {
            n.read_at = new Date().toISOString();
          }
        });
        
        // Reset unread count to 0
        this.unreadCount = 0;
        
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },    async changePage(page) {
      // Save current scroll position
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Set changing page flag to prevent UI flicker
      this.isChangingPage = true;
      this.currentPage = page;
      
      await this.fetchNotifications();
      
      // Restore scroll position immediately after data is loaded
      this.$nextTick(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
        // Fallback for older browsers
        document.documentElement.scrollTop = scrollPosition;
        document.body.scrollTop = scrollPosition;
      });
    },

    refreshNotifications() {
      this.fetchNotifications();
    }
  },
  created() {
    this.fetchNotifications();
    // Poll for new notifications every minute
    setInterval(this.fetchNotifications, 60000);
  }
};
</script>

<style scoped>
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/notifications.css';
</style>