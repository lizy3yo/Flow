<template>
  <div class="user-page-container" :class="{ 'user-sidebar-collapsed': isSidebarCollapsed }">
    <UserTopNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      @sidebar-toggle="handleSidebarToggle"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
    />
    <UserNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :sidebarOpen="mobileSidebarOpen"
      @update:sidebarOpen="handleMobileSidebarToggle" 
    />
    <main class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">
      <div class="user-profile-container">
        <!-- Profile Header Card -->
        <div class="profile-header-card">
          <div class="profile-avatar-section">
            <div class="profile-avatar-wrapper" @click="openAvatarModal">
              <img
                :src="avatarUrl"
                alt="Profile Picture"
                class="profile-avatar-image"
              >
              <div class="avatar-edit-overlay">
                <i class="bi bi-camera"></i>
              </div>
            </div>
          </div>
          <div class="profile-info-section">            
            <div class="profile-name">
              <h1>{{ capitalizeFirstLetter(userData.first_name) }} {{ capitalizeFirstLetter(userData.last_name) }}</h1>
              <span class="profile-role">{{ userData.role }}</span>
            </div>
            <div class="profile-contact">
              <div class="contact-item">
                <i class="bi bi-envelope"></i>
                <span>{{ userData.email }}</span>
              </div>
            </div>
          </div>
          <!-- Queue Status Warning -->
          <div v-if="hasActiveQueue" class="queue-status-warning">
            <i class="bi bi-exclamation-triangle"></i>
            <span>Profile editing is disabled while you have an active queue</span>
          </div>
        </div>

        <!-- Account Settings Card -->
        <div class="account-settings-card">
          <div class="card-header">
            <h2>
              <i class="bi bi-gear"></i>
              Account Settings
            </h2>
            <p class="card-subtitle">Manage your personal information and account preferences</p>
          </div>

          <div class="settings-form">
            <!-- First Name -->
            <div class="form-field">
              <label class="field-label">
                <i class="bi bi-person"></i>
                First Name
              </label>
              <div class="field-content">
                <div v-if="editingFields.first_name && !hasActiveQueue" class="edit-mode">
                  <div class="input-group">
                    <input
                      v-model="tempFields.first_name"
                      type="text"
                      class="form-input"
                      placeholder="Enter first name"
                    >
                    <div class="action-buttons">
                      <button class="btn-cancel" @click="cancelEdit('first_name')" title="Cancel">
                        <i class="bi bi-x"></i>
                      </button>
                      <button class="btn-save" @click="updateField('first_name')" title="Save">
                        <i class="bi bi-check2"></i>
                      </button>
                    </div>
                  </div>
                </div>                <div v-else class="view-mode">
                  <span class="field-value">{{ capitalizeFirstLetter(userData.first_name) || 'Not set' }}</span>
                  <button
                    class="btn-edit"
                    @click="startEditing('first_name')"
                    :disabled="hasActiveQueue"
                    :title="hasActiveQueue ? 'Cannot edit while in queue' : 'Edit first name'"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Last Name -->
            <div class="form-field">
              <label class="field-label">
                <i class="bi bi-person"></i>
                Last Name
              </label>
              <div class="field-content">
                <div v-if="editingFields.last_name && !hasActiveQueue" class="edit-mode">
                  <div class="input-group">
                    <input
                      v-model="tempFields.last_name"
                      type="text"
                      class="form-input"
                      placeholder="Enter last name"
                    >
                    <div class="action-buttons">
                      <button class="btn-cancel" @click="cancelEdit('last_name')" title="Cancel">
                        <i class="bi bi-x"></i>
                      </button>
                      <button class="btn-save" @click="updateField('last_name')" title="Save">
                        <i class="bi bi-check2"></i>
                      </button>
                    </div>
                  </div>
                </div>                <div v-else class="view-mode">
                  <span class="field-value">{{ capitalizeFirstLetter(userData.last_name) || 'Not set' }}</span>
                  <button
                    class="btn-edit"
                    @click="startEditing('last_name')"
                    :disabled="hasActiveQueue"
                    :title="hasActiveQueue ? 'Cannot edit while in queue' : 'Edit last name'"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="form-field">
              <label class="field-label">
                <i class="bi bi-envelope"></i>
                Email Address
              </label>
              <div class="field-content">                <div v-if="isEditingEmail && !hasActiveQueue" class="edit-mode">
                  <div class="input-group">
                    <input
                      v-model="tempEmail"
                      type="email"
                      class="form-input"
                      :class="{ 'error': emailError }"
                      placeholder="Enter new email"
                      @input="checkEmailValidity"
                    >
                    <span v-if="emailError" class="error-message">{{ emailError }}</span>
                    <div class="action-buttons">
                      <button class="btn-cancel" @click="cancelEditEmail" title="Cancel">
                        <i class="bi bi-x"></i>
                      </button>
                      <button class="btn-save" @click="updateEmail" title="Save">
                        <i class="bi bi-check2"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="view-mode">
                  <span class="field-value">{{ userData.email || 'Not set' }}</span>
                  <button
                    class="btn-edit"
                    @click="startEditingEmail"
                    :disabled="hasActiveQueue"
                    :title="hasActiveQueue ? 'Cannot edit while in queue' : 'Edit email'"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="form-field">
              <label class="field-label">
                <i class="bi bi-lock"></i>
                Password
              </label>
              <div class="field-content">                <div v-if="isEditingPassword && !hasActiveQueue" class="edit-mode">
                  <div class="input-group">
                    <div class="password-input-wrapper">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="tempPassword"
                        class="form-input"
                        :class="{ 'error': passwordError }"
                        placeholder="Enter new password"
                        @input="checkPasswordValidity"
                      >
                      <button
                        type="button"
                        class="password-toggle"
                        @click="togglePasswordVisibility"
                        title="Toggle password visibility"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                    <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
                    <div class="action-buttons">
                      <button class="btn-cancel" @click="cancelEditPassword" title="Cancel">
                        <i class="bi bi-x"></i>
                      </button>
                      <button class="btn-save" @click="updatePassword" title="Save">
                        <i class="bi bi-check2"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="view-mode">
                  <span class="field-value">•••••••••</span>
                  <button
                    class="btn-edit"
                    @click="startEditingPassword"
                    :disabled="hasActiveQueue"
                    :title="hasActiveQueue ? 'Cannot edit while in queue' : 'Change password'"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar Edit Modal -->
      <div class="avatar-modal-overlay" v-if="showAvatarModal" @click="closeAvatarModal">
        <div class="avatar-modal" @click.stop>
          <div class="modal-header">
            <h3>
              <i class="bi bi-camera"></i>
              Change Profile Picture
            </h3>
            <button class="modal-close" @click="closeAvatarModal" title="Close">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="avatar-preview-section">
              <div class="avatar-preview">
                <img
                  :src="previewImage || avatarUrl"
                  alt="Profile Picture Preview"
                >
              </div>
            </div>

            <div class="upload-section">
              <label for="modal-photo-upload" class="upload-btn">
                <i class="bi bi-upload"></i>
                Choose Photo
              </label>
              <input
                id="modal-photo-upload"
                type="file"
                @change="handleImagePreview"
                accept="image/*"
                class="file-input"
              >
              <p class="upload-info">
                Supported formats: JPG, PNG, GIF (max. 5MB)
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-actions">
              <button class="btn-secondary" @click="closeAvatarModal">
                Cancel
              </button>
              <button
                v-if="userData.avatar"
                class="btn-delete"
                @click="deleteAvatar"
                title="Delete current photo"
              >
                <i class="bi bi-trash"></i>
                Delete Photo
              </button>
              <button
                class="btn-primary"
                @click="saveNewAvatar"
                :disabled="!selectedFile || isUploading"
              >
                <i v-if="isUploading" class="bi bi-hourglass-split"></i>
                <i v-else class="bi bi-check2"></i>
                {{ isUploading ? 'Uploading...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Alert Container -->
      <div class="user-service-alert-container" v-if="success || error">
        <div v-if="success" class="user-service-alert user-service-alert-success">
          <i class="bi bi-check-circle"></i>
          <span>{{ success }}</span>
        </div>
        <div v-if="error" class="user-service-alert user-service-alert-danger">
          <i class="bi bi-exclamation-triangle"></i>
          <span>{{ error }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import UserNavbar from './UserNavbar.vue'
import UserTopNavbar from './UserTopNavbar.vue'
import axios from 'axios'

export default {
  name: 'UserProfile',
  components: {
    UserNavbar,
    UserTopNavbar
  },  data() {
    return {
      userData: {
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        avatar: null
      },
      isSidebarCollapsed: false,
      mobileSidebarOpen: false, // For mobile sidebar state
      isEditingEmail: false,
      isEditingPassword: false,
      tempEmail: '',
      tempPassword: '',
      showPassword: false,
      passwordError: '',
      emailError: '',
      editingFields: {
        first_name: false,
        last_name: false
      },
      tempFields: {
        first_name: '',
        last_name: ''
      },
      showAvatarModal: false,
      previewImage: null,
      selectedFile: null,
      isLoading: false,
      isUploading: false,      userQueues: [],
      queueCheckInterval: null,
      success: '',
      error: ''
    }
  },
  computed: {
    avatarUrl() {
      if (!this.userData.avatar) {
        return require('@/images/default-avatar.svg');
      }
      // Fix the URL construction for XAMPP
      return `http://localhost${this.userData.avatar}`;
    },    userProfile() {
      return {
        name: `${this.capitalizeFirstLetter(this.userData.first_name)} ${this.capitalizeFirstLetter(this.userData.last_name)}`.trim() || 'User',
        email: this.userData.email,
        avatar: this.userData.avatar
      };
    },
    hasActiveQueue() {
      return this.userQueues.some(queue =>
        ['pending', 'waiting', 'serving', 'scheduled'].includes(queue.status.toLowerCase())
      );
    }
  },
  mounted() {
    this.fetchProfile();
    this.fetchUserQueues();
    this.startQueuePolling();

    // Initialize sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = JSON.parse(savedState);
    }
  },
  beforeUnmount() {
    this.stopQueuePolling();
  },  methods: {
    // Helper method to capitalize first letter of a string
    capitalizeFirstLetter(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    async fetchProfile() {
      try {
        const response = await axios.get('/flow-application-cc/api/user-profile.php', {
          withCredentials: true
        })
        if (response.data) {
          console.log('Profile data:', response.data); // Add this
          this.userData = response.data;
          console.log('Avatar path:', this.userData.avatar); // Add this
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },    startEditing(field) {
      this.editingFields[field] = true;
      this.tempFields[field] = this.userData[field];
    },
    cancelEdit(field) {
      this.editingFields[field] = false;
      this.tempFields[field] = '';
    },async updateField(field) {
      if (this.tempFields[field] !== '') {
        // Capitalize first letter if it's a name field
        const fieldValue = (field === 'first_name' || field === 'last_name') ? 
          this.capitalizeFirstLetter(this.tempFields[field]) : this.tempFields[field];
          try {
          const response = await axios.put('/flow-application-cc/api/user-profile.php', {
            [field]: fieldValue
          }, {
            withCredentials: true
          });
            if (response.data.success) {
            // Update with properly capitalized value if it's a name field
            this.userData[field] = (field === 'first_name' || field === 'last_name') ? 
              this.capitalizeFirstLetter(this.tempFields[field]) : this.tempFields[field];
              this.editingFields[field] = false;
            this.success = `${this.capitalizeFirstLetter(field.replace('_', ' '))} updated successfully.`;
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              this.success = '';
            }, 3000);
          }        } catch (error) {
          console.error(`Error updating ${field}:`, error);
          this.error = `Failed to update ${this.capitalizeFirstLetter(field.replace('_', ' '))}`;
          
          // Clear error message after 3 seconds
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      }      this.editingFields[field] = false;
    },startEditingEmail() {
      this.tempEmail = this.userData.email;
      this.emailError = '';
      this.isEditingEmail = true;
    },
    checkEmailValidity() {
      this.validateEmail();
    },    cancelEditEmail() {
      this.isEditingEmail = false;
      this.tempEmail = '';
      this.emailError = '';
    },    async updateEmail() {
      // First validate the email
      if (!this.validateEmail()) {
        // Don't proceed if validation fails
        return;
      }
      
      if (this.tempEmail !== this.userData.email) {
        try {
          const response = await axios.put('/flow-application-cc/api/user-profile.php', {
            email: this.tempEmail
          }, {
            withCredentials: true
          });

          if (response.data.success) {
            this.userData.email = this.tempEmail;
            this.isEditingEmail = false;
            this.success = 'Email address updated successfully.';
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              this.success = '';
            }, 3000);
          }
        } catch (error) {
          console.error('Error updating email:', error);
          this.error = 'Failed to update email address';
          
          // Clear error message after 3 seconds
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      } else {
        this.isEditingEmail = false;
      }
    },startEditingPassword() {
      this.tempPassword = '';
      this.passwordError = '';
      this.isEditingPassword = true;
    },    checkPasswordValidity() {
      this.validatePassword();
    },
    cancelEditPassword() {
      this.isEditingPassword = false;
      this.tempPassword = '';
      this.passwordError = '';
    },async updatePassword() {
      // First validate the password
      if (!this.validatePassword()) {
        // Don't proceed if validation fails
        return;
      }
      
      try {
        const response = await axios.put('/flow-application-cc/api/user-profile.php', {
          password: this.tempPassword
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          this.isEditingPassword = false;
          this.tempPassword = '';
          this.success = 'Password updated successfully.';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.success = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating password:', error);
        this.error = 'Failed to update password';
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    validatePassword() {
      if (!this.tempPassword) {
        this.passwordError = 'Required';
        return false;
      } else if (this.tempPassword.length < 8) {
        this.passwordError = 'Password must be at least 8 characters';
        return false;
      } else if (this.tempPassword.length > 50) {
        this.passwordError = 'Password must be less than 50 characters';
        return false;
      } else if (!/[A-Z]/.test(this.tempPassword)) {
        this.passwordError = 'Password must contain at least one uppercase letter';
        return false;
      } else if (!/[0-9]/.test(this.tempPassword)) {
        this.passwordError = 'Password must contain at least one number';
        return false;
      } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(this.tempPassword)) {
        this.passwordError = 'Password must contain at least one special character';
        return false;
      } else {
        this.passwordError = '';
        return true;
      }
    },
    validateEmail() {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!this.tempEmail) {
        this.emailError = 'Required';
        return false;
      } else if (!emailRegex.test(this.tempEmail)) {
        this.emailError = 'Please enter a valid email address';
        return false;
      } else if (this.tempEmail.length > 100) {
        this.emailError = 'Email address is too long';
        return false;
      } else {
        this.emailError = '';
        return true;
      }
    },
    openAvatarModal() {
      this.showAvatarModal = true;
      this.selectedFile = null;
      this.previewImage = null;
    },
    closeAvatarModal() {
      if (this.previewImage) {
        URL.revokeObjectURL(this.previewImage);
      }
      this.showAvatarModal = false;
      this.selectedFile = null;
      this.previewImage = null;
    },
    handleImagePreview(event) {
      if (this.previewImage) {
        URL.revokeObjectURL(this.previewImage);
      }

      const file = event.target.files[0];
      if (!file) return;      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Please select an image file (JPG, PNG, or GIF)';
        setTimeout(() => {
          this.error = '';
        }, 3000);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size should not exceed 5MB';
        setTimeout(() => {
          this.error = '';
        }, 3000);
        return;
      }

      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(file);
    },    async saveNewAvatar() {
      if (!this.selectedFile) return;
      this.isUploading = true;

      try {
        const formData = new FormData();
        formData.append('avatar', this.selectedFile);

        const response = await axios.post(
          '/flow-application-cc/api/user-profile.php',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          this.userData.avatar = response.data.avatar;
          this.closeAvatarModal();
          this.success = 'Profile photo updated successfully';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.success = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        this.error = 'Failed to upload profile photo';
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      } finally {
        this.isUploading = false;
      }
    },    async deleteAvatar() {
      if (confirm('Are you sure you want to delete your profile picture?')) {
        try {
          const response = await axios.delete('/flow-application-cc/api/user-profile.php', {
            data: { action: 'delete_avatar' },
            withCredentials: true
          });

          if (response.data.success) {
            this.userData.avatar = null;
            this.closeAvatarModal();
            this.success = 'Profile photo deleted successfully';
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              this.success = '';
            }, 3000);
          }
        } catch (error) {
          console.error('Error deleting avatar:', error);
          this.error = 'Failed to delete profile photo';
          
          // Clear error message after 3 seconds
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      }
    },
    async fetchUserQueues() {
      try {
        const response = await axios.get('/flow-application-cc/api/userappointments.php', {
          withCredentials: true
        });
        this.userQueues = response.data || [];
      } catch (error) {
        console.error('Error fetching user queues:', error);
        this.userQueues = [];
      }
    },
    startQueuePolling() {
      // Check queue status every 30 seconds
      this.queueCheckInterval = setInterval(() => {
        this.fetchUserQueues();
      }, 30000);
    },
    stopQueuePolling() {
      if (this.queueCheckInterval) {
        clearInterval(this.queueCheckInterval);
        this.queueCheckInterval = null;
      }
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
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/content.css';
@import '@/styles/mainpage-user/userprofile.css';
</style>
