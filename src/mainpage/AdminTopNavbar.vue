<template>
  <div class="admin-top-navbar">
    <!-- Top left section unchanged -->
    <div class="admin-top-left">
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

    <div class="admin-top-right">
      <div class="admin-top-actions">
        <!-- Current time display -->
        <div class="current-time-display">
          <i class="bi bi-clock"></i>
          <span>{{ currentTime }}</span>
        </div>

        <!-- Status toggle component with dropdown -->
        <div class="status-toggle-container">
          <button
            class="status-toggle"
            :class="[statusClass, { 'dropdown-active': isStatusDropdownOpen }]"
            @click="toggleStatusDropdown"
            @keydown.enter="toggleStatusDropdown"
            @keydown.space="toggleStatusDropdown"
            @keydown.escape="closeStatusDropdown"
            @blur="handleStatusBlur"
            aria-label="Change status"
            :aria-expanded="isStatusDropdownOpen ? 'true' : 'false'"
            aria-haspopup="true"
          >
            <span class="status-toggle-indicator"></span>
            <span class="status-toggle-text">{{ statusText }}</span>
            <i class="bi bi-chevron-down status-toggle-arrow" :class="{ 'rotated': isStatusDropdownOpen }"></i>
          </button>

          <!-- Status Dropdown Menu -->
          <div
            class="status-dropdown"
            v-show="isStatusDropdownOpen"
            @click.stop
          >
            <button
              class="status-dropdown-item"
              :class="{ 'active': status === 'active' }"
              @click="setStatus('active')"
              tabindex="0"
            >
              <span class="status-dropdown-indicator status-indicator-active"></span>
              <span class="status-dropdown-text">Active</span>
              <i v-if="status === 'active'" class="bi bi-check status-dropdown-check"></i>
            </button>

            <button
              class="status-dropdown-item"
              :class="{ 'active': status === 'inactive' }"
              @click="setStatus('inactive')"
              tabindex="0"
            >
              <span class="status-dropdown-indicator status-indicator-inactive"></span>
              <span class="status-dropdown-text">Inactive</span>
              <i v-if="status === 'inactive'" class="bi bi-check status-dropdown-check"></i>
            </button>

           
          </div>
        </div>

        <!-- Notification Bell - ADD THIS NEW SECTION -->
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
          class="admin-user-menu"
          tabindex="0"
          :class="{ 'dropdown-active': isDropdownOpen }"
          @click="toggleDropdown"
          @keydown.enter="toggleDropdown"
          @keydown.space="toggleDropdown"
          @keydown.escape="closeDropdown"
          @blur="handleBlur"
        >
          <div class="admin-avatar-container">
            <!-- Only show avatar if available and valid -->
            <img
              :src="avatarSrc"
              alt="Profile Picture Preview"
              @error="handleImageError"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </div>

          <span class="admin-user-name">{{ userProfile ? userProfile.name : 'Admin' }}</span>
          <i class="bi bi-chevron-down"></i>          <div class="admin-user-dropdown" id="userDropdown">
            <a href="#" @click.prevent="goToProfile" tabindex="0">
              <i class="bi bi-person"></i> Profile
            </a>
            <a href="#" @click.prevent="goToSettings" tabindex="0">
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
  name: 'AdminTopNavbar',
  props: {
    isSidebarCollapsed: {
      type: Boolean,
      default: false
    },
    userProfile: {
      type: Object,
      default: () => null
    },
    // Updated prop for status (supports 'active', 'inactive', 'maintenance')
    status: {
      type: String,
      default: 'active',
      validator: (value) => ['active', 'inactive', 'maintenance'].includes(value)
    }
  },
  data() {
    return {
      pageTitle: 'Dashboard',
      isDropdownOpen: false,
      isStatusDropdownOpen: false,
      isNotificationDropdownOpen: false,
      closeTimeout: null,
      statusCloseTimeout: null,
      notificationCloseTimeout: null,
      imageError: false,
       defaultAvatar: require('@/images/default-avatar.svg'),
      currentTime: '',
      timeInterval: null,      notifications: [], // Remove mock data - start with empty array
      notificationPollingInterval: null,
      showSignOutConfirm: false, // Control sign out confirmation modal
      isLoggingOut: false, // Control spinner in sign out button
      isMobile: false // Track mobile state for proper sidebar toggle handling
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
    // Get the proper avatar source URL
    avatarSrc() {
      if (!this.userProfile || !this.userProfile.avatar) {
        return this.defaultAvatar;
      }
      
      // For local development with XAMPP
      if (this.userProfile.avatar.startsWith('/')) {
        return `https://flow-backend-yxdw.onrender.com${this.userProfile.avatar}`;
      }
      
      return this.userProfile.avatar;
    },
    // Get the CSS class for the current status
    statusClass() {
      const className = `status-toggle-${this.status}`;
      console.log('AdminTopNavbar: Computing statusClass:', className, 'for status:', this.status);
      return className;
    },
    // Get the display text for the current status
    statusText() {
      const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'maintenance': 'Maintenance'
      };
      const text = statusMap[this.status] || 'Active';
      console.log('AdminTopNavbar: Computing statusText:', text, 'for status:', this.status);
      return text;
    },
    // Count unread notifications
    unreadNotificationsCount() {
      return this.notifications.filter(notification => !notification.read).length;
    }
  },  methods: {    // Keep all existing methods
    toggleSidebar() {
      // Use the tracked mobile state for consistency
      if (this.isMobile) {
        // On mobile, emit mobile-sidebar-toggle to handle sidebar open/close
        this.$emit('mobile-sidebar-toggle');
      } else {
        // On desktop, handle collapse/expand
        const newState = !this.isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', newState);
        this.$emit('sidebar-toggle', newState);
      }
    },

    // Add method to handle window resize
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },
    goToProfile() {
      this.$router.push('/admin/profile');
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
      this.isLoggingOut = true;
      try {
        const response = await axios.post('/api/flow-application-cc/api/logout.php', {}, {
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
      } finally {
        this.isLoggingOut = false;
        this.showSignOutConfirm = false;
      }
    },
    clearAuthData() {
      localStorage.clear();
    },

    // Status dropdown methods
    toggleStatusDropdown(event) {
      if (event && event.type === 'keydown') {
        event.preventDefault();
      }
      this.isStatusDropdownOpen = !this.isStatusDropdownOpen;

      // Close the other dropdown if open
      if (this.isStatusDropdownOpen && this.isDropdownOpen) {
        this.closeDropdown();
      }

      // Clear any existing timeout
      if (this.statusCloseTimeout) {
        clearTimeout(this.statusCloseTimeout);
        this.statusCloseTimeout = null;
      }
    },
    closeStatusDropdown() {
      this.isStatusDropdownOpen = false;
      if (this.statusCloseTimeout) {
        clearTimeout(this.statusCloseTimeout);
        this.statusCloseTimeout = null;
      }
    },
    handleStatusBlur(event) {
      // Check if the focus is moving to an element outside the status dropdown container
      const statusContainer = event.currentTarget.closest('.status-toggle-container');
      if (statusContainer && !statusContainer.contains(event.relatedTarget)) {
        this.statusCloseTimeout = setTimeout(() => {
          this.closeStatusDropdown();
        }, 150);
      }
    },
    setStatus(newStatus) {
      console.log('AdminTopNavbar: Setting status to', newStatus, 'current status:', this.status);
      if (newStatus !== this.status) {
        console.log('AdminTopNavbar: Emitting status-change event with:', newStatus);
        this.$emit('status-change', newStatus);
      } else {
        console.log('AdminTopNavbar: Status unchanged, not emitting event');
      }
      this.closeStatusDropdown();
    },

    // Notification dropdown methods
    toggleNotificationDropdown(event) {
      if (event && event.type === 'keydown') {
        event.preventDefault();
      }
      this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;

      // Close other dropdowns if open
      if (this.isNotificationDropdownOpen) {
        if (this.isStatusDropdownOpen) this.closeStatusDropdown();
        if (this.isDropdownOpen) this.closeDropdown();
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
        const response = await axios.get('/flow-application-cc/api/AdminNotifications.php', {
          params: {
            // Remove the limit parameter to fetch all notifications
            // limit: 5 // Only get latest 5 for dropdown
          },
          withCredentials: true
        });
        
        if (response.data.error) {
          console.error('Server error:', response.data.error);
          return;
        }
        
        // Transform API data to match your dropdown format
        this.notifications = response.data.notifications.map(notification => ({
          id: notification.id,
          text: notification.message,
          time: this.formatTimeAgo(notification.created_at),
          read: !!notification.read_at,
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

    // Add helper method to get icon class based on notification type
    getIconClass(type) {
      const iconMap = {
        'user_registration': 'bi-person-plus',
        'system_update': 'bi-gear',
        'report': 'bi-file-earmark-text',
        'warning': 'bi-exclamation-triangle',
        'info': 'bi-info-circle'
      };
      return iconMap[type] || 'bi-info-circle';
    },

    // Update markAsRead method to work with real data
    async markAsRead(index) {
      if (index >= 0 && index < this.notifications.length) {
        const notification = this.notifications[index];
        
        try {
          await axios.put('/flow-application-cc/api/AdminNotifications.php', {
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
        await axios.put('/flow-application-cc/api/AdminNotifications.php', {
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
      // Navigate to admin settings with notifications tab active
      this.$router.push({ 
        path: '/admin/settings', 
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
      if (this.isDropdownOpen && this.isStatusDropdownOpen) {
        this.closeStatusDropdown();
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
      const statusContainer = document.querySelector('.status-toggle-container');
      if (statusContainer && !statusContainer.contains(event.target)) {
        this.closeStatusDropdown();
      }
      
      const notificationContainer = document.querySelector('.notification-bell-container');
      if (notificationContainer && !notificationContainer.contains(event.target)) {
        this.closeNotificationDropdown();
      }
    },
    goToSettings() {
      this.$router.push('/admin/settings');
      this.closeDropdown();
    },
  },  mounted() {
    // Log initial profile for debugging
    console.log('Initial profile:', this.userProfile);
    this.pageTitle = this.$route.name || 'Dashboard';

    // Set initial mobile state
    this.handleResize();

    // Set initial time
    this.updateCurrentTime();

    // Update time every second
    this.timeInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    // Add window resize listener
    window.addEventListener('resize', this.handleResize);

    // Add click outside handler for status dropdown
    document.addEventListener('click', this.handleClickOutside);

    // Fetch notifications on mount
    this.fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    this.notificationPollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  },  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize);

    // Remove click outside handler
    document.removeEventListener('click', this.handleClickOutside);

    // Clear any pending timeouts
    if (this.statusCloseTimeout) {
      clearTimeout(this.statusCloseTimeout);
    }
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
    },
    status: {
      handler(newStatus, oldStatus) {
        console.log('AdminTopNavbar: Status prop changed from', oldStatus, 'to', newStatus);
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/topnav.css';
</style>
