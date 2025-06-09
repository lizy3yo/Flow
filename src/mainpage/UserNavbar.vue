<template>
  <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Hamburger Menu Toggle (for mobile) -->
    <div class="menu-toggle" @click="toggleSidebar" v-show="!isSidebarOpen">
      <i class="bi bi-list"></i>
    </div>    <!-- Sidebar Header -->
    <div class="sidebar-headers">
      <div class="user-logo">
        <div class="logo-icon">
          <i class="bi bi-hexagon-fill"></i>
        </div>
        <span class="logo-text">FlowUser</span>
      </div>
    </div>

    <!-- Queue Navigation Section -->
    <div class="user-sidebar-quick-actions" v-if="queueItem">
      <router-link
        :to="queueItem.path"
        class="join-queue-btn"
        :data-tooltip="queueItem.name"
      >
        <i :class="queueItem.icon"></i>
        <span>{{ queueItem.name }}</span>
      </router-link>
    </div>

    <!-- Main Navigation -->
    <nav class="user-nav-main">
      <div class="nav-section">
        <span class="nav-section-title">Main</span>
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="user-nav-item"
          :class="{
            'active': Array.isArray(item.route)
              ? item.route.includes($route.name)
              : $route.name === item.route
          }"
          :data-tooltip="item.name"
        >
          <div class="nav-item-content">
            <i :class="['user-nav-icon', item.icon]"></i>
            <span class="user-nav-text">{{ item.name }}</span>
            <div class="nav-item-indicator"></div>
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Spacer to push profile/signout to bottom -->
    <div class="flex-grow-1"></div>

    <!-- Profile and Sign Out Section -->
    <div class="bottom-nav">
      <div class="nav-section">
        <span class="nav-section-title">Account</span>
        <router-link to="/user/profile" class="user-nav-item small-nav-item" data-tooltip="Profile">
          <div class="nav-item-content">
            <i class="bi bi-person user-nav-icon"></i>
            <span class="user-nav-text">Profile</span>
            <div class="nav-item-indicator"></div>
          </div>
        </router-link>

        <a @click="handleLogout" href="#" class="user-nav-item small-nav-item" :class="{ 'loading': isLoggingOut }" data-tooltip="Sign out">
          <div class="nav-item-content">
            <i class="bi bi-box-arrow-left user-nav-icon" v-if="!isLoggingOut"></i>
            <i class="bi bi-arrow-clockwise user-nav-icon spinning" v-else></i>
            <span class="user-nav-text">{{ isLoggingOut ? 'Signing out...' : 'Sign out' }}</span>
            <div class="nav-item-indicator"></div>
          </div>
        </a>
      </div>
    </div>
  </div>

  <!-- Add overlay for mobile -->
  <div
    class="sidebar-overlay"
    :class="{ 'active': isSidebarOpen }"
    @click="toggleSidebar"
  ></div>

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
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserNavbar',
  props: {
    isSidebarCollapsed: {
      type: Boolean,
      default: false
    },
    sidebarOpen: { // <-- Add prop for external control
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {
      isSidebarOpen: this.sidebarOpen !== undefined ? this.sidebarOpen : false,
      userProfile: null,
      queueItem: {
        name: 'Book Appointment',
        path: '/user/book',
         route: 'book',
        icon: 'bi bi-calendar-plus'
      },      menuItems: [
        { name: 'Home', path: '/user/dashboard', route: 'dashboard', icon: 'bi bi-house-fill' },
        {
          name: 'Book',
          path: '/user/book',
          route: ['book', 'UserBookAppointment', 'UserBookAppointmentView'], // Array of related routes
          icon: 'bi bi-calendar-plus'
        },
        { name: 'My Appointments', path: '/user/my-appointments', route: 'my-appointments', icon: 'bi bi-calendar-check' },
      ],
      isLoggingOut: false,
      showSignOutConfirm: false
    }
  },
  computed: {
    currentRoute() {
      return this.$route?.name || '';
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      // If controlled externally, emit event
      if (this.sidebarOpen !== undefined) {
        this.$emit('update:sidebarOpen', this.isSidebarOpen);
      }
    },
    handleLogout() {
      this.showSignOutConfirm = true;
    },
    cancelSignOut() {
      this.showSignOutConfirm = false;
    },
    async confirmSignOut() {
      if (this.isLoggingOut) return;

      this.isLoggingOut = true;
      try {
        const response = await axios.post('https://flow-backend-yxdw.onrender.com/logout.php', {}, {
          withCredentials: true
        });

        if (response.data.success) {
          this.clearAuthData();
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
        this.clearAuthData();
        this.$router.push('/login');
      } finally {
        this.isLoggingOut = false;
        this.showSignOutConfirm = false;
      }
    },
    clearAuthData() {
      localStorage.clear();
    },
    fetchUserProfile() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          this.userProfile = {
            name: parsedData.name || parsedData.first_name || 'User',
            email: parsedData.email || ''
          };
        } else {
          this.userProfile = {
            name: 'User',
            email: ''
          };
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.userProfile = {
          name: 'User',
          email: ''
        };
      }
    }
  },  watch: {
    // Watch for route changes to close mobile sidebar
    '$route'() {
      this.isSidebarOpen = false;
    },
    // Watch for external sidebarOpen prop changes
    sidebarOpen(val) {
      if (val !== undefined) this.isSidebarOpen = val;
    },
    // Sync internal state to parent if changed internally
    isSidebarOpen(val) {
      if (this.sidebarOpen !== undefined && val !== this.sidebarOpen) {
        this.$emit('update:sidebarOpen', val);
      }
    }
  },
  mounted() {
    this.fetchUserProfile();
    
    // Close sidebar when route changes (similar to AdminNavbar)
    this.$router.afterEach(() => {
      this.isSidebarOpen = false;
    });
  },
  beforeUnmount() {
    // Clean up any event listeners if needed
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/usernavbar.css';
</style>
