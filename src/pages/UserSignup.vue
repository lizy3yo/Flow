<template>
    <div class="signup">
        <div class="signup-contents">
            <h1>Seamless Queuing <br> Starts Here</h1>
            <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
        </div>
        <div class="signup-form-container">
            <h2><img src="@/images/logo2.0.png" alt="Flow Logo" style="width: 2rem; height: 2rem;"> Flow</h2>
            <h3>Create User Account</h3>
            
            <form @submit.prevent="handleSubmit" class="signup-form">
                <div class="name-row">
                    <div class="signup-form-group half-width">
                        <div class="input-with-error">
                            <input 
                                type="text" 
                                id="firstName" 
                                v-model="formData.firstName" 
                                placeholder="First Name"
                                :class="{ error: errors.firstName }"
                                @input="validateFirstName"
                                required
                            >
                            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
                        </div>
                    </div>

                    <div class="signup-form-group half-width">
                        <div class="input-with-error">
                            <input 
                                type="text" 
                                id="lastName" 
                                v-model="formData.lastName" 
                                placeholder="Last Name"
                                :class="{ error: errors.lastName }"
                                @input="validateLastName"
                                required
                            >
                            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
                        </div>
                    </div>
                </div>

                <div class="signup-form-group">
                    <div class="input-with-error">
                        <input 
                            type="email" 
                            id="email" 
                            v-model="formData.email" 
                            placeholder="Email"
                            :class="{ error: errors.email }"
                            @input="validateEmail"
                            required
                        >
                        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    </div>
                </div>

                <div class="signup-form-group">
                    <div class="input-with-error">
                        <input 
                            type="password" 
                            id="password" 
                            v-model="formData.password" 
                            placeholder="Password"
                            :class="{ error: errors.password }"
                            @input="validatePassword"
                            required
                        >
                        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    </div>
                </div>

                <div class="signup-form-group">
                    <div class="input-with-error">
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            v-model="formData.confirmPassword" 
                            placeholder="Confirm Password"
                            :class="{ error: errors.confirmPassword }"
                            @input="validateConfirmPassword"
                            required
                        >
                        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                    </div>
                </div>

                <div class="admin-form-group">
                    <div class="checkbox-container">
                        <input 
                            type="checkbox" 
                            id="termsAccepted" 
                            v-model="formData.termsAccepted"
                            required
                        >
                        <label for="termsAccepted">By checking this box, you are agreeing to our <a href="#" @click.prevent="showTerms" class="terms-link">Terms of Services</a>.</label>
                        <span v-if="errors.termsAccepted" class="error-message">{{ errors.termsAccepted }}</span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    class="user-signup-submit-button"
                    :class="{ error: hasFormErrors }"
                >
                    Create Account
                </button>

                <div v-if="hasFormErrors" class="submit-error-feedback visible">
                    Please fill in all required fields correctly
                </div>
               
            </form>

            <!-- Terms Modal -->
            <div v-if="isTermsModalVisible" class="signup-modal-overlay">
                <div class="signup-modal-content">
                    <div class="signup-modal-header">
                        <h3>Terms of Services</h3>
                        <button class="signup-close-button" @click="hideTerms" aria-label="Close">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="signup-modal-body">
                        <h4>Welcome to Flow</h4>
                        <p>By using our service, you agree to these terms. Please read them carefully.</p>
                        
                        <section class="terms-section">
                            <h5>Account Terms</h5>
                            <ul>
                                <li>You must provide accurate and complete information when creating an account</li>
                                <li>You are responsible for maintaining the security of your account</li>
                                <li>You must notify us immediately of any unauthorized access</li>
                            </ul>
                        </section>

                         <section class="terms-section">
                            <h5>User Responsibilities</h5>
                            <ul>
                                <li>You are responsible for being present when your number is called; missed turns may require re-queuing.</li>
                                <li>You must not misuse the system, including engaging in disruptive behavior or tampering.</li>
                            </ul>
                        </section>

                        <section class="terms-section">
                            <h5>Service Conditions</h5>
                            <ul>
                                <li>The service operates on a first-come, first-served basis unless otherwise specified.</li>
                                <li>Estimated wait times are provided for convenience but are approximate and not guaranteed.</li>
                                <li>The system is intended to manage customer flow efficiently through digital ticketing and real-time updates.</li>
                            </ul>
                        </section>

                         <section class="terms-section">
                            <h5>Privacy & Data</h5>
                            <ul>
                                <li>We collect and use personal data, such as your name and contact details, solely for queue management purposes.</li>
                                <li>Your data will be handled securely and in accordance with our Privacy Policy.</li>
                                <li>You may request access to or deletion of your data at any time.</li>
                            </ul>
                        </section>

                        <div class="terms-actions">
                            <button class="terms-accept-button" @click="acceptTerms">I Accept</button>
                            <button class="terms-decline-button" @click="hideTerms">Decline</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Alert Modal - Updated to match UserBookAppointmentView style -->
            <div v-if="isErrorAlertVisible" class="user-service-alert-container">
                <div class="user-service-alert user-service-alert-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    <span>{{ errorMessage }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'UserSignup',
    data() {
        return {
            formData: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false
            },
            errors: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                termsAccepted: ''
            },
            isTermsModalVisible: false,
            isErrorAlertVisible: false,
            errorMessage: ''
        };
    },
    computed: {
        isFormValid() {
            return !this.errors.firstName && 
                   !this.errors.lastName && 
                   !this.errors.email && 
                   !this.errors.password && 
                   !this.errors.confirmPassword &&
                   this.formData.firstName && 
                   this.formData.lastName && 
                   this.formData.email && 
                   this.formData.password && 
                   this.formData.confirmPassword &&
                   this.formData.termsAccepted;
        },
        hasFormErrors() {
            return Object.values(this.errors).some(error => error !== '');
        }
    },
    methods: {
        validateFirstName() {
            const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;  // Modified to accept letters and spaces
            if (!this.formData.firstName) {
                this.errors.firstName = 'Required';
            } else if (!nameRegex.test(this.formData.firstName)) {
                this.errors.firstName = 'Only letters';
            } else if (this.formData.firstName.length < 2) {
                this.errors.firstName = 'At least 2 characters';
            } else if (this.formData.firstName.length > 25) {
                this.errors.firstName = 'First name must be less than 25 characters';
            } else {
                this.errors.firstName = '';
            }
        },
        validateLastName() {
            const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;  // Modified to accept letters and spaces
            if (!this.formData.lastName) {
                this.errors.lastName = 'Required';
            } else if (!nameRegex.test(this.formData.lastName)) {
                this.errors.lastName = 'Only letters';
            } else if (this.formData.lastName.length < 2) {
                this.errors.lastName = 'At least 2 characters';
            } else if (this.formData.lastName.length > 25) {
                this.errors.lastName = 'Less than 25 characters';
            } else {
                this.errors.lastName = '';
            }
        },
        validateEmail() {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!this.formData.email) {
                this.errors.email = 'Required';
            } else if (!emailRegex.test(this.formData.email)) {
                this.errors.email = 'Please enter a valid email address';
            } else if (this.formData.email.length > 100) {
                this.errors.email = 'Email address is too long';
            } else {
                this.errors.email = '';
            }
        },
        validatePassword() {
            if (!this.formData.password) {
                this.errors.password = 'Required';
            } else if (this.formData.password.length < 8) {
                this.errors.password = 'Password must be at least 8 characters';
            } else if (this.formData.password.length > 50) {
                this.errors.password = 'Password must be less than 50 characters';
            } else if (!/[A-Z]/.test(this.formData.password)) {
                this.errors.password = 'Password must contain at least one uppercase letter';
            } else if (!/[0-9]/.test(this.formData.password)) {
                this.errors.password = 'Password must contain at least one number';
            } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(this.formData.password)) {
                this.errors.password = 'Password must contain at least one special character';
            } else {
                this.errors.password = '';
            }
            
            if (this.formData.confirmPassword) {
                this.validateConfirmPassword();
            }
        },
        validateConfirmPassword() {
            if (!this.formData.confirmPassword) {
                this.errors.confirmPassword = 'Required';
            } else if (this.formData.password !== this.formData.confirmPassword) {
                this.errors.confirmPassword = 'Passwords do not match';
            } else {
                this.errors.confirmPassword = '';
            }
        },
        showTerms(event) {
            event.preventDefault();
            this.isTermsModalVisible = true;
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        },
        hideTerms() {
            this.isTermsModalVisible = false;
            document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
        },
        acceptTerms() {
            this.isTermsModalVisible = false;
            this.formData.termsAccepted = true;
            document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
        },
        showErrorAlert(message) {
            this.errorMessage = message;
            this.isErrorAlertVisible = true;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideErrorAlert();
            }, 5000);
        },
        hideErrorAlert() {
            this.isErrorAlertVisible = false;
            this.errorMessage = '';
        },
        async handleSubmit() {
            Object.keys(this.errors).forEach(key => {
                this.errors[key] = '';
            });

            if (!this.formData.firstName) this.errors.firstName = 'Required';
            if (!this.formData.lastName) this.errors.lastName = 'Required';
            if (!this.formData.email) this.errors.email = 'Required';
            if (!this.formData.password) this.errors.password = 'Required';
            if (!this.formData.confirmPassword) this.errors.confirmPassword = 'Required';
            if (!this.formData.termsAccepted) this.errors.termsAccepted = 'Required';

            if (this.formData.firstName) this.validateFirstName();
            if (this.formData.lastName) this.validateLastName();
            if (this.formData.email) this.validateEmail();
            if (this.formData.password) this.validatePassword();
            if (this.formData.confirmPassword) this.validateConfirmPassword();

            const hasErrors = Object.values(this.errors).some(error => error !== '');
            if (hasErrors) {
                this.$nextTick(() => {
                    const btn = document.querySelector('.submit-button');
                    btn.classList.add('error');
                    setTimeout(() => {
                        btn.classList.remove('error');
                    }, 300);
                });
                return;
            }

            try {
                const response = await axios.post('https://flow-backend-yxdw.onrender.com/user-signup.php', {
                    firstName: this.formData.firstName.trim(),
                    lastName: this.formData.lastName.trim(),
                    email: this.formData.email.toLowerCase().trim(),
                    password: this.formData.password
                });
                
                if (response.data.success) {
                    this.$router.push('/login');
                } else {
                    this.showErrorAlert(response.data.message || 'Signup failed!');
                }
            } catch (error) {
                console.error('Signup error:', error);
                this.showErrorAlert(error.response?.data?.message || 'An error occurred during signup');
            }
        }
    }
};
</script>

<style>
@import '@/styles/authentication/usersignup.css';

    /* Alert Container Styles */
.user-service-alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
}

.user-service-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 8px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease-out;
    pointer-events: auto;
    min-width: 300px;
    max-width: 400px;
}

.user-service-alert-danger {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

.user-service-alert i {
    font-size: 20px;
    flex-shrink: 0;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .user-service-alert-container {
        top: 10px;
        right: 10px;
        left: 10px;
    }
    
    .user-service-alert {
        min-width: auto;
        max-width: none;
    }
}
</style>
