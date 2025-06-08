<template>
    <div class="signup-selector">
        <div class="signup-content">
            <button class="back-button" @click="goBack" title="Back to Landing">
                <i class="bi bi-arrow-left"></i> Back
            </button>
            <h1>Welcome Back!<br>Ready to Flow?</h1>
            <p>Don't have an account?<router-link to="/signup/user"> Sign up now</router-link></p>
        </div>
        <div class="selector-container">
            <h2><img src="@/images/logo2.0.png" alt="Logo" style="width: 2rem; height: 2rem;"> Flow</h2>
            <h3>Choose Account Type</h3>

            <div class="signup-buttons">
                <button class="selector-button-admin"
                    @click="selectType('admin'); selectAdminOption()"
                    :class="{ 'selected': selectedType === 'admin' }">
                    Admin
                </button>
                <button class="selector-button-user"
                    @click="selectType('user'); selectUserOption()"
                    :class="{ 'selected': selectedType === 'user' }">
                    User
                </button>
            </div>
            <div v-if="selectedType" class="selection-info">
                <p class="type-message">
                    {{ selectedType === 'admin'
                        ? 'You are now signing up as an '
                        : 'You will now sign up as a '
                    }}<em>{{ selectedType }}</em>
                </p>
                <router-link
                    :to="`/${selectedType}/login`"
                    class="continue-button">
                    Continue
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SignupSelector',
    data() {
        return {
            selectedType: null
        }
    },
    methods: {
        selectType(type) {
            this.selectedType = type;
        },
        selectAdminOption() {
            const signupButtons = document.querySelector('.signup-buttons');
            signupButtons.classList.add('admin-selected');
            signupButtons.classList.remove('user-selected');
        },
        selectUserOption() {
            const signupButtons = document.querySelector('.signup-buttons');
            signupButtons.classList.add('user-selected');
            signupButtons.classList.remove('admin-selected');
        },
        goBack() {
            this.$router.push('/landing');
        }
    }
}
</script>

<style scoped>
@import '@/styles/authentication/loginselector.css';
</style>