<template>
    <div class="user-login">
        <div class="login-content">
            <button class="main-back-button" @click="goBackToSelector" title="Back to Login Selector">
                <i class="bi bi-arrow-left"></i> Back
            </button>
            <h1>Welcome Back!  <br> Ready to Flow?</h1>
            <p>Don't have an account? <router-link to="/signup/user"> Sign up now</router-link></p>
        </div>
        <div class="user-login-form-container">
            <!-- Hide main branding elements when in password setup mode to avoid duplication -->
            <h2 v-if="loginMethod !== 'setup-password'"><img src="@/images/logo2.0.png" alt="Flow Logo" style="width: 2rem; height: 2rem;"> Flow</h2>
            <h3 v-if="loginMethod !== 'setup-password'">User Login</h3>

            <!-- Login option buttons - only visible when no method is selected -->            <div v-if="loginMethod === null" class="login-options">
                <button
                    class="login-option-btn"
                    @click="loginMethod = 'email'"
                >
                    <i class="bi bi-envelope"></i>
                    <span>Login with Email</span>
                </button>

                <div class="login-option-separator">
                    <span>or</span>
                </div>

                <button
                    class="login-option-btn"
                    @click="handleGoogleLogin"
                >
                    <i class="bi bi-google"></i>
                    <span>Login with Google</span>
                </button>
            </div>

            <!-- Email login form - only visible when email method is selected -->
            <form v-if="loginMethod === 'email'" @submit.prevent="handleSubmit" class="user-login-forms">
                <div class="user-form-group-content">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        v-model="email"
                        placeholder="Enter your email"
                        required
                    >
                </div>

                <div class="user-form-group-content">
                    <label for="password">Password</label>
                    <div class="password-input-container">
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            id="password"
                            v-model="password"
                            placeholder="Enter your password"
                            required
                        >
                        <button
                            type="button"
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                        >
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                    </div>
                    <div class="forgot-password-container">
                        <router-link
                            :to="forgotPasswordLink"
                            class="forgot-password-link"
                        >
                            Forgot password?
                        </router-link>
                    </div>
                </div>

                <div class="buttons-container">
                    <button type="button" class="back-button" @click="resetLoginMethod">🡐 Back</button>
                    <button type="submit" class="user-submit-btn">Login</button>
                </div>
            </form>            <!-- Set up password option - only visible when user needs to set up a password -->
            <div v-else-if="loginMethod === 'setup-password'" class="setup-password-container">
                <!-- 1. Company branding - Flow logo at the very top -->
                <div class="setup-password-branding">
                    <h2><img src="@/images/logo2.0.png" alt="Flow Logo" style="width: 2rem; height: 2rem;"> Flow</h2>
                </div>

                <!-- 2. Page indicator - "User Login" text -->
                <div class="setup-password-page-indicator">
                    <h3>User Login</h3>
                </div>

                <!-- 3. "Set Up Your Password" heading - main form title -->
                <div class="setup-password-heading">
                    <h4>Set Up Your Password</h4>
                </div>

                <!-- 4. Descriptive text - explanation paragraph -->
                <div class="setup-password-description">
                    <p>Please set up a password for your account to enable manual login in the future.</p>
                </div>

                <!-- 5. Form fields - password inputs with labels -->
                <form @submit.prevent="handlePasswordSetup" class="setup-password-form">
                    <div class="user-form-group-content">
                        <label for="newPassword">New Password</label>                        <div class="password-input-container">
                            <input
                                :type="showPassword ? 'text' : 'password'"
                                id="newPassword"
                                v-model="newPassword"
                                placeholder="Enter your new password"
                                @input="checkPasswordValidity"
                                :class="{ 'error-input': passwordError }"
                                required
                            >
                            <button
                                type="button"
                                class="toggle-password"
                                @click="showPassword = !showPassword"
                            >
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                        <div v-if="passwordError" class="password-error-message">
                            {{ passwordError }}
                        </div>
                    </div>

                    <div class="user-form-group-content">
                        <label for="confirmPassword">Confirm Password</label>
                        <div class="password-input-container">
                            <input
                                :type="showPassword ? 'text' : 'password'"
                                id="confirmPassword"
                                v-model="confirmPassword"
                                placeholder="Confirm your password"
                                required
                            >
                        </div>
                    </div>                    <!-- 6. Action buttons - Set Password and Back buttons -->
                    <div class="setup-password-buttons">
                        <button type="button" class="setup-back-button" @click="resetLoginMethod">🡐 Back</button>
                        <button type="submit" class="user-submit-btn">Set Password</button>
                    </div>
                </form>
                
                <!-- Message display inside setup password container -->
                <div v-if="loginMethod === 'setup-password' && message" :class="['alert', success ? 'alert-success' : 'alert-danger']">
                    {{ message }}
                </div>
            </div>

            <!-- Message display for other login methods -->
            <div v-if="loginMethod !== 'setup-password' && message" :class="['alert', success ? 'alert-success' : 'alert-danger']">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { googleAuthCodeLogin } from 'vue3-google-login';

export default {
    name: 'UserLoginPage',
    data() {
        return {
            email: '',
            password: '',
            message: '',
            success: false,
            showPassword: false,
            loginMethod: null,
            googleClientId: '423373752798-3lmutkhmfcs5a646l1up4gceciintqim.apps.googleusercontent.com',
            newPassword: '',
            confirmPassword: '',
            passwordError: '',
            tempUserId: null,
            userEmail: '',
            tempLoginData: null
        }
    },
    computed: {
        forgotPasswordLink() {
            if (this.email && this.validateEmail(this.email)) {
                return `/forgot-password?email=${encodeURIComponent(this.email)}`;
            }
            return '/forgot-password';
        }
    },
    watch: {
        email(newVal) {
            if (newVal && !this.validateEmail(newVal)) {
                this.message = 'Please enter a valid email address';
                this.success = false;
            } else {
                this.message = '';
            }
        }
    },
    methods: {
        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        validatePassword(password) {
            if (!password) {
                this.passwordError = 'Required';
                return false;
            } else if (password.length < 8) {
                this.passwordError = 'Password must be at least 8 characters';
                return false;
            } else if (password.length > 50) {
                this.passwordError = 'Password must be less than 50 characters';
                return false;
            } else if (!/[A-Z]/.test(password)) {
                this.passwordError = 'Password must contain at least one uppercase letter';
                return false;
            } else if (!/[0-9]/.test(password)) {
                this.passwordError = 'Password must contain at least one number';
                return false;
            } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
                this.passwordError = 'Password must contain at least one special character';
                return false;
            } else {
                this.passwordError = '';
                return true;
            }
        },
        async handleSubmit() {
            try {
                this.userEmail = this.email;

                const response = await axios.post('https://flow-backend-yxdw.onrender.com/login.php', {
                    email: this.email,
                    password: this.password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                const { data } = response;

                if (data.success) {
                    // Complete login directly without OTP
                    localStorage.clear();
                    localStorage.setItem('userType', 'user');
                    localStorage.setItem('userId', data.user_id);
                    localStorage.setItem('userSessionToken', data.session_token);
                    localStorage.setItem('userData', JSON.stringify(data.user));

                    await this.$router.push('/user/dashboard');
                } else {
                    this.success = false;
                    this.message = data.message;
                }
            } catch (error) {
                this.success = false;
                this.message = error.response?.data?.message || 'Login failed. Please check your credentials.';
                console.error('Login error:', error);
            }
        },

        async handleGoogleLogin() {
            try {
                const googleUser = await googleAuthCodeLogin();

                const response = await axios.post('https://flow-backend-yxdw.onrender.com/google-login.php', {
                    token: googleUser.code
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (response.data.success) {
                    if (response.data.needs_password) {
                        // Store temporary user ID and switch to password setup
                        this.tempUserId = response.data.user_id;
                        this.loginMethod = 'setup-password';
                    } else {
                        // Clear any old data first
                        localStorage.clear();

                        // Store user data consistently
                        localStorage.setItem('userType', 'user');
                        localStorage.setItem('userId', response.data.user_id);
                        localStorage.setItem('userSessionToken', response.data.session_token);
                        localStorage.setItem('userData', JSON.stringify(response.data.user));

                        await this.$router.push('/user/dashboard');
                    }
                }
            } catch (error) {
                console.error('Google login error:', error);
                this.success = false;
                this.message = error.message || 'Google login failed. Please try again.';
            }
        },

        async handlePasswordSetup() {
            if (this.newPassword !== this.confirmPassword) {
                this.success = false;
                this.message = 'Passwords do not match';
                return;
            }

            // Validate new password
            const isPasswordValid = this.validatePassword(this.newPassword);
            if (!isPasswordValid) {
                this.success = false;
                this.message = this.passwordError;
                return;
            }

            try {
                const response = await axios.post('https://flow-backend-yxdw.onrender.com/setup-password.php', {
                    user_id: this.tempUserId,
                    password: this.newPassword
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (response.data.success) {
                    this.success = true;
                    this.message = 'Password set up successfully!';
                    this.loginMethod = null; // Reset login method
                    this.newPassword = '';
                    this.confirmPassword = '';

                    // Optionally, log the user in automatically after password setup
                    await this.handleSubmit();
                } else {
                    this.success = false;
                    this.message = response.data.message || 'Failed to set up password';
                }
            } catch (error) {
                this.success = false;
                this.message = error.response?.data?.message || 'Error setting up password';
                console.error('Password setup error:', error);
            }
        },

        resetLoginMethod() {
            this.loginMethod = null;
            this.email = '';
            this.password = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.message = '';
            this.success = false;
        },

        checkPasswordValidity() {
            this.validatePassword(this.newPassword);
        }
    }
}
</script>

<style scoped>
.user-login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f4f4f9;
}

.login-content {
    text-align: center;
    margin-bottom: 2rem;
}

.main-back-button {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #007bff;
}

.user-login-form-container {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
}

h4 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

.user-form-group-content {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
}

input:focus {
    border-color: #007bff;
    outline: none;
}

.password-input-container {
    position: relative;
}

.toggle-password {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
}

.forgot-password-container {
    margin-top: 0.5rem;
}

.forgot-password-link {
    font-size: 0.875rem;
    color: #007bff;
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.back-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #007bff;
}

.user-submit-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.user-submit-btn:hover {
    background-color: #0056b3;
}

.setup-password-container {
    margin-top: 2rem;
}

.setup-password-branding {
    text-align: center;
    margin-bottom: 1.5rem;
}

.setup-password-page-indicator {
    text-align: center;
    margin-bottom: 1rem;
}

.setup-password-heading {
    text-align: center;
    margin-bottom: 1rem;
}

.setup-password-description {
    text-align: center;
    margin-bottom: 2rem;
}

.setup-password-form {
    width: 100%;
}

.setup-password-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #000;
}

.otp-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.otp-modal-content {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.otp-input-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.otp-input {
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: 1.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    margin: 0 0.25rem;
}

.otp-message {
    text-align: center;
    margin-bottom: 1rem;
    color: #dc3545;
}

.otp-buttons {
    display: flex;
    justify-content: space-between;
}

.verify-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.verify-btn:hover {
    background-color: #0056b3;
}

.resend-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: #007bff;
}

.resend-btn:disabled {
    color: #6c757d;
    cursor: not-allowed;
}

.alert {
    padding: 0.75rem 1.25rem;
    border-radius: 4px;
    margin-top: 1rem;
    font-size: 0.875rem;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.error-input {
    border-color: #dc3545;
}
</style>