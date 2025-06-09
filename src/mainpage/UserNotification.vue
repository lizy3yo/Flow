<template>
  <div class="user-notifications-container">
    <div class="notifications-header">
      <h2>My Notifications</h2>
      <div class="actions">
        <button @click="markAllAsRead" v-if="hasUnreadNotifications" class="mark-all-btn">
          Mark all as read
        </button>
        <button @click="refreshNotifications" class="refresh-btn">
          <span class="refresh-icon">🔄</span> Refresh
        </button>
      </div>
    </div>

    <!-- Active Queues Section -->
    <div class="active-queues-section" v-if="activeQueues.length">
      <h3>Your Active Queues</h3>
      <div class="active-queues-list">
        <div 
          v-for="queue in activeQueues" 
          :key="queue.id"
          :class="['active-queue-item', queue.status]"
        >
          <div class="queue-info">
            <div class="queue-number">{{ queue.queue_number }}</div>
            <div class="service-name">{{ queue.service_name }}</div>
            <div class="queue-status">
              <span :class="['status-badge', queue.status]">
                {{ formatStatus(queue.status) }}
              </span>
            </div>
          </div>
          <div class="position-info" v-if="queue.status === 'pending'">
            <div class="position">Position: #{{ queue.position }}</div>
            <div class="estimated-wait">Est. wait: {{ queue.estimated_wait }} min</div>
          </div>
          <div class="serving-info" v-else-if="queue.status === 'serving'">
            <div class="serving-notice">🔥 You're being served now!</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-list" v-if="notifications.length">
      <h3>Recent Notifications</h3>
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-item', { unread: !notification.read_at }, notification.type]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <div class="notification-type">{{ formatNotificationType(notification.type) }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-meta">
            <span v-if="notification.queue_number" class="queue-ref">
              Queue: {{ notification.queue_number }}
            </span>
            <span v-if="notification.service_name" class="service-ref">
              Service: {{ notification.service_name }}
            </span>
            <span class="notification-time">
              {{ formatDate(notification.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="pagination-btn"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="no-notifications">
      <div class="no-notifications-icon">🔔</div>
      <div>No notifications yet</div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      Loading notifications...
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserNotification',
  data() {
    return {
      notifications: [], // Will store transformed notifications
      activeQueues: [],
      currentPage: 1,
      totalPages: 1,
      unreadCount: 0,
      loading: false,
      refreshInterval: null
    };
  },
  computed: {
    hasUnreadNotifications() {
      return this.unreadCount > 0;
    }
  },
  methods: {
    // Transform backend notification to frontend format
    transformNotification(notification) {
      const iconMap = {
        'queue_joined': '✅',
        'queue_position': '⏰',
        'queue_next': '⚡',
        'queue_served': '🔥',
        'queue_completed': '✅',
        'queue_cancelled': '❌',
        'appointment_reminder': '📅',
        'wait_time': '⏰',
        'service_status': '🔔'
      };

      return {
        id: notification.id,
        text: notification.message,
        time: this.formatDate(notification.created_at),
        read: notification.read_at !== null,
        type: notification.type,
        iconClass: this.getIconClass(notification.type),
        icon: iconMap[notification.type] || '🔔'
      };
    },

    async fetchNotifications() {
      try {
        this.loading = true;
        const response = await axios.get('/flow-application-cc/api/usernotification.php', {
          params: {
            page: this.currentPage,
            limit: 10
          },
          withCredentials: true
        });

        if (response.data.error) {
          console.error('Server error:', response.data.error);
          return;
        }

        // Match the structure from the API response
        this.notifications = response.data.notifications;
        this.totalPages = response.data.totalPages || 1;
        this.unreadCount = response.data.unreadCount || 0;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(notificationId) {
      try {
        await axios.put('/flow-application-cc/api/usernotification.php', {
          notification_id: notificationId
        }, {
          withCredentials: true
        });
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read_at) {
          notification.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    async markAllAsRead() {
      try {
        await axios.put('/flow-application-cc/api/usernotification.php', {
          markAllAsRead: true
        }, {
          withCredentials: true
        });
        
        // Update local state
        this.notifications.forEach(n => {
          if (!n.read_at) {
            n.read_at = new Date().toISOString();
          }
        });
        this.unreadCount = 0;
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },

    // Update the getNotificationIcon method to include 'queue_waiting'
    getNotificationIcon(type) {
      const icons = {
        'queue_joined': '✅',
        'queue_position': '⏰',
        'queue_next': '⚡',
        'queue_served': '🔥',
        'queue_completed': '✅',
        'queue_cancelled': '❌',
        'queue_waiting': '⏳',
        'appointment_reminder': '📅',
        'wait_time': '⏰'
      };
      return icons[type] || '🔔';
    },

    formatNotificationType(type) {
      const types = {
        'queue_joined': 'Queue Joined',
        'queue_position': 'Position Update',
        'queue_next': "You're Next",
        'queue_served': 'Now Serving',
        'queue_completed': 'Completed',
        'queue_cancelled': 'Cancelled',
        'queue_waiting': 'Now Waiting',
        'appointment_reminder': 'Appointment Reminder',
        'wait_time': 'Wait Time Update'
      };
      return types[type] || type;
    },

    formatStatus(status) {
      const statuses = {
        'pending': 'Waiting',
        'serving': 'Being Served',
        'completed': 'Completed'
      };
      return statuses[status] || status;
    },

    formatDate(date) {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return notificationDate.toLocaleDateString();
    },

    async changePage(page) {
      this.currentPage = page;
      await this.fetchNotifications();
    },

    refreshNotifications() {
      this.fetchNotifications();
    }
  },
  created() {
    this.fetchNotifications();
    // Refresh notifications every 30 seconds
    this.refreshInterval = setInterval(this.fetchNotifications, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
</script>

<style scoped>
@import '@/styles/mainpage-user/usernotification.css';
</style>
