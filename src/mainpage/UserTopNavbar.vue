<template>
  <div class="user-top-navbar">
    <!-- Top left section -->
    <div class="user-top-left">
      <button class="sidebar-collapse-btn" @click="toggleSidebar" :class="{ 'active': !isSidebarCollapsed }">
        <div class="hamburger-icon">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </div>
      </button>

      <div class="breadcrumb">
        <img src="@/images/logo.png" alt="Flow Logo" class="navbar-logo">
        <span class="brand-text">Flow</span>
      </div>
    </div>

    <div class="user-top-right">
      <div class="user-top-actions">
        <!-- Current time display -->
        <div class="current-time-display">
          <i class="bi bi-clock"></i>
          <span>{{ currentTime }}</span>
        </div>

        <!-- Notification Bell -->
        <div class="notification-bell-container">
          <button
            class="notification-bell"
            :class="{ 'dropdown-active': isNotificationDropdownOpen }"
            @click="toggleNotificationDropdown"
            @keydown.enter="toggleNotificationDropdown"
            @keydown.space="toggleNotificationDropdown"
            @keydown.escape="closeNotificationDropdown"
            @blur="handleNotificationBlur"
            aria-label="Notifications"
            :aria-expanded="isNotificationDropdownOpen ? 'true' : 'false'"
            aria-haspopup="true"
          >
            <i class="bi bi-bell"></i>
            <span v-if="unreadNotificationsCount > 0" class="notification-badge">
              {{ unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount }}
            </span>
          </button>

          <!-- Notification Dropdown Menu -->
          <div
            class="notification-dropdown"
            v-show="isNotificationDropdownOpen"
            @click.stop
          >
            <div class="notification-header">
              <h3>Notifications</h3>
              <button
                v-if="notifications.length > 0"
                class="mark-all-read"
                @click="markAllAsRead"
              >
                Mark all as read
              </button>
            </div>

            <div class="notification-list" v-if="notifications.length > 0">
              <div
                v-for="(notification, index) in notifications"
                :key="index"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
              >
                <div class="notification-icon">
                  <i :class="['bi', notification.iconClass || 'bi-info-circle']"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-text">{{ notification.text }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
                <button class="notification-read-btn" @click="markAsRead(index)" v-if="!notification.read">
                  <i class="bi bi-check2"></i>
                </button>
              </div>
            </div>

            <div class="notification-empty" v-else>
              <i class="bi bi-bell-slash"></i>
              <p>No notifications</p>
            </div>

            <div class="notification-footer" v-if="notifications.length > 0">
              <a href="#" @click.prevent="viewAllNotifications">View all notifications</a>
            </div>
          </div>
        </div>

        <!-- User menu -->
        <div
          class="user-user-menu"
          tabindex="0"
          :class="{ 'dropdown-active': isDropdownOpen }"
          @click="toggleDropdown"
          @keydown.enter="toggleDropdown"
          @keydown.space="toggleDropdown"
          @keydown.escape="closeDropdown"
          @blur="handleBlur"
        >
          <div class="user-avatar-container">
            <!-- Only show avatar if available and valid -->
            <img
              :src="avatarSrc"
              alt="Profile Picture Preview"
              @error="handleImageError"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </div>

          <span class="user-user-name">{{ userProfile ? userProfile.name : 'User' }}</span>
          <i class="bi bi-chevron-down"></i>

          <div class="user-user-dropdown" id="userDropdown">
            <a href="#" @click.prevent="goToProfile" tabindex="0">
              <i class="bi bi-person"></i> Profile
            </a>
            <a href="#" @click.prevent="goToActivityLog" tabindex="0">
              <i class="bi bi-clock-history"></i> Activity Log
            </a>
            <a href="#" @click.prevent="handleSignOut" tabindex="0">
              <i class="bi bi-box-arrow-right"></i> Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Sign Out Confirmation Modal -->
    <div class="signout-modal" v-if="showSignOutConfirm">
      <div class="signout-modal-content">
        <div class="signout-modal-header">
          <h4>Sign Out</h4>
          <button class="close-btn" @click="cancelSignOut">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="signout-modal-body">
          <p>Are you sure you want to sign out?</p>
        </div>
        <div class="signout-modal-footer">
          <button class="cancel-btn" @click="cancelSignOut">Cancel</button>
          <button class="confirm-btn" @click="confirmSignOut" :disabled="isLoggingOut">
            <i class="bi bi-arrow-clockwise spinning" v-if="isLoggingOut"></i>
            <span>{{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserTopNavbar',
  props: {
    isSidebarCollapsed: {
      type: Boolean,
      default: false
    },
    userProfile: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      pageTitle: 'Dashboard',
      isDropdownOpen: false,
      isNotificationDropdownOpen: false,
      closeTimeout: null,
      notificationCloseTimeout: null,
      imageError: false,
      // Change this to match the profile component
      defaultAvatar: require('@/images/default-avatar.svg'),
      currentTime: '',
      timeInterval: null,
      notifications: [],
      notificationPollingInterval: null,
      showSignOutConfirm: false,
      isLoggingOut: false,
      websocket: null
    }
  },
  computed: {
    // Check if we have a valid avatar to display
    hasValidAvatar() {
      return this.userProfile &&
             this.userProfile.avatar &&
             typeof this.userProfile.avatar === 'string' &&
             this.userProfile.avatar.length > 0 &&
             !this.imageError;
    },
    // Get the proper avatar source URL - updated to match profile logic
    avatarSrc() {
      if (!this.userProfile || !this.userProfile.avatar || this.imageError) {
        return this.defaultAvatar;
      }

      // For local development with XAMPP - match the profile component exactly
      return `https://flow-backend-yxdw.onrender.com${this.userProfile.avatar}`;
    },
    // Count unread notifications
    unreadNotificationsCount() {
      return this.notifications.filter(notification => !notification.read).length;
    }
  },
  methods: {
    // Keep all existing methods
    toggleSidebar() {
      // On mobile, we want to toggle the sidebar visibility, not collapse state
      if (window.innerWidth <= 768) {
        // For mobile, emit event to open/close the sidebar drawer
        this.$emit('mobile-sidebar-toggle', true);
      } else {
        // For desktop, toggle collapse state
        const newState = !this.isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', newState);
        this.$emit('sidebar-toggle', newState);
      }
    },
    goToProfile() {
      this.$router.push('/user/profile');
      this.closeDropdown();
    },
    goToAppointments() {
      this.$router.push('/user/my-appointments');
      this.closeDropdown();
    },
    handleSignOut() {
      this.showSignOutConfirm = true;
      this.closeDropdown();
    },
    cancelSignOut() {
      this.showSignOutConfirm = false;
    },
    async confirmSignOut() {
      if (this.isLoggingOut) return;

      this.isLoggingOut = true;
      try {
        const response = await axios.post('/api/flow-application-cc/api/logout.php', {}, {
          withCredentials: true
        });

        if (response.data.success) {
          localStorage.clear();
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        this.$router.push('/login');
      } finally {
        this.isLoggingOut = false;
        this.showSignOutConfirm = false;
      }
    },
    goToActivityLog() {
      this.$router.push('/user/activity-log');
      this.closeDropdown();
    },

    // Notification dropdown methods
    toggleNotificationDropdown(event) {
      if (event && event.type === 'keydown') {
        event.preventDefault();
      }
      this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;

      // Close other dropdowns if open
      if (this.isNotificationDropdownOpen && this.isDropdownOpen) {
        this.closeDropdown();
      }

      // Clear any existing timeout
      if (this.notificationCloseTimeout) {
        clearTimeout(this.notificationCloseTimeout);
        this.notificationCloseTimeout = null;
      }
    },

    closeNotificationDropdown() {
      this.isNotificationDropdownOpen = false;
      if (this.notificationCloseTimeout) {
        clearTimeout(this.notificationCloseTimeout);
        this.notificationCloseTimeout = null;
      }
    },

    handleNotificationBlur(event) {
      // Check if focus is moving outside the notification component
      const notificationContainer = event.currentTarget.closest('.notification-bell-container');
      if (notificationContainer && !notificationContainer.contains(event.relatedTarget)) {
        this.notificationCloseTimeout = setTimeout(() => {
          this.closeNotificationDropdown();
        }, 150);
      }
    },

    // Add new method to fetch notifications
    async fetchNotifications() {
      try {
        const response = await axios.get('/flow-application-cc/api/usernotification.php', {
          params: {
            limit: 5 // Only get latest 5 for dropdown
          },
          withCredentials: true
        });

        if (response.data.error) {
          console.error('Server error:', response.data.error);
          return;
        }

        this.notifications = response.data.notifications.map(notification => ({
          id: notification.id,
          text: notification.message,
          time: this.formatTimeAgo(notification.created_at),
          read: !!notification.read_at,
          type: notification.type,
          iconClass: this.getIconClass(notification.type)
        }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },

    // Add helper method to format time
    formatTimeAgo(date) {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    },

    // Update the getIconClass method to include 'queue_waiting'
    getIconClass(type) {
      const iconMap = {
        'queue_joined': 'bi-check-circle',
        'queue_position': 'bi-arrow-up-circle',
        'queue_waiting': 'bi-hourglass',
        'queue_next': 'bi-lightning',
        'queue_served': 'bi-bell',
        'queue_completed': 'bi-check2-circle',
        'queue_cancelled': 'bi-x-circle',
        'appointment_reminder': 'bi-calendar-check',
        'appointment_confirmed': 'bi-check-circle',
        'appointment_cancelled': 'bi-x-circle',
        'system_update': 'bi-gear',
        'info': 'bi-info-circle'
      };
      return iconMap[type] || 'bi-bell';
    },

    // Update markAsRead method to work with real data
    async markAsRead(index) {
      if (index >= 0 && index < this.notifications.length) {
        const notification = this.notifications[index];

        try {
          await axios.put('/flow-application-cc/api/usernotification.php', {
            notification_id: notification.id
          }, {
            withCredentials: true
          });

          // Update local state
          this.notifications[index].read = true;
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    },

    // Update markAllAsRead method
    async markAllAsRead() {
      try {
        await axios.put('/flow-application-cc/api/usernotification.php', {
          markAllAsRead: true
        }, {
          withCredentials: true
        });

        // Update local state
        this.notifications.forEach(notification => {
          notification.read = true;
        });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },

    viewAllNotifications() {
      // Navigate to user profile with notifications tab active
      this.$router.push({
        path: '/user/profile',
        query: { tab: 'notifications' }
      });
      this.closeNotificationDropdown();
    },

    // User dropdown methods
    toggleDropdown(event) {
      if (event.type === 'keydown') {
        event.preventDefault();
      }
      this.isDropdownOpen = !this.isDropdownOpen;

      // Close the other dropdown if open
      if (this.isDropdownOpen && this.isNotificationDropdownOpen) {
        this.closeNotificationDropdown();
      }
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    handleBlur(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.closeTimeout = setTimeout(() => {
          this.closeDropdown();
        }, 100);
      }
    },
    validateImageUrl(url) {
      if (!url) return this.defaultAvatar;

      // Handle common URL issues
      if (url === 'null' || url === 'undefined') return this.defaultAvatar;

      // Format URL correctly
      if (!/^(https?:)?\/\//i.test(url)) {
        // If it starts with slash, it's an absolute path
        if (url.startsWith('/')) {
          return url;
        }
        // Otherwise, make it relative to server root
        return '/' + url;
      }
      return url;
    },
    handleImageError() {
      console.log('Avatar image failed to load:', this.userProfile?.avatar);
      this.imageError = true;
    },

    // Method to update current time
    updateCurrentTime() {
      const now = new Date();

      // Format time to HH:MM:SS AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      this.currentTime = `${hours}:${minutes}:${seconds} ${ampm}`;
    },

    // Handle click outside to close dropdown
    handleClickOutside(event) {
      const notificationContainer = document.querySelector('.notification-bell-container');
      if (notificationContainer && !notificationContainer.contains(event.target)) {
        this.closeNotificationDropdown();
      }
    },

    initializeWebSocket() {
      this.websocket = new WebSocket('ws://localhost:8080/notifications');
      
      this.websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
              this.fetchNotifications();
          }
      };

      this.websocket.onclose = () => {
          // Reconnect after 5 seconds
          setTimeout(() => this.initializeWebSocket(), 5000);
      };
    }
  },
  mounted() {
    // Log initial profile for debugging
    console.log('Initial profile:', this.userProfile);
    this.pageTitle = this.$route.name || 'Dashboard';

    // Set initial time
    this.updateCurrentTime();

    // Update time every second
    this.timeInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    // Add click outside handler for notification dropdown
    document.addEventListener('click', this.handleClickOutside);

    // Fetch notifications on mount
    this.fetchNotifications();

    // Poll for new notifications every 30 seconds
    this.notificationPollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  },
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    // Remove click outside handler
    document.removeEventListener('click', this.handleClickOutside);

    // Clear any pending timeouts
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    if (this.notificationCloseTimeout) {
      clearTimeout(this.notificationCloseTimeout);
    }

    // Clear notification polling interval
    if (this.notificationPollingInterval) {
      clearInterval(this.notificationPollingInterval);
    }
  },
  watch: {
    userProfile: {
      handler(newProfile) {
        // Reset image error when profile changes
        this.imageError = false;
        console.log('Profile updated:', newProfile);
      },
      deep: true
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/usertopnavbar.css';
</style>
