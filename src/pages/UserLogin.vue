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
            tempUserId: null
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
                const response = await axios.post('/flow-application-cc/api/login.php', {
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

        async sendOtp() {
            try {
                const response = await axios.post('/flow-application-cc/api/send-otp.php', {
                    email: this.userEmail
                });
                console.log('OTP send response:', response.data);

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('Failed to send OTP:', error.response?.data || error.message);
                this.otpMessage = error.response?.data?.message || 'Failed to send verification code';
            }
        },

        async verifyOtp() {
            try {
                const response = await axios.post('/flow-application-cc/api/verify-otp.php', {
                    email: this.userEmail,
                    otp: this.otpCode
                });

                if (response.data.success) {
                    // Complete login process
                    localStorage.clear();
                    localStorage.setItem('userType', 'user');
                    localStorage.setItem('userId', this.tempLoginData.user_id);
                    localStorage.setItem('userSessionToken', this.tempLoginData.session_token);
                    localStorage.setItem('userData', JSON.stringify(this.tempLoginData.user));

                    await this.$router.push('/user/dashboard');
                } else {
                    this.otpMessage = 'Invalid verification code';
                }
            } catch (error) {
                console.error('OTP verification failed:', error);
                this.otpMessage = 'Verification failed. Please try again.';
            }
        },

        async handleGoogleLogin() {
            try {
                const googleUser = await googleAuthCodeLogin();

                const response = await axios.post('/flow-application-cc/api/google-login.php', {
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
                const response = await axios.post('/flow-application-cc/api/setup-password.php', {
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
                    this.message = 'Password setup successful';

                    // Complete login process
                    localStorage.setItem('userType', 'user');
                    localStorage.setItem('token', response.data.session_token);

                    setTimeout(() => {
                        this.$router.push('/user/dashboard');
                    }, 1000);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                this.success = false;
                this.message = error.message || 'Failed to set up password. Please try again.';
            }
        },        resetLoginMethod() {
            this.loginMethod = null;
            this.email = '';
            this.password = '';
            this.message = '';
            this.success = false;
            this.showPassword = false;
            this.passwordError = '';
            this.newPassword = '';
            this.confirmPassword = '';
        },

        goBackToSelector() {
            this.$router.push('/login');
        },

        checkPasswordValidity() {
            this.validatePassword(this.newPassword);
        }
    }
};
</script>

<style>
@import '@/styles/authentication/userlogin.css';

/* Password setup container styles moved to userlogin.css for better organization and consistency */

/* Error message styles */
.password-error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    text-align: left;
}

.error-input {
    border-color: #dc3545 !important;
}

/* OTP Modal Styles */
.otp-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.otp-modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    position: relative;
}

.otp-input-container {
    margin: 1.5rem 0;
}

.otp-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.25rem;
    text-align: center;
    letter-spacing: 0.25rem;
    border: 2px solid #ddd;
    border-radius: 4px;
}

.otp-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.verify-btn, .resend-btn {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.verify-btn {
    background-color: #4CAF50;
    color: white;
}

.resend-btn {
    background-color: #f0f0f0;
    color: #333;
}

.resend-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.close-modal {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    font-size: 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
}

.otp-message {
    color: #666;
    margin-top: 0.5rem;
    text-align: center;
}
</style>