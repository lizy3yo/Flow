<template>
	<div class="reset-container">		<div class="reset-card">
			<div class="card-header">
				<img
					src="@/images/logo.png"
					alt="Flow Logo"
					class="reset-logo"
				/>
				<h2>Flow</h2>
			</div>

			<div class="card-content">				<div v-if="!isReset" class="reset-form-container">
					<h1>Reset Your Password</h1>
					<p>Please enter the OTP sent to your email and your new password</p>

					<!-- Error Message -->
					<div v-if="errorMessage" class="reset-error-message">
						<i class="bi bi-exclamation-circle"></i>
						<span>{{ errorMessage }}</span>
					</div>

					<form
						@submit.prevent="handleResetPassword"
						class="reset-form"
					>
						<div class="form-group">
							<label for="otp">OTP Code</label>
							<div class="otp-container">
								<template v-for="(_, index) in 6" :key="index">
									<input
										type="text"
										class="otp-input"
										maxlength="1"
										inputmode="numeric"
										pattern="[0-9]"
										:id="`otp-${index}`"
										v-model="otpDigits[index]"
										@input="handleOtpInput(index)"
										@keydown="handleKeyDown($event, index)"
										@paste="handlePaste"
										ref="otpInputs"
									/>
								</template>
								<div class="otp-check" v-if="isValidOtp">
									<i class="bi bi-check-circle-fill"></i>
								</div>
							</div>
						</div>						<div class="form-group">
							<label for="password">New Password</label>
							<div class="password-input-container">
								<i class="bi bi-lock reset-input-icon"></i>
								<input
									:type="showPassword ? 'text' : 'password'"
									id="password"
									v-model="password"
									placeholder="Enter new password"
									required
								/>
								<button
									type="button"
									class="toggle-password"
									@click="showPassword = !showPassword"
								>
									<i
										:class="
											showPassword
												? 'bi bi-eye-slash'
												: 'bi bi-eye'
										"
									></i>
								</button>
							</div>
						</div>

						<div class="form-group">
							<label for="confirmPassword">Confirm Password</label>
							<div class="password-input-container">
								<i class="bi bi-lock reset-input-icon"></i>
								<input
									:type="showPassword ? 'text' : 'password'"
									id="confirmPassword"
									v-model="confirmPassword"
									placeholder="Confirm your password"
									required
								/>							</div>
						</div>

						<button
							type="submit"
							:disabled="isLoading || !passwordsMatch || !isValidOtp"
							:class="{ 'is-loading': isLoading }"
						>
							<i v-if="!isLoading" class="bi bi-shield-check"></i>
							<i v-else class="bi bi-arrow-clockwise reset-spinner"></i>
							<span>{{ isLoading ? 'Resetting...' : 'Reset Password' }}</span>
						</button>
					</form>
				</div>				<div v-else class="success-container">
					<div class="success-icon">
						<i class="bi bi-check-circle-fill"></i>
					</div>
					<h1>Password Reset Successful</h1>
					<p>Your password has been changed successfully.</p>
					<p class="redirect-message">Redirecting to login...</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
	name: "ResetPasswordView",
	data() {
		return {
			otpDigits: ['', '', '', '', '', ''],
			password: "",
			confirmPassword: "",
			showPassword: false,
			isLoading: false,
			isReset: false,
			errorMessage: "",
			email: this.$route.query.email,
		};
	},	computed: {
		passwordsMatch() {
			return (
				this.password === this.confirmPassword &&
				this.password.length > 0
			);
		},
		isValidOtp() {
			return this.otpDigits.join("").length === 6;
		},
	},
	watch: {
		otpDigits: {
			handler() {
				// Clear error when user starts typing OTP
				if (this.errorMessage) {
					this.errorMessage = "";
				}
			},
			deep: true
		},
		password() {
			// Clear error when user starts typing password
			if (this.errorMessage) {
				this.errorMessage = "";
			}
		},
		confirmPassword() {
			// Clear error when user starts typing confirm password
			if (this.errorMessage) {
				this.errorMessage = "";
			}
		}
	},
	methods: {
		handleOtpInput(index) {
			// Force digit to be numeric
			this.otpDigits[index] = this.otpDigits[index].replace(/[^0-9]/g, '');
			
			// Update the main otp value
			this.otp = this.otpDigits.join('');
			
			// Move to next input if current one is filled
			if (this.otpDigits[index] && index < 5) {
				this.$nextTick(() => {
					this.$refs.otpInputs[index + 1].focus();
				});
			}
		},
		
		handleKeyDown(event, index) {
			// Handle backspace to move to previous input
			if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
				this.$nextTick(() => {
					this.$refs.otpInputs[index - 1].focus();
				});
			}
		},
		
		handlePaste(event) {
			event.preventDefault();
			const pastedData = event.clipboardData.getData('text');
			const digits = pastedData.replace(/[^0-9]/g, '').split('').slice(0, 6);
			
			digits.forEach((digit, index) => {
				if (index < 6) {
					this.otpDigits[index] = digit;
				}
			});
			
			this.otp = this.otpDigits.join('');
		},
				validateOtp() {
			// Add proper OTP validation
			const otpPattern = /^\d{6}$/;
			if (!otpPattern.test(this.otpDigits.join("").trim())) {
				this.errorMessage = "Please enter a valid 6-digit OTP";
				return false;
			}
			this.errorMessage = "";
			return true;
		},

		validatePassword() {
			if (!this.password) {
				this.errorMessage = 'Password is required';
				return false;
			} else if (this.password.length < 8) {
				this.errorMessage = 'Password must be at least 8 characters';
				return false;
			} else if (this.password.length > 50) {
				this.errorMessage = 'Password must be less than 50 characters';
				return false;
			} else if (!/[A-Z]/.test(this.password)) {
				this.errorMessage = 'Password must contain at least one uppercase letter';
				return false;
			} else if (!/[0-9]/.test(this.password)) {
				this.errorMessage = 'Password must contain at least one number';
				return false;
			} else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(this.password)) {
				this.errorMessage = 'Password must contain at least one special character';
				return false;
			}
			this.errorMessage = "";
			return true;
		},
		async handleResetPassword() {
			if (!this.email) {
				this.errorMessage = "Email is required";
				return;
			}

			if (!this.validateOtp()) {
				return; // Error message already set by validateOtp()
			}

			if (!this.validatePassword()) {
				return; // Error message already set by validatePassword()
			}

			if (!this.passwordsMatch) {
				this.errorMessage = "Passwords do not match";
				return;
			}

			this.isLoading = true;
			this.errorMessage = "";

			try {
				console.log("Sending reset request:", {
					email: this.email,
					otp: this.otpDigits.join("").trim(),
					password: this.password.substring(0, 3) + "..." // Log part of password for debugging
				});
				
				const response = await axios.post(
					"/flow-application-cc/api/reset-password.php",
					{
						email: this.email,
						otp: this.otpDigits.join("").trim(),
						password: this.password
					}
				);
				
				console.log("Reset response:", response.data);

				if (response.data.success) {
					this.isReset = true;
					setTimeout(() => {
						this.$router.push("/user/login");
					}, 3000);
				} else {
					this.errorMessage = response.data.message || "Failed to reset password";
				}
			} catch (error) {
				console.error("Reset password error:", error);
				this.errorMessage = error.response?.data?.message || 
					"An error occurred while resetting password";
			} finally {
				this.isLoading = false;
			}
		},
	},
	mounted() {
		if (!this.email) {
			this.$router.push("/forgot-password");
		}
	},
};
</script>

<style scoped>
.reset-container {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30px 15px;
}

.reset-card {
	background: white;
	border-radius: 16px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	width: 100%;
	max-width: 500px;
	overflow: hidden;
	animation: fadeIn 0.4s ease-in-out;
}

.card-header {
	padding: 25px 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	border-bottom: 1px solid #f1f5f9;
}

.reset-logo {
	height: 32px;
	width: 32px;
	object-fit: contain;
}

.card-header h2 {
	font-family: 'Merriweather', serif;
	color: var(--colorG3);
	font-size: 1.5rem;
	font-weight: 600;
	margin: 0;
}

.card-content {
	padding: 30px;
}

h1 {
	font-size: 24px;
	color: #333;
	text-align: center;
	margin-top: 0;
	margin-bottom: 12px;
	font-family: 'Merriweather', serif;
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
	background: #333D79;
	border-radius: 2px;
}

p {
	color: #666;
	text-align: center;
	margin-bottom: 25px;
	line-height: 1.6;
	font-family: 'Merriweather', serif;
}

.reset-error-message {
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

.reset-error-message i {
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

.form-group {
	margin-bottom: 20px;
}

label {
	display: block;
	margin-bottom: 8px;
	font-size: 14px;
	font-weight: 500;
	color: #333;
	font-family: 'Merriweather', serif;
}

.password-input-container {
	position: relative;
	width: 100%;
}

.reset-input-icon {
	position: absolute;
	left: 15px;
	top: 50%;
	transform: translateY(-50%);
	color: #64748b;
	font-size: 1rem;
	z-index: 1;
}

.toggle-password {
	position: absolute;
	right: 15px;
	top: 50%;
	transform: translateY(-50%);
	color: #888;
	cursor: pointer;
	border: none;
	background: none;
	z-index: 2;
}

.password-input-container input {
	width: 100%;
	padding: 15px 50px 15px 45px;
	border: 1.5px solid #e2e8f0;
	border-radius: 8px;
	font-size: 15px;
	transition: border 0.3s;
	font-family: 'Merriweather', serif;
	box-sizing: border-box;
	text-align: left;
	text-indent: 0;
	direction: ltr;
	line-height: normal;
	display: block;
}

.password-input-container input[type="password"],
.password-input-container input[type="text"] {
	text-align: left !important;
	text-indent: 0 !important;
	padding: 15px 50px 15px 45px !important;
	margin: 0;
	letter-spacing: normal;
}

.password-input-container input::placeholder {
	text-align: left;
	padding-left: 0;
	text-indent: 0;
}

.password-input-container input:focus {
	outline: none;
	border-color: #333D79;
	box-shadow: 0 0 0 3px rgba(51, 61, 121, 0.1);
}

.password-input-container:focus-within .reset-input-icon {
	color: #333D79;
}

.not-matched {
	border-color: #e74c3c !important;
}

.password-mismatch {
	color: #e74c3c;
	font-size: 13px;
	margin-top: 5px;
	font-family: 'Merriweather', serif;
}

.reset-form {
	margin-top: 20px;
}

button[type="submit"] {
	width: 100%;
	padding: 14px;
	border: none;
	background-color: #333D79;
	color: white;
	font-size: 16px;
	font-weight: 600;
	border-radius: 8px;
	cursor: pointer;
	transition: background-color 0.3s;
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;
	font-family: 'Merriweather', serif;
}

button[type="submit"] i {
	font-size: 1rem;
}

.reset-spinner {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

button[type="submit"]:hover:not(:disabled) {
	background-color: #2a3268;
}

button[type="submit"]:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

.success-container {
	text-align: center;
	padding: 20px 0;
	animation: fadeIn 0.4s ease-out;
}

.success-icon {
	margin-bottom: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.success-icon i {
	font-size: 4rem;
	color: #333D79;
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

.redirect-message {
	margin-top: 30px;
	font-size: 14px;
	color: #888;
	font-family: 'Merriweather', serif;
}

input[type="text"] {
	width: 100%;
	padding: 15px;
	border: 1.5px solid #e2e8f0;
	border-radius: 8px;
	font-size: 15px;
	transition: border 0.3s;
	font-family: 'Merriweather', serif;
}

input[type="text"]:focus {
	outline: none;
	border-color: #333D79;
	box-shadow: 0 0 0 3px rgba(51, 61, 121, 0.1);
}

.otp-container {
	display: flex;
	gap: 8px;
	align-items: center;
	justify-content: center;
	margin-top: 10px;
}

.otp-input {
	width: 40px;
	height: 40px;
	text-align: center;
	font-size: 18px;
	border: 1.5px solid #e2e8f0;
	border-radius: 8px;
	padding: 0;
	background-color: #f8f9fa;
}

.otp-input:focus {
	outline: none;
	border-color: #333D79;
	box-shadow: 0 0 0 3px rgba(51, 61, 121, 0.1);
}

.otp-check {
	margin-left: 8px;
	color: #333D79;
	font-size: 20px;
	display: flex;
	align-items: center;
}

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

/* Responsive styles */
@media (max-width: 480px) {
	.reset-card {
		border-radius: 0px;
		height: 100dvh;
	}

	.reset-container {
		padding: 0px !important;
	}

	h1 {
		font-size: 22px;
	}

	.card-header h2 {
		font-size: 20px;
	}

	.reset-logo {
		height: 28px;
		width: 28px;
	}

	input,
	.auth-button {
		font-size: 14px;
	}

	.password-strength {
		flex-wrap: wrap;
	}

	.success-icon i {
		font-size: 3.5rem;
	}
}

@media screen and (max-width: 425px) {
	.reset-card {
		margin: 0 !important;
	}
}

@media screen and (max-height: 540px) {
	.reset-card {
		height: auto !important;
	}
}
</style>
