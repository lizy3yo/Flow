<template>
    <div class="forgot-pass-forgot-container">
        <div class="forgot-pass-forgot-card">            <!-- Header -->
            <div class="forgot-pass-card-header">
                <img
                    src="@/images/logo.png"
                    alt="Flow Logo"
                    class="forgot-pass-logo"
                />
                <h2>Flow</h2>
            </div>

            <!-- Content -->
            <div class="forgot-pass-card-content">
                <div v-if="!isEmailSent" class="forgot-pass-request-reset">
                    <h1>Reset Password</h1>                    <p>
                        Enter your email address to receive password reset instructions
                    </p>

                    <!-- Error Message -->
                    <div v-if="emailError && message" class="forgot-pass-error-message">
                        <i class="bi bi-exclamation-circle"></i>
                        <span>{{ message }}</span>
                    </div><form @submit.prevent="handleForgotPassword" class="forgot-pass-reset-form">                        <div class="forgot-pass-input-group">
                            <div class="forgot-pass-input-wrapper">
                                <i class="bi bi-envelope forgot-pass-input-icon" :class="{ 'error': emailError }"></i>
                                <input
                                    v-model="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    :class="{ 'forgot-pass-error': emailError }"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            :disabled="isLoading"
                            :class="{ 'forgot-pass-is-loading': isLoading }"
                        >
                            <i v-if="!isLoading" class="bi bi-send"></i>
                            <i v-else class="bi bi-arrow-clockwise forgot-pass-spinner"></i>
                            <span>{{ isLoading ? 'Sending...' : 'Send Reset Link' }}</span>
                        </button>
                    </form>
                </div>                <div v-else class="forgot-pass-reset-sent">
                    <div class="forgot-pass-success-icon">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h1>Check Your Email</h1>
                    <p>
                        We've sent password reset instructions to
                        <span class="forgot-pass-email-highlight">{{ email }}</span>
                    </p>
                    <p class="forgot-pass-note">
                        Please check your spam folder if you don't see it in
                        your inbox
                    </p>
                </div>                <!-- Back to Login Link -->
                <router-link to="/user/login" class="forgot-pass-back-link">
                    <i class="bi bi-arrow-left"></i>
                    <span>Back to Login</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
	name: "ForgotPasswordView",
	data() {
		return {
			email: "",
			isLoading: false,
			isEmailSent: false,
			emailError: false,
			message: "",		};
	},
	watch: {
		email() {
			// Clear error when user starts typing
			if (this.emailError) {
				this.emailError = false;
				this.message = "";
			}
		}
	},
	methods: {
		async handleForgotPassword() {
			if (!this.email) {
				this.emailError = true;
				return;
			}

			this.isLoading = true;
			try {
				const response = await axios.post(
					"https://flow-backend-yxdw.onrender.com/forgot-password.php",
					{
						email: this.email,
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.data.success) {
					this.isEmailSent = true;
					// Store email in route for password reset
					this.$router.push({
						path: '/reset-password',
						query: { email: this.email }
					});
				} else {
					this.message = response.data.message;
					this.emailError = true;
				}
			} catch (error) {
				console.error("Forgot password error:", error);
				this.message =
					error.response?.data?.message ||
					"Failed to send reset link. Please try again.";
				this.emailError = true;
			} finally {
				this.isLoading = false;
			}
		},
	},
};
</script>

<style scoped>
.forgot-pass-forgot-container {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
}

.forgot-pass-forgot-card {
	width: 100%;
	max-width: 440px;
	background-color: white;
	border-radius: 16px;
	padding: 2.5rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.forgot-pass-card-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	margin-bottom: 2.5rem;
	cursor: pointer;
}

.forgot-pass-logo {
	height: 32px;
	width: 32px;
	object-fit: contain;
}

.forgot-pass-card-header h2 {
	font-family: 'Merriweather', serif;
	color: var(--colorG3);
	font-size: 1.5rem;
	font-weight: 600;
	margin: 0;
}

.forgot-pass-card-content {
	text-align: center;
}

h1 {
	font-family: 'Merriweather', serif;
	font-size: 1.75rem;
	color: var(--txtcl2);
	margin-bottom: 0.75rem;
	font-weight: 600;
	position: relative;
}

h1::after {
	content: '';
	position: absolute;
	bottom: -8px;
	left: 50%;
	transform: translateX(-50%);
	width: 40px;
	height: 3px;
	background: var(--colorG2);
	border-radius: 2px;
}

p {
	font-family: 'Merriweather', serif;
	color: var(--txtcl1);
	margin-bottom: 1.5rem;	line-height: 1.5;
}

.forgot-pass-error-message {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background-color: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 8px;
	color: #dc2626;
	font-size: 0.875rem;
	margin-bottom: 1rem;
	animation: slideIn 0.3s ease-out;
}

.forgot-pass-error-message i {
	font-size: 1rem;
	flex-shrink: 0;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.forgot-pass-reset-form {
	margin-top: 2rem;
}

.forgot-pass-input-group {
	margin-bottom: 1.25rem;
}

.forgot-pass-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.forgot-pass-input-icon {
	position: absolute;
	left: 1rem;
	color: #64748b;
	font-size: 1rem;
	z-index: 1;
}

input {
	width: 100%;
	padding: 0.875rem 1rem 0.875rem 2.75rem;
	border: 1.5px solid #e2e8f0;
	border-radius: 8px;
	font-size: 1rem;
	font-family: 'Merriweather', serif;
	transition: all 0.2s ease;
}

input.forgot-pass-error {
	border: 1px solid var(--googleBGColor);
	background-color: #fef2f2;
}

.forgot-pass-input-wrapper .forgot-pass-input-icon.error {
	color: var(--googleBGColor);
}

input:focus {
	outline: none;
	border-color: var(--colorG2);
	box-shadow: 0 0 0 3px rgba(125, 198, 131, 0.1);
}

.forgot-pass-input-wrapper:focus-within .forgot-pass-input-icon {
	color: var(--colorG2);
}

button {
	width: 100%;
	padding: 0.875rem;
	background: #333D79;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 500;
	font-family: 'Merriweather', serif;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

button i {
	font-size: 1rem;
}

.forgot-pass-spinner {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

button:hover:not(:disabled) {
	background: #2a3268;
}

button.forgot-pass-is-loading {
	opacity: 0.7;
	cursor: not-allowed;
}

.forgot-pass-reset-sent {
	padding: 1rem 0;
}

.forgot-pass-success-icon {
	margin-bottom: 1.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
}

.forgot-pass-success-icon i {
	font-size: 4rem;
	color: var(--colorG2);
	animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.forgot-pass-email-highlight {
	color: var(--colorG2);
	font-weight: 500;
}

.forgot-pass-note {
	font-size: 0.875rem;
	color: #64748b;
}

.forgot-pass-back-link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	margin-top: 1.5rem;
	color: #333D79;
	text-decoration: none;
	font-size: 0.938rem;
	font-family: 'Merriweather', serif;
	transition: all 0.2s ease;
	padding: 0.875rem 1rem;
	border: 1.5px solid #333D79;
	border-radius: 8px;
	background: transparent;
	width: 100%;
}

.forgot-pass-back-link i {
	font-size: 0.875rem;
	transition: transform 0.2s ease;
}

.forgot-pass-back-link:hover {
	color: white;
	background: #333D79;
	border-color: #333D79;
}

.forgot-pass-back-link:hover i {
	transform: translateX(-2px);
}

a {
	font-family: 'var(--description)';
}

/* Responsive */
@media (max-width: 480px) {
	.forgot-pass-forgot-card {
		border-radius: 0px !important;
		max-width: 100% !important;
		height: 100dvh;
		padding: 20px;
	}

	.forgot-pass-forgot-container {
		padding: 0 !important;
	}

	h1 {
		font-size: 1.5rem;
	}
	.forgot-pass-success-icon i {
		font-size: 3.5rem;
	}

	.forgot-pass-logo {
		height: 28px;
		width: 28px;
	}

	.forgot-pass-card-header h2 {
		font-size: 1.25rem;
	}
}

@media screen and (max-height: 340px) {
	.forgot-pass-forgot-card {
		height: auto !important;
	}
}

@media screen and (max-width: 425px) {
	.forgot-pass-forgot-card {
		margin: 0 !important;
	}

	input {
		font-size: 14px;
	}
}

/* Animation */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.forgot-pass-reset-sent,
.forgot-pass-request-reset {
	animation: fadeIn 0.3s ease-out;
}

</style>
