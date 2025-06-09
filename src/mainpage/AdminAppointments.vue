<template>
  <div class="page-container">
     <!-- Add Top Navbar with status props -->    <AdminTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      :status="adminStatus"
      @sidebar-toggle="toggleSidebar"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
      @status-change="handleStatusChange"
    /><!-- Pass isSidebarCollapsed to the AdminNavbar -->
    <AdminNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="toggleSidebar"
      ref="adminNavbar"
    />
    
     <!-- Add content-expanded class to adjust content based on sidebar state -->
    <div class="content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <!-- Alert Container -->
      <div class="admin-service-alert-container" v-if="success || error">
        <div v-if="success" class="admin-service-alert admin-service-alert-success">
          <i class="bi bi-check-circle"></i> {{ success }}
        </div>
        <div v-if="error" class="admin-service-alert admin-service-alert-danger">
          <i class="bi bi-exclamation-circle"></i> {{ error }}
        </div>
      </div>

      <!-- Page Header -->
      <div class="admin-service-page-header">
        <div class="admin-service-header-content">
          <h1 class="admin-service-page-title">Service Management</h1>
          <p class="admin-service-page-subtitle">Manage and monitor your service units</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="admin-service-stats-container">
        <div class="admin-service-stat-card" v-for="(stat, index) in statisticsCards" :key="stat.key" :style="{ animationDelay: `${index * 100}ms` }">
          <div class="admin-service-stat-icon" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="admin-service-stat-info">
            <h3>{{ stat.title }}</h3>
            <p class="admin-service-stat-number">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="admin-service-filter-section">
        <div class="admin-service-search-and-filter">
          <div class="admin-service-search-bar">
            <i class="bi bi-search"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search services by name, location..."
            >
          </div>
          <div class="admin-service-filter-dropdown">
            <select v-model="selectedFilter" @change="applyFilter(selectedFilter)" class="admin-service-filter-select">
              <option value="all">All Services</option>
              <option value="active">Active Services</option>
              <option value="inactive">Inactive Services</option>
              <option value="maintenance">Maintenance Services</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Departments Grid -->
      <div class="admin-service-departments-grid">
        <div v-for="service in filteredServices" :key="service.id" class="admin-service-department-card">          <div class="admin-service-card-header">
            <h3 v-html="highlightText(service.name)"></h3>
            <span class="admin-service-status" :class="service.status">{{ formatStatus(service.status) }}</span>
          </div>
          <div class="admin-service-card-content">
            <div class="admin-service-info-row">
              <span>Operating Hours:</span>
              <span>{{ formatTime(service.hours_start) }} - {{ formatTime(service.hours_end) }}</span>
            </div>
            <div class="admin-service-info-row">
              <span>Max Queue:</span>
              <span>{{ service.max_queues }}</span>
            </div>
            <div class="admin-service-info-row">
              <span>Location:</span>
              <span v-html="highlightText(service.location)"></span>
            </div>
            <div class="admin-service-info-row">
              <span>Email:</span>
                <div>{{ service.email }}</div>
            </div>
            <div class="admin-service-info-row">
              <span>Phone number:</span>
                <div>{{ service.phone }}</div>
            </div>
          
            <div class="admin-service-card-actions">
              <button @click="editService(service)">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="deleteService(service)">
                <i class="bi bi-trash"></i>
              </button>
              <button @click="viewServiceDetails(service)">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div class="admin-service-edit-modal" v-if="showCreateModal">
        <div class="admin-service-modal-content">
          <div class="admin-service-modal-header">
            <h3>Create Service</h3>
            <button class="admin-service-close-btn" @click="closeCreateModal">&times;</button>
          </div>
          <form @submit.prevent="handleSubmit" class="admin-service-edit-form">
            <!-- Service Unit Name -->
            <div class="admin-service-form-group full-width">
              <label>Service Name</label>
              <div class="service-input-with-error">
                <input 
                  v-model="service.name"
                  type="text" 
                  placeholder="Enter service unit name"
                  :class="{ error: errors.name }"
                  @input="validateServiceName"
                  required
                >
                <span v-if="errors.name" class="service-error-message">{{ errors.name }}</span>
              </div>
            </div>

            <!-- Operating Hours -->
            <div class="admin-service-form-row">
              <div class="admin-service-form-group">
                <label>Operating Hours Start</label>
                <div class="service-input-with-error">
                  <input 
                    type="time" 
                    required
                    :class="{ error: errors.hours_start }"
                    @input="e => handleTimeInputValidation(e, 'hours_start')"
                    :value="service.hours_start"
                  >
                  <span v-if="errors.hours_start" class="service-error-message">{{ errors.hours_start }}</span>
                </div>
              </div>
              <div class="admin-service-form-group">
                <label>Operating Hours End</label>
                <div class="service-input-with-error">
                  <input 
                    type="time" 
                    required
                    :class="{ error: errors.hours_end }"
                    @input="e => handleTimeInputValidation(e, 'hours_end')"
                    :value="service.hours_end"
                  >
                  <span v-if="errors.hours_end" class="service-error-message">{{ errors.hours_end }}</span>
                </div>
              </div>
            </div>

            <!-- Max Current Queue -->
            <div class="admin-service-form-group full-width">
              <label>Max Current Queue</label>
              <div class="service-input-with-error">
                <input 
                  v-model="service.max_queues"
                  type="number"
                  min="1"
                  placeholder="Enter maximum queue capacity"
                  :class="{ error: errors.max_queues }"
                  @input="validateMaxQueues"
                  required
                >
                <span v-if="errors.max_queues" class="service-error-message">{{ errors.max_queues }}</span>
              </div>
            </div>

            <!-- Location -->
            <div class="admin-service-form-group full-width">
              <label>Location</label>
              <div class="service-input-with-error">
                <input 
                  v-model="service.location"
                  type="text"
                  placeholder="Enter location (e.g., Floor 2, Room 204)"
                  :class="{ error: errors.location }"
                  @input="validateLocation"
                  required
                >
                <span v-if="errors.location" class="service-error-message">{{ errors.location }}</span>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="admin-service-form-row">
              <div class="admin-service-form-group">
                <label>Email</label>
                <div class="service-input-with-error">
                  <input 
                    v-model="service.email"
                    type="email"
                    placeholder="Enter email address"
                    :class="{ error: errors.email }"
                    @input="validateEmail"
                  >
                  <span v-if="errors.email" class="service-error-message">{{ errors.email }}</span>
                </div>
              </div>
              <div class="admin-service-form-group">
                <label>Phone Number</label>
                <div class="service-input-with-error">
                  <input 
                    v-model="service.phone"
                    type="tel"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    placeholder="Enter phone number (numbers only)"
                    :class="{ error: errors.phone }"
                    @input="validatePhone"
                    @keypress="preventNonNumeric"
                  >
                  <span v-if="errors.phone" class="service-error-message">{{ errors.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="admin-service-form-actions">
              <button type="button" class="admin-service-cancel-btn" @click="closeCreateModal">Cancel</button>
              <button type="submit" class="admin-service-save-btn">Create Service</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="admin-service-edit-modal" v-if="showEditModal">
        <div class="admin-service-modal-content">
          <div class="admin-service-modal-header">
            <h3>Edit Service</h3>
            <button class="admin-service-close-btn" @click="closeEditModal">&times;</button>
          </div>
          <form @submit.prevent="submitEdit" class="admin-service-edit-form">
            <!-- Service Unit Name -->
            <div class="admin-service-form-group full-width">
              <label>Service Name</label>
              <div class="service-input-with-error">
                <input 
                  v-model="editingService.name"
                  type="text" 
                  placeholder="Enter service unit name"
                  :class="{ error: errors.name }"
                  required
                >
                <span v-if="errors.name" class="service-error-message">{{ errors.name }}</span>
              </div>
            </div>

            <!-- Operating Hours -->
            <div class="admin-service-form-row">
              <div class="admin-service-form-group">
                <label>Operating Hours Start</label>
                <div class="service-input-with-error">
                  <input 
                    type="time" 
                    required
                    :class="{ error: errors.hours_start }"
                    @input="e => handleTimeInputValidation(e, 'hours_start')"
                    :value="editingService.hours_start"
                  >
                  <span v-if="errors.hours_start" class="service-error-message">{{ errors.hours_start }}</span>
                </div>
              </div>
              <div class="admin-service-form-group">
                <label>Operating Hours End</label>
                <div class="service-input-with-error">
                  <input 
                    type="time" 
                    required
                    :class="{ error: errors.hours_end }"
                    @input="e => handleTimeInputValidation(e, 'hours_end')"
                    :value="editingService.hours_end"
                  >
                  <span v-if="errors.hours_end" class="service-error-message">{{ errors.hours_end }}</span>
                </div>
              </div>
            </div>

            <!-- Max Current Queue -->
            <div class="admin-service-form-group full-width">
              <label>Max Current Queue</label>
              <div class="service-input-with-error">
                <input 
                  v-model="editingService.max_queues"
                  type="number"
                  min="1"
                  placeholder="Enter maximum queue capacity"
                  :class="{ error: errors.max_queues }"
                  required
                >
                <span v-if="errors.max_queues" class="service-error-message">{{ errors.max_queues }}</span>
              </div>
            </div>

            <!-- Location -->
            <div class="admin-service-form-group full-width">
              <label>Location</label>
              <div class="service-input-with-error">
                <input 
                  v-model="editingService.location"
                  type="text"
                  placeholder="Enter location (e.g., Floor 2, Room 204)"
                  :class="{ error: errors.location }"
                  required
                >
                <span v-if="errors.location" class="service-error-message">{{ errors.location }}</span>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="admin-service-form-row">
              <div class="admin-service-form-group">
                <label>Email</label>
                <div class="service-input-with-error">
                  <input 
                    v-model="editingService.email"
                    type="email"
                    placeholder="Enter email address"
                    :class="{ error: errors.email }"
                  >
                  <span v-if="errors.email" class="service-error-message">{{ errors.email }}</span>
                </div>
              </div>
              <div class="admin-service-form-group">
                <label>Phone Number</label>
                <div class="service-input-with-error">
                  <input 
                    v-model="editingService.phone"
                    type="tel"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    placeholder="Enter phone number (numbers only)"
                    :class="{ error: errors.phone }"
                    @keypress="preventNonNumeric"
                  >
                  <span v-if="errors.phone" class="service-error-message">{{ errors.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="admin-service-form-actions">
              <button type="button" class="admin-service-cancel-btn" @click="closeEditModal">Cancel</button>
              <button type="submit" class="admin-service-save-btn">Save Changes</button>
            </div>          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="admin-service-delete-modal" v-if="showDeleteModal">
        <div class="admin-service-delete-modal-content">
          <div class="admin-service-delete-modal_header">
            <div class="admin-service-delete-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <h3 class="admin-service-delete-modal-title">Confirm Deletion</h3>
          </div>
          <div class="admin-service-delete-modal-body">
            <p class="admin-service-delete-message">
              Are you sure you want to delete this service?
            </p>
            <div class="admin-service-delete-service-name" v-if="serviceToDelete">
              {{ serviceToDelete.name }}
            </div>
            <p class="admin-service-delete-warning">
              This action cannot be undone.
            </p>
          </div>
          <div class="admin-service-delete-modal-actions">
            <button 
              class="admin-service-delete-cancel-btn" 
              @click="closeDeleteModal"
              :disabled="isDeleting"
            >
              <i class="bi bi-x-circle"></i>
              Cancel
            </button>
            <button 
              class="admin-service-delete-confirm-btn" 
              @click="confirmDeleteService"
              :class="{ loading: isDeleting }"
              :disabled="isDeleting"
            >
              <i class="bi bi-trash" v-if="!isDeleting"></i>
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import AdminTopNavbar from './AdminTopNavbar.vue' // Add import for TopNavbar
import axios from 'axios'

const API_BASE_URL = 'https://flow-backend-yxdw.onrender.com/services.php'

export default {
  name: 'AdminAppointments',
  components: {
    AdminNavbar,
    AdminTopNavbar // Register the TopNavbar component
  },
  data() {
    return {
      // Initialize from localStorage or default to false
      isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      userProfile: null, // Add user profile for TopNavbar
      adminStatus: 'active', // Default status
      service: {
        name: '',
        description: '',
        hours_start: '',
        hours_end: '',
        max_queues: '',
        address: '',
        location: '',
        email: '',
        phone: '',
        ticket_prefix: ''
      },
      currentDate: '',
      currentTime: '',
      services: [],
      error: null,
      success: null,
      showFilter: false,
      selectedFilter: 'all',
      totalAppointments: 0,
      pendingAppointments: 0,
      cancelledAppointments: 0,
      completedAppointments: 0,
      showEditModal: false,
      editingService: {
        name: '',
        description: '',
        hours_start: '',
        hours_end: '',
        max_queues: '',
        address: '',
        location: '',
        email: '',
        phone: '',
        ticket_prefix: ''
      },      showCreateModal: false,
      showDeleteModal: false,
      serviceToDelete: null,
      isDeleting: false,
      searchQuery: '',
      errors: {
        name: '',
        hours_start: '',
        hours_end: '',
        max_queues: '',
        location: '',
        email: '',
        phone: ''
      }
    }
  },

  computed: {
    filteredServices() {
      let filtered = [...this.services];

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.location.toLowerCase().includes(query) ||
          service.address?.toLowerCase().includes(query)
        );
      }

      // Apply status filter
      if (this.selectedFilter !== 'all') {
        filtered = filtered.filter(service => {
          const status = this.getServiceStatus(service);
          return status === this.selectedFilter;
        });
      }

      return filtered;
    },

    statisticsCards() {
      const totalServices = this.services.length;
      const activeServices = this.services.filter(service => this.getServiceStatus(service) === 'active').length;
      const inactiveServices = this.services.filter(service => this.getServiceStatus(service) === 'inactive').length;
      const totalQueues = this.services.reduce((sum, service) => sum + parseInt(service.max_queues || 0), 0);

      return [
        {
          key: 'total',
          title: 'Total Services',
          value: totalServices,
          icon: 'bi bi-building',
          iconClass: 'icon-total'
        },
        {
          key: 'active',
          title: 'Active Services',
          value: activeServices,
          icon: 'bi bi-check-circle-fill',
          iconClass: 'icon-active'
        },
        {
          key: 'inactive',
          title: 'Inactive Services',
          value: inactiveServices,
          icon: 'bi bi-x-circle-fill',
          iconClass: 'icon-inactive'
        },
        {
          key: 'capacity',
          title: 'Total Capacity',
          value: totalQueues,
          icon: 'bi bi-people',
          iconClass: 'icon-capacity'
        }
      ];
    },
    
    hasFormErrors() {
      return Object.values(this.errors).some(error => error !== '');
    }
  },

  async mounted() {
    this.updateDateTime();
    setInterval(this.updateDateTime, 60000);
    await this.fetchServices();
    await this.fetchUserProfile();
    this.updateSummary();
    this.applyFilter('all');

    this.fetchAdminStatus();
  },

  methods: {    toggleSidebar(value) {
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
    
    async handleSignOut() {
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
      }
    },
    
    clearAuthData() {
      localStorage.clear();
    },
    
    updateDateTime() {
      const now = new Date()
      this.currentDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },

    async fetchServices() {
      try {
        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
          throw new Error('No admin ID found. Please log in again.');
        }
        
        const response = await axios.get(`${API_BASE_URL}?admin_id=${adminId}`);
        if (response.data && !response.data.error) {
          this.services = response.data;
          // Add status property to each service
          this.services = this.services.map(service => ({
            ...service,
            status: this.getServiceStatus(service)
          }));
        }
      } catch (error) {
        console.error('Error:', error);
        this.error = error.message;
      }
    },

    async getCurrentAdminId() {
      const adminId = localStorage.getItem('adminId');
      this.service.admin_id = adminId;
    },

    getServiceStatus(service) {
      // First check admin's status - if inactive or maintenance, override service status
      if (this.adminStatus === 'inactive' || this.adminStatus === 'maintenance') {
        return this.adminStatus;
      }

      // If admin is active, then check service's operating hours
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(service.hours_start.replace(':', ''));
      const endTime = parseInt(service.hours_end.replace(':', ''));
      
      return (currentTime >= startTime && currentTime <= endTime) ? 'active' : 'inactive';
    },

    validateServiceName() {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!this.service.name) {
        this.errors.name = 'Required';
      } else if (!nameRegex.test(this.service.name)) {
        this.errors.name = 'Only letters and spaces allowed';
      } else if (this.service.name.length < 2) {
        this.errors.name = 'At least 2 characters required';
      } else {
        this.errors.name = '';
      }
    },

    validateOperatingHours(start, end) {
      // Convert times to minutes for easier comparison
      const startParts = start.split(':');
      const endParts = end.split(':');
      
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      if (endMinutes <= startMinutes) {
        this.errors.hours_end = 'End time must be later than start time within the same day';
        return false;
      }
      this.errors.hours_end = null;
      return true;
    },

    validateMaxQueues() {
      const value = this.service.max_queues;
      if (!value) {
        this.errors.max_queues = 'Required';
      } else if (parseInt(value) <= 0) {
        this.errors.max_queues = 'Must be greater than 0';
      } else {
        this.errors.max_queues = '';
      }
    },

    validateLocation() {
      if (!this.service.location) {
        this.errors.location = 'Required';
      } else if (this.service.location.trim().length < 3) {
        this.errors.location = 'At least 3 characters required';
      } else {
        this.errors.location = '';
      }
    },

    validateEmail() {
      if (!this.service.email) {
        return; // Email is optional
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.service.email)) {
        this.errors.email = 'Invalid email format';
      } else {
        this.errors.email = '';
      }
    },

    validatePhone() {
      if (!this.service.phone) {
        return; // Phone is optional
      }
      const numbersOnly = this.service.phone.replace(/\D/g, '');
      if (numbersOnly.length < 10 || numbersOnly.length > 11) {
        this.errors.phone = 'Must be 10-11 digits';
      } else {
        this.errors.phone = '';
      }
      this.service.phone = numbersOnly;
    },

    // Modify the existing validateForm method
    validateForm() {
      try {
        this.validateServiceName(this.service.name);
        this.validateOperatingHours(this.service.hours_start, this.service.hours_end);
        this.validateMaxQueues(this.service.max_queues);
        this.validateLocation(this.service.location);
        
        // Only validate if values are provided (assuming these are optional)
        if (this.service.email) {
          this.validateEmail(this.service.email);
        }
        if (this.service.phone) {
          this.validatePhone(this.service.phone);
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },

    async handleSubmit() {
      // Clear previous errors
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = '';
      });

      // Validate all fields
      this.validateServiceName();
      if (this.service.hours_start) this.handleTimeInputValidation({ target: { value: this.service.hours_start }}, 'hours_start');
      if (this.service.hours_end) this.handleTimeInputValidation({ target: { value: this.service.hours_end }}, 'hours_end');
      this.validateMaxQueues();
      this.validateLocation();
      if (this.service.email) this.validateEmail();
      if (this.service.phone) this.validatePhone();

      // Check for errors
      if (this.hasFormErrors) {
        return;
      }

      try {
        // Get current admin_id from localStorage instead of sessionStorage
        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
          throw new Error('No admin ID found. Please log in again.');
        }
        
        const serviceData = {
          ...this.service,
          admin_id: adminId,
          max_queues: parseInt(this.service.max_queues, 10)
        };
        
        const response = await axios.post(API_BASE_URL, serviceData);
          if (response.data.success) {
          this.success = 'Service created successfully';
          await this.fetchServices();
          this.resetForm();
          this.closeCreateModal();
          
          // Auto-fade success message after 3 seconds
          setTimeout(() => {
            this.success = null;
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Failed to create service');
        }
          } catch (error) {
        console.error('Error creating service:', error);
        this.error = error.response?.data?.error || error.message;
        
        // Auto-fade error message after 3 seconds
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    },

    resetForm() {
      this.service = {
        name: '',
        description: '',
        hours_start: '',
        hours_end: '',
        max_queues: '',
        address: '',
        location: '',
        email: '',
        phone: '',
        ticket_prefix: ''
      };
    },

    updateSummary() {
      const total = this.services.length;
      this.totalAppointments = total;
      this.pendingAppointments = Math.floor(total * 0.25);
      this.cancelledAppointments = Math.floor(total * 0.15);
      this.completedAppointments = Math.floor(total * 0.60);
    },

    toggleFilter() {
      this.showFilter = !this.showFilter
    },

    applyFilter(filter) {
      this.selectedFilter = filter;
      this.showFilter = false;

      switch(filter) {
        case 'all':
          this.filteredServices = [...this.services];
          break;
        case 'today':
          this.filteredServices = this.services.filter(service => 
            this.getServiceStatus(service) === 'active'
          );
          break;
        case 'week':
          // Add your weekly filter logic
          this.filteredServices = [...this.services];
          break;
        case 'month':
          // Add your monthly filter logic
          this.filteredServices = [...this.services];
          break;
      }
    },

    async editService(service) {
      this.editingService = { ...service }; // Create a copy of the service
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingService = null;
    },

    async submitEdit() {
      // Clear previous errors
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = '';
      });

      // Validate all fields
      if (this.editingService.name) {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(this.editingService.name)) {
          this.errors.name = 'Only letters and spaces allowed';
          return;
        } else if (this.editingService.name.length < 2) {
          this.errors.name = 'At least 2 characters required';
          return;
        }
      } else {
        this.errors.name = 'Required';
        return;
      }

      // Validate operating hours
      if (this.editingService.hours_start && this.editingService.hours_end) {
        const startParts = this.editingService.hours_start.split(':');
        const endParts = this.editingService.hours_end.split(':');
        
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        
        if (endMinutes <= startMinutes) {
          this.errors.hours_end = 'End time must be later than start time within the same day';
          return;
        }
      } else {
        if (!this.editingService.hours_start) this.errors.hours_start = 'Required';
        if (!this.editingService.hours_end) this.errors.hours_end = 'Required';
        return;
      }

      // Validate max queues
      if (this.editingService.max_queues) {
        if (parseInt(this.editingService.max_queues) <= 0) {
          this.errors.max_queues = 'Must be greater than 0';
          return;
        }
      } else {
        this.errors.max_queues = 'Required';
        return;
      }

      // Validate location
      if (this.editingService.location) {
        if (this.editingService.location.trim().length < 3) {
          this.errors.location = 'At least 3 characters required';
          return;
        }
      } else {
        this.errors.location = 'Required';
        return;
      }

      // Validate email if provided
      if (this.editingService.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.editingService.email)) {
          this.errors.email = 'Invalid email format';
          return;
        }
      }

      // Validate phone if provided
      if (this.editingService.phone) {
        const numbersOnly = this.editingService.phone.replace(/\D/g, '');
        if (numbersOnly.length < 10 || numbersOnly.length > 11) {
          this.errors.phone = 'Must be 10-11 digits';
          return;
        }
        this.editingService.phone = numbersOnly;
      }

      try {
        // Format the data
        const serviceData = {
          ...this.editingService,
          max_queues: parseInt(this.editingService.max_queues, 10)
        };

        const response = await axios.put(
          `${API_BASE_URL}?id=${this.editingService.id}`,
          serviceData
        );
        
        if (response.data.success) {
          this.error = null;
          this.success = 'Service updated successfully';
          await this.fetchServices();
          this.closeEditModal();
          
          setTimeout(() => {
            this.success = null;
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Failed to update service');
        }
      } catch (error) {
        console.error('Error updating service:', error);
        this.error = error.response?.data?.error || error.message;
        
        setTimeout(() => {
          this.error = null;        }, 3000);
      }
    },

    async deleteService(service) {
      this.serviceToDelete = service;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.serviceToDelete = null;
      this.isDeleting = false;
    },

    async confirmDeleteService() {
      if (!this.serviceToDelete) return;
      
      this.isDeleting = true;
      try {
        const response = await axios.delete(`${API_BASE_URL}?id=${this.serviceToDelete.id}`);
          if (response.data.success) {
          this.success = 'Service deleted successfully';
          await this.fetchServices();
          this.applyFilter(this.selectedFilter);
          this.updateSummary();
          this.closeDeleteModal();
          
          // Auto-fade success message after 3 seconds
          setTimeout(() => {
            this.success = null;
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Failed to delete service');
        }      } catch (error) {
        console.error('Error deleting service:', error);
        this.error = error.response?.data?.error || error.message;
        this.isDeleting = false;
        
        // Auto-fade error message after 3 seconds
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    },

    closeCreateModal() {
      this.showCreateModal = false;
    },

    viewServiceDetails(service) {
      this.$router.push({
        name: 'AdminAppointmentsView',
        params: {
          serviceId: service.id,
          serviceName: service.name
        }
      })
    },

    highlightText(text) {
      if (!this.searchQuery || !text) return text;
      
      const escapedQuery = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedQuery})`, 'gi');
      
      return text.toString().replace(searchRegex, '<mark class="admin-service-highlight">$1</mark>');
    },    formatTime(time) {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    },

    formatStatus(status) {
      if (!status) return '';
      
      // Capitalize the first letter and keep the rest lowercase
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    },

    parseTime(timeStr) {
      if (!timeStr) return '';
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    },

    handleTimeInput(event, field) {
      const input = event.target;
      const value = input.value;
      
      if (value) {
        const formattedTime = this.formatTime(value);
        // Check which form we're dealing with
        if (this.showCreateModal) {
          this.service[field] = value;
        } else if (this.showEditModal && this.editingService) {
          this.editingService[field] = value;
        }
        input.value = formattedTime;
      }
    },

    handleTimeInputValidation(event, field) {
      const value = event.target.value;
      this.handleTimeInput(event, field);
      
      if (!value) {
        this.errors[field] = 'Required';
      } else if (field === 'hours_end' && this.service.hours_start) {
        try {
          this.validateOperatingHours(this.service.hours_start, value);
          this.errors.hours_end = '';
        } catch (err) {
          this.errors.hours_end = err.message;
        }
      } else if (field === 'hours_start' && this.service.hours_end) {
        try {
          this.validateOperatingHours(value, this.service.hours_end);
          this.errors.hours_start = '';
        } catch (err) {
          this.errors.hours_start = err.message;
        }
      } else {
        this.errors[field] = '';
      }
    },

    async fetchAdminStatus() {
      try {
        const response = await axios.get('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          withCredentials: true
        });
        
        if (response.data) {
          this.adminStatus = response.data.queue_status || 'active';
          // Trigger recomputation of service statuses
          this.services = this.services.map(service => ({
            ...service,
            status: this.getServiceStatus(service)
          }));
        }
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    },
    
    handleStatusChange(newStatus) {
      this.adminStatus = newStatus;
      
      // Update all services to reflect new status
      this.services = this.services.map(service => ({
        ...service,
        status: this.getServiceStatus(service)
      }));

      try {
        axios.put('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          queue_status: newStatus,
          action: 'update_status_only'
        }, { withCredentials: true });
        
        console.log('Status updated successfully');
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },

    
  },
  watch: {
    adminStatus: {
      handler() {  // Remove the unused newStatus parameter
        // Update all services when admin status changes
        if (this.services.length) {
          this.services = this.services.map(service => ({
            ...service,
            status: this.getServiceStatus(service)
          }));
        }
      },
      immediate: true
    }
  }
}
</script>

<style>
@import '@/styles/mainpage-admin/appointment.css';
@import '@/styles/mainpage-admin/content.css';
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/topnav.css'; /* Add import for topnav styles */

/* Add additional layout styles for sidebar and topnav integration */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.content {
  margin-left: 350px; /* Match sidebar width */
  margin-top: 70px; /* Match topnav height */
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 80px; /* Width of collapsed sidebar */
}

@media (max-width: 768px) {
  .content {
    margin-left: 0;
    margin-top: 60px; /* Smaller topnav on mobile */
    padding: 1rem;
  }
}
</style>