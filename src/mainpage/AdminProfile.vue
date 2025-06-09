<template>
  <div class="page-container">    <!-- Add TopNavbar -->
    <AdminTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="toggleSidebar"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      :status="adminData.queue_status"
      @status-change="changeQueueStatus"
      :userProfile="adminData"
      :key="adminData.queue_status"
    />

    <!-- Pass the collapsible state to sidebar -->
    <AdminNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="toggleSidebar"
      ref="adminNavbar"
    />

    <!-- Update content class to respond to sidebar state -->
    <main class="content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <div class="admin-profile-layout">
        <!-- Left Side - Profile Info -->
        <div class="admin-profile-sidebar">
          <div class="admin-profile-header">
            <div class="admin-profile-avatar">
              <div class="admin-profile-profile-icon">
                <img
                  :src="avatarUrl"
                  alt="Profile Picture"
                >
                <button class="admin-profile-avatar-edit" @click="openAvatarModal">
                  <i class="bi bi-pencil"></i>
                </button>
              </div>
            </div>
            <div class="admin-profile-info">
              <h1>{{ adminData.name }}</h1>
              <div class="admin-profile-details">
                <p><i class="bi bi-circle-fill" :class="getStatusIconClass(adminData.queue_status)"></i>
                   Queue Status: {{ getStatusDisplayText(adminData.queue_status) }}
                </p>
                <p><i class="bi bi-clock"></i> {{ formatTime(adminData.hours_start) }} - {{ formatTime(adminData.hours_end) }}</p>

                <p><i class="bi bi-envelope"></i> {{ adminData.email }}</p>
                <p><i class="bi bi-geo-alt"></i> {{ adminData.location }}</p>

                <p><i class="bi bi-pin-map"></i> {{ adminData.address }}</p>

                <p><i class="bi bi-building"></i> {{ adminData.building_type }}</p>
                <p class="admin-profile-description">
                  <i class="bi bi-card-text"></i> {{ adminData.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Settings Forms -->
        <div class="admin-profile-main">
          <!-- Settings Navigation -->
          <div class="admin-profile-settings-nav">
            <button
              :class="['admin-profile-nav-btn', { 'admin-profile-active': activeTab === 'account' }]"
              @click="activeTab = 'account'"
            >
              Account
            </button>
            <button
              :class="['admin-profile-nav-btn', { 'admin-profile-active': activeTab === 'company' }]"
              @click="activeTab = 'company'"
            >
              Establishment
            </button>
          </div>

          <!-- Account Settings Section -->
          <div v-if="activeTab === 'account'" class="admin-profile-settings-section">
            <div class="admin-profile-info-section">


              <!-- Credentials Section -->
              <div class="admin-profile-credentials-group">

                <div class="admin-profile-credential-item">
                  <label>Establishment Name</label>
                  <div class="admin-profile-credential-field">
                    <div v-if="editingFields.name" class="admin-profile-input-wrapper">
                      <input
                        v-model="tempFields.name"
                        type="text"
                        class="admin-profile-credential-input"
                        placeholder="Enter establishment name"
                        pattern="[A-Za-z\s]+"
                        title="Only letters are allowed"
                      >
                      <div class="admin-profile-action-buttons">
                        <button class="admin-profile-cancel-btn" @click="cancelEdit('name')">
                          <i class="bi bi-x"></i>
                        </button>
                        <button class="admin-profile-save-btn" @click="updateField('name')">
                          <i class="bi bi-check2"></i>
                        </button>
                      </div>
                    </div>
                    <div v-else class="admin-profile-current-value">
                      <span>{{ adminData.name }}</span>
                      <button class="admin-profile-edit-btn" @click="startEditing('name')">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="admin-profile-credential-item">
                  <label>Email Address</label>
                  <div class="admin-profile-credential-field">
                    <div class="admin-profile-current-value">
                      <span>{{ adminData.email }}</span>
                    </div>
                  </div>
                </div>

                <!-- Password Section -->
                <div class="admin-profile-credential-item">
                  <label>Password</label>
                  <div class="admin-profile-credential-field">
                    <div v-if="isEditingPassword" class="admin-profile-input-wrapper">
                      <div class="admin-profile-password-input-wrapper">
                        <input
                          :type="showPassword ? 'text' : 'password'"
                          v-model="tempPassword"
                          class="admin-profile-credential-input"
                          placeholder="Enter new password"
                          minlength="8"
                          title="Password must be at least 8 characters long"
                        >
                        <button
                          type="button"
                          class="admin-profile-toggle-password"
                          @click="togglePasswordVisibility"
                        >
                          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                      </div>
                      <div class="admin-profile-action-buttons">
                        <button class="admin-profile-cancel-btn" @click="cancelEditPassword">
                          <i class="bi bi-x"></i>
                        </button>
                        <button class="admin-profile-save-btn" @click="updatePassword">
                          <i class="bi bi-check2"></i>
                        </button>
                      </div>
                    </div>
                    <div v-else class="admin-profile-current-value">
                      <span>•••••••••</span>
                      <button class="admin-profile-edit-btn" @click="startEditingPassword">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                    <button @click="saveAccountSettings" class="admin-profile-save-button">Save Changes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Settings Section -->
          <div v-if="activeTab === 'company'" class="admin-profile-settings-section">
            <div class="admin-profile-info-section">
              <div class="admin-profile-info-grid">
                <!-- Queue Status -->
                <div class="admin-profile-info-item full-width">
                  <label>Queue Status:</label>
                  <select v-model="adminData.queue_status" class="admin-profile-select">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <!-- Location and Address -->
                <div class="admin-profile-info-item half-width">
                  <label>City/Province:</label>
                  <input
                    v-model="adminData.location"
                    type="text"
                    class="admin-profile-credential-input"
                    placeholder="Enter city or province"
                    pattern="[A-Za-z\s]+"
                    title="Only letters are allowed"
                  >
                </div>

                <div class="admin-profile-info-item half-width">
                  <label>Address:</label>
                  <input
                    v-model="adminData.address"
                    type="text"
                    class="admin-profile-credential-input"
                    placeholder="Enter complete address"
                  >
                </div>

                <!-- Building Type -->
                <div class="admin-profile-info-item full-width">
                  <label>Type of Building:</label>
                  <input
                    v-model="adminData.building_type"
                    type="text"
                    class="admin-profile-credential-input"
                    placeholder="Enter building type"
                    pattern="[A-Za-z\s]+"
                    title="Only letters are allowed"
                  >
                </div>

                <!-- Operating Hours -->
                <div class="admin-profile-info-item half-width">
                  <label>Operating Hours Start:</label>
                  <input
                    v-model="adminData.hours_start"
                    type="time"
                    class="admin-profile-credential-input"
                    @input="validateTime(adminData.hours_start, adminData.hours_end)"
                  >
                </div>

                <div class="admin-profile-info-item half-width">
                  <label>Operating Hours End:</label>
                  <input
                    v-model="adminData.hours_end"
                    type="time"
                    class="admin-profile-credential-input"
                    @input="validateTime(adminData.hours_start, adminData.hours_end)"
                  >
                </div>

                <!-- Description -->
                <div class="admin-profile-info-item full-width admin-profile-description">
                  <label>
                    Brief Description:
                    <span class="admin-profile-char-count">({{ characterCount }}/100)</span>
                  </label>
                  <textarea
                    v-model="adminData.description"
                    rows="3"
                    maxlength="100"
                    class="admin-profile-credential-input"
                    :class="{ 'admin-profile-invalid': characterCount === 0 }"
                    placeholder="Enter a brief description (max 100 characters)"
                  ></textarea>
                </div>

                <button @click="saveCompanySettings" class="admin-profile-save-button">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar Edit Modal -->
      <div class="admin-profile-modal" v-if="showAvatarModal">
        <div class="admin-profile-modal-content">
          <div class="admin-profile-modal-header">
            <h3>Change Profile Picture</h3>
            <button class="admin-profile-modal-close" @click="closeAvatarModal">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="admin-profile-modal-body">
            <div class="admin-profile-avatar-preview">
              <img
                :src="previewImage || avatarUrl"
                alt="Profile Picture Preview"
              >
            </div>
            <div class="admin-profile-upload-section">
              <label for="modal-photo-upload" class="admin-profile-upload-btn">
                <i class="bi bi-upload"></i>
                Choose Photo
              </label>
              <input
                id="modal-photo-upload"
                type="file"
                @change="handleImagePreview"
                accept="image/*"
                class="admin-profile-photo-input"
              >
              <p class="admin-profile-upload-info">
                Supported formats: JPG, PNG, GIF (max. 5MB)
              </p>
            </div>
          </div>
          <div class="admin-profile-modal-footer">
            <button
              class="admin-profile-delete-button"
              @click="deleteAvatar"
              v-if="adminData.avatar"
            >
              <i class="bi bi-trash"></i> Delete Photo
            </button>
            <div class="admin-profile-modal-actions">
              <button class="admin-profile-cancel-button" @click="closeAvatarModal">Cancel</button>
              <button class="admin-profile-save-button" @click="saveNewAvatar" :disabled="!selectedFile">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Alert Container -->
      <div class="admin-service-alert-container" v-if="success || error">
        <div v-if="success" class="admin-service-alert admin-service-alert-success">
          <i class="bi bi-check-circle"></i> {{ success }}
        </div>
        <div v-if="error" class="admin-service-alert admin-service-alert-danger">
          <i class="bi bi-exclamation-circle"></i> {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import AdminTopNavbar from './AdminTopNavbar.vue' // Import the top navbar component
import philippineLocations from '@/data/philippine-locations.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import axios from 'axios'

export default {
  name: 'AdminProfile',
  components: {
    AdminNavbar,
    AdminTopNavbar // Register the component
  },
  data() {
    return {
      // Initialize from localStorage or default to false
      isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      adminData: {
        name: '',
        email: '',
        description: '', // Initialize with empty string
        queue_status: 'active',
        location: '',
        address: '',
        building_type: '',
        avatar: '',
        hours_start: '',
        hours_end: ''
      },
      locations: philippineLocations,
      locationSearch: '',
      showLocationDropdown: false,
      filteredLocations: [],
      isEditingPassword: false,
      tempPassword: '',
      showPassword: false,
      activeTab: 'account',
      editingFields: {
        name: false,
        password: false,
        description: false,
       queue_status: false,
        location: false,
        address: false,
        building_type: false,
        hours_start: false,
        hours_end: false
      },
      tempFields: {
        name: '',
        email: '',
        password: '',
        description: '',
        queue_status: '',
        location: '',
        address: '',
        building_type: '',
        hours_start: '',
        hours_end: ''
      },
      showAvatarModal: false,
      previewImage: null,
      selectedFile: null,
      success: '',
      error: ''
    }
  },
  computed: {
    avatarUrl() {
        if (!this.adminData.avatar) {
            return require('@/images/default-avatar.svg');
        }

        // For local development with XAMPP
        return `https://flow-backend-yxdw.onrender.com${this.adminData.avatar}`;
    },
    characterCount() {
      return this.adminData.description ? this.adminData.description.length : 0;
    },
    isDescriptionValid() {
      return this.characterCount > 0 && this.characterCount <= 100;
    },
    currentStatus() {
      const status = this.adminData && this.adminData.queue_status ? this.adminData.queue_status : 'active';
      console.log('Computing currentStatus:', status, 'from adminData.queue_status:', this.adminData.queue_status);
      return status;
    }
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            this.error = 'Please select an image file (JPG, PNG, or GIF)';
            setTimeout(() => { this.error = null; }, 3000);
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post(
                '/flow-application-cc/api/adminprofile.php',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );            if (response.data.success) {
                this.adminData.avatar = response.data.avatar;
                this.success = 'Profile photo updated successfully';
                setTimeout(() => { this.success = null; }, 3000);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            this.error = 'Failed to upload profile photo';
            setTimeout(() => { this.error = null; }, 3000);
        }
    },
    async fetchProfile() {
        try {
            const response = await axios.get('/flow-application-cc/api/adminprofile.php', {
                withCredentials: true  // Important for sending cookies
            });

            if (response.data) {
                console.log('Fetched profile data:', response.data);
                this.adminData = {
                    ...this.adminData,
                    ...response.data,
                    description: response.data.description || ''
                };
                console.log('Updated adminData:', this.adminData);
                console.log('Queue status after fetch:', this.adminData.queue_status);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                // Redirect to login if unauthorized
                this.$router.push('/admin/login');            } else {
                console.error('Error fetching profile:', error);
                this.error = 'Failed to load profile data';
                setTimeout(() => { this.error = null; }, 3000);
            }
        }
    },    async saveChanges() {
        if (!this.isDescriptionValid) {
            this.error = 'Description must be at least 30 words';
            setTimeout(() => { this.error = null; }, 3000);
            return;
        }

        try {
            const response = await axios.put('/flow-application-cc/api/adminprofile.php',
                this.adminData,
                { withCredentials: true }
            );

            if (response.data.success) {
                this.success = 'Profile updated successfully';
                setTimeout(() => { this.success = null; }, 3000);
            } else {
                throw new Error(response.data.error || 'Failed to update profile');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.$router.push('/admin/login');
            } else {
                console.error('Error saving profile:', error);
                this.error = 'Failed to save profile changes';
                setTimeout(() => { this.error = null; }, 3000);
            }
        }
    },
    async saveAccountSettings() {
      // Validate name only
      const nameValidation = this.validateName(this.adminData.name);
      let passwordValidation = { valid: true };

      if (this.tempPassword) {
        passwordValidation = this.validatePassword(this.tempPassword);
      }      // Check for validation errors
      if (!nameValidation.valid) {
        this.error = nameValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }
      if (!passwordValidation.valid) {
        this.error = passwordValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }

      const accountData = {
        name: this.adminData.name
      };

      if (this.tempPassword) {
        accountData.password = this.tempPassword;
      }

      try {
        const response = await axios.put('/flow-application-cc/api/adminprofile.php',
          accountData,
          { withCredentials: true }
        );

        if (response.data.success) {
          this.success = 'Account settings updated successfully';
          setTimeout(() => { this.success = ''; }, 3000);
          this.tempPassword = '';
          this.isEditingPassword = false;
        }
      } catch (error) {
        console.error('Error saving account settings:', error);
        this.error = error.response?.data?.message || 'Failed to save account settings';
        setTimeout(() => { this.error = ''; }, 3000);
      }
    },
    async saveCompanySettings() {
      // Validate all company fields
      const locationValidation = this.validateLocation(this.adminData.location);
      const buildingTypeValidation = this.validateBuildingType(this.adminData.building_type);
      const timeValidation = this.validateTime(this.adminData.hours_start, this.adminData.hours_end);
      const descriptionValidation = this.validateDescription(this.adminData.description);      // Check for validation errors
      if (!locationValidation.valid) {
        this.error = locationValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }
      if (!buildingTypeValidation.valid) {
        this.error = buildingTypeValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }
      if (!timeValidation.valid) {
        this.error = timeValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }
      if (!descriptionValidation.valid) {
        this.error = descriptionValidation.message;
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }

      const companyData = {
        description: this.adminData.description,
        queue_status: this.adminData.queue_status,
        location: this.adminData.location,
        address: this.adminData.address,
        building_type: this.adminData.building_type,
        hours_start: this.adminData.hours_start,
        hours_end: this.adminData.hours_end
      };

      try {
        const response = await axios.put('/flow-application-cc/api/adminprofile.php',
          companyData,
          { withCredentials: true }
        );

        if (response.data.success) {
          this.success = 'Company settings updated successfully';
          setTimeout(() => { this.success = ''; }, 3000);
        }
      } catch (error) {
        console.error('Error saving company settings:', error);
        if (error.response?.status === 401) {
          this.$router.push('/admin/login');
        } else {
          this.error = error.response?.data?.message || 'Failed to save company settings';
          setTimeout(() => { this.error = ''; }, 3000);
        }
      }
    },
    filterLocations() {
      if (!this.locationSearch) {
        this.filteredLocations = [];
        this.showLocationDropdown = false;
        return;
      }

      this.filteredLocations = this.locations.filter(location =>
        location.toLowerCase().includes(this.locationSearch.toLowerCase())
      );
      this.showLocationDropdown = true;
    },
    selectLocation(location) {
      this.adminData.location = location;
      this.locationSearch = location;
      this.showLocationDropdown = false;
    },
    startEditingPassword() {
      this.tempPassword = '';
      this.isEditingPassword = true;
    },
    updatePassword() {
      if (this.tempPassword) {
        try {
          this.saveAccountSettings();
          this.isEditingPassword = false;
        } catch (error) {
          console.error('Error updating password:', error);
          this.error = 'Failed to update password';
          setTimeout(() => { this.error = null; }, 3000);
        }
      } else {
        this.isEditingPassword = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    startEditing(field) {
      this.editingFields[field] = true;
      this.tempFields[field] = this.adminData[field];
    },
    cancelEdit(field) {
      this.editingFields[field] = false;
      this.tempFields[field] = '';
    },    updateField(field) {
      if (field === 'name' && !this.validateName(this.tempFields.name)) {
        this.error = 'Establishment name can only contain letters';
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }
      if (this.tempFields[field] !== '') {
        this.adminData[field] = this.tempFields[field];
      }
      this.editingFields[field] = false;
    },
    openAvatarModal() {
      this.showAvatarModal = true;
      this.selectedFile = null;
      this.previewImage = null;
    },
    closeAvatarModal() {
      this.showAvatarModal = false;
      this.selectedFile = null;
      this.previewImage = null;
    },
    handleImagePreview(event) {
      const file = event.target.files[0];
      if (!file) return;      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Please select an image file (JPG, PNG, or GIF)';
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size should not exceed 5MB';
        setTimeout(() => { this.error = null; }, 3000);
        return;
      }

      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(file);
    },
    async saveNewAvatar() {
        if (!this.selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', this.selectedFile);

        try {
            const response = await axios.post(
                '/flow-application-cc/api/adminprofile.php',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );            if (response.data.success) {
                this.adminData.avatar = response.data.avatar;
                this.previewImage = null;
                this.selectedFile = null;
                this.closeAvatarModal();
                this.success = 'Profile photo updated successfully';
                setTimeout(() => { this.success = null; }, 3000);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.$router.push('/admin/login');
            } else {
                console.error('Error uploading image:', error);
                this.error = 'Failed to upload profile photo';
                setTimeout(() => { this.error = null; }, 3000);
            }
        }
    },
    async deleteAvatar() {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            try {
                const response = await axios.delete('/flow-application-cc/api/adminprofile.php', {
                    data: { action: 'delete_avatar' },
                    withCredentials: true
                });                if (response.data.success) {
                    this.adminData.avatar = null;
                    this.closeAvatarModal();
                    this.success = 'Profile photo deleted successfully';
                    setTimeout(() => { this.success = null; }, 3000);
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    this.$router.push('/admin/login');
                } else {                    console.error('Error deleting avatar:', error);
                    this.error = 'Failed to delete profile photo';
                    setTimeout(() => { this.error = null; }, 3000);
                }
            }
        }
    },    toggleSidebar(collapsed) {
      const newState = collapsed !== undefined ? collapsed : !this.isSidebarCollapsed;
      this.isSidebarCollapsed = newState;

      // Save to localStorage for persistence
      localStorage.setItem('sidebarCollapsed', newState);
    },

    handleMobileSidebarToggle() {
      // Delegate mobile sidebar toggle to AdminNavbar component
      this.$refs.adminNavbar?.toggleSidebar();
    },
    changeQueueStatus(newStatus) {
      console.log('AdminProfile: Received status change event:', newStatus);
      console.log('AdminProfile: Current status before change:', this.adminData.queue_status);

      // Update the status immediately
      this.adminData.queue_status = newStatus;

      console.log('AdminProfile: Status after change:', this.adminData.queue_status);

      // Force Vue to update the component
      this.$nextTick(() => {
        console.log('AdminProfile: After nextTick, status is:', this.adminData.queue_status);
      });

      // Save the change to the backend
      this.saveCompanySettings().catch(error => {
        console.error('Failed to save status change:', error);
      });
    },

    // Helper methods for status display
    getStatusIconClass(status) {
      const statusClasses = {
        'active': 'text-success',
        'inactive': 'text-danger',
        'maintenance': 'text-warning'
      };
      return statusClasses[status] || 'text-success';
    },

    getStatusDisplayText(status) {
      const statusTexts = {
        'active': 'Active',
        'inactive': 'Inactive',
        'maintenance': 'Maintenance'
      };
      return statusTexts[status] || 'Active';
    },

    // Add these validation methods in the methods section
    validateName(name) {
      if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Name is required' };
      }
      if (!/^[A-Za-z\s]{2,50}$/.test(name)) {
        return { valid: false, message: 'Name must contain only letters and spaces (2-50 characters)' };
      }
      return { valid: true };
    },

    validateEmail(email) {
      if (!email || email.trim().length === 0) {
        return { valid: false, message: 'Email is required' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valid: false, message: 'Please enter a valid email address' };
      }
      return { valid: true };
    },

    validatePassword(password) {
      if (!password) {
        return { valid: false, message: 'Password is required' };
      }
      if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        return { valid: false, message: 'Password must contain at least one letter and one number' };
      }
      return { valid: true };
    },

    validateLocation(location) {
      if (!location || location.trim().length === 0) {
        return { valid: false, message: 'Location is required' };
      }
      if (!/^[A-Za-z\s]{2,100}$/.test(location)) {
        return { valid: false, message: 'Location must contain only letters and spaces' };
      }
      return { valid: true };
    },

    validateBuildingType(type) {
      if (!type || type.trim().length === 0) {
        return { valid: false, message: 'Building type is required' };
      }
      if (!/^[A-Za-z\s]{2,50}$/.test(type)) {
        return { valid: false, message: 'Building type must contain only letters and spaces' };
      }
      return { valid: true };
    },

    validateTime(start, end) {
      if (!start || !end) {
        return { valid: false, message: 'Both start and end times are required' };
      }
      
      const startTime = new Date(`2000-01-01T${start}`);
      const endTime = new Date(`2000-01-01T${end}`);
      
      if (endTime <= startTime) {
        return { valid: false, message: 'End time must be after start time' };
      }
      return { valid: true };
    },    validateDescription(description) {
      if (!description || description.trim().length === 0) {
        return { valid: false, message: 'Description is required' };
      }
      if (description.length > 100) {
        return { valid: false, message: 'Description must not exceed 100 characters' };
      }
      return { valid: true };
    },

    formatTime(time) {
      if (!time) return '';
      
      // Parse the time string (format: HH:MM)
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      
      // Convert to 12-hour format
      let hour12 = hour24;
      let ampm = 'AM';
      
      if (hour24 === 0) {
        hour12 = 12; // Midnight
      } else if (hour24 === 12) {
        ampm = 'PM'; // Noon
      } else if (hour24 > 12) {
        hour12 = hour24 - 12;
        ampm = 'PM';
      }
      
      return `${hour12}:${minutes} ${ampm}`;
    }
  },
  watch: {
    'adminData.queue_status': {
      handler(newStatus, oldStatus) {
        console.log('AdminProfile: queue_status changed from', oldStatus, 'to', newStatus);
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-admin/adminprofile.css';
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/content.css';
</style>