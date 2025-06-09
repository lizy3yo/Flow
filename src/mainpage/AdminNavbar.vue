<template>
  <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Hamburger Menu Toggle (for mobile) -->
    <div class="menu-toggle" @click="toggleSidebar" v-show="!isSidebarOpen">
      <i class="bi bi-list"></i>
    </div>

    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="admin-logo">
        <div class="logo-icon">
          <i class="bi bi-hexagon-fill"></i>
        </div>
        <span class="logo-text">FlowAdmin</span>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="admin-nav-main">
      <div class="nav-section">
        <span class="nav-section-title">Main</span>
        <router-link
          v-for="item in filteredNavigationItems"
          :key="item.path"
          :to="item.path"
          class="admin-nav-item"
          :class="{ 'active': $route.path.includes(item.route) }"
          :data-tooltip="item.name"
        >
          <div class="nav-item-content">
            <i :class="['admin-nav-icon', item.icon]"></i>
            <span class="admin-nav-text">{{ item.name }}</span>
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
        <router-link to="/admin/profile" class="admin-nav-item small-nav-item" data-tooltip="Profile">
          <div class="nav-item-content">
            <i class="bi bi-person admin-nav-icon"></i>
            <span class="admin-nav-text">Profile</span>
            <div class="nav-item-indicator"></div>
          </div>
        </router-link>

        <a @click="handleSignOut" href="#" class="admin-nav-item small-nav-item" :class="{ 'loading': isLoggingOut }" data-tooltip="Sign out">
          <div class="nav-item-content">
            <i class="bi bi-box-arrow-left admin-nav-icon" v-if="!isLoggingOut"></i>
            <i class="bi bi-arrow-clockwise admin-nav-icon spinning" v-else></i>
            <span class="admin-nav-text">{{ isLoggingOut ? 'Signing out...' : 'Sign out' }}</span>
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
  name: 'AdminNavbar',
  props: {
    isSidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isSidebarOpen: false,
      searchQuery: '',
      userProfile: {
        name: '',
        email: '',
        role: 'Administrator',
        avatar: null
      },
      navigationItems: [
        { name: 'Dashboard', path: '/admin/dashboard', route: 'dashboard', icon: 'bi bi-pie-chart-fill' },
        { name: 'Services', path: '/admin/appointments', route: 'appointments', icon: 'bi bi-pencil-square' }
      ],
      isLoggingOut: false,
      showSignOutConfirm: false
    }
  },
  computed: {
    filteredNavigationItems() {
      return this.navigationItems.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    avatarUrl() {
      if (!this.userProfile.avatar) {
        return null;
      }
      // For local development with XAMPP
      return `http://localhost${this.userProfile.avatar}`;
    }
  },
  methods: {
    handleSearch() {
      // Add debounce if needed
      console.log('Searching:', this.searchQuery)
    },
    handleSignOut() {
      this.showSignOutConfirm = true;
    },
    
    cancelSignOut() {
      this.showSignOutConfirm = false;
    },
    
    async confirmSignOut() {
      this.isLoggingOut = true;
      try {
        const response = await axios.post('https://flow-backend-yxdw.onrender.com/logout.php', {}, {
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
    async fetchUserProfile() {
    try {
        const admin = localStorage.getItem('admin');
        if (!admin) {
            this.$router.push('/admin/login');
            return;
        }

        // Get session token for authentication
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
            headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        const response = await axios.get('/api/flow-application-cc/api/adminprofile.php', {
            withCredentials: true,
            headers: headers
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
            localStorage.removeItem('adminSessionToken');
            localStorage.removeItem('userData');
            this.$router.push('/admin/login');
        }
    }
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  },
  mounted() {
    // Close sidebar when route changes
    this.$router.afterEach(() => {
      this.isSidebarOpen = false;
    });

    // Fetch user profile when component mounts
    this.fetchUserProfile();
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-admin/navbar.css';
@import '@/styles/mainpage-admin/root.css';
</style>
