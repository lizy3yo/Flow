<template>
  <div class="admin-login">
    <section class="login-content">
      <h1>Welcome Back!<br>Ready to Flow?</h1>
    </section>

    <section class="admin-login-form-container">
      <h2><img src="@/images/logo2.0.png" alt="Flow Logo" style="width: 2rem; height: 2rem;"> Flow</h2>
      <h3>Admin Login</h3>

      <form @submit.prevent="handleSubmit" class="admin-login-forms">
        <!-- Keep your existing form structure -->
        <div class="admin-form-group-content">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            placeholder="Enter your email"
            required
            autocomplete="email"
          >
        </div>

        <div class="admin-form-group-content">
          <label for="password">Password</label>
          <div class="password-input-container">
              <input
                  id="password"
                  v-model.trim="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
              >
              <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPassword = !showPassword"
              >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
          </div>
  
        </div>
        
        <div class="buttons-container">
          <button type="button" class="back-button" @click="goBack">🡐 Back</button>
          <button 
            type="submit" 
            class="admin-submit-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login as Admin' }}
          </button>
        </div>

        <div 
          v-if="message" 
          :class="['alert', success ? 'alert-success' : 'alert-danger']"
        >
          {{ message }}
        </div>
      </form>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { isAdminLoggedIn } from '@/utils/auth';

export default {
    name: 'AdminLoginPage',
    created() {
        // Redirect if already logged in
        if (isAdminLoggedIn()) {
            this.$router.push('/admin/dashboard');
        }
    },
    data() {
        return {
            email: '',
            password: '',
            message: '',
            success: false,
            isLoading: false,
            showPassword: false
        }
    },
    methods: {
        async handleSubmit() {
            this.isLoading = true;
            this.message = '';
            
            try {
                // Use the same backend URL as other components
                const response = await axios.post('https://flow-backend-yxdw.onrender.com/admin-login.php', {
    email: this.email,
    password: this.password
}, {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
                
                console.log('Login response:', response.data);
                
                const { data } = response;
                this.success = data.success;
                this.message = data.message;
                
                if (data.success) {
                    localStorage.clear();
                    
                    localStorage.setItem('userType', 'admin');
                    localStorage.setItem('adminId', data.admin.id);
                    localStorage.setItem('adminSessionToken', data.session_token);
                    localStorage.setItem('adminData', JSON.stringify(data.admin));
                    localStorage.setItem('admin', 'true');
                    
                    console.log('Login successful, redirecting...');
                    
                    await this.$router.push('/admin/dashboard');
                }
            } catch (error) {
                console.error('Login error details:', error.response || error);
                this.success = false;
                this.message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            } finally {
                this.isLoading = false;
            }
        },
        goBack() {
            this.$router.push('/login');
        }
    }
};
</script>

<style>
@import '@/styles/authentication/adminlogin.css';
</style>
