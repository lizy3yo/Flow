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
        <div class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">
            <div class="user-page-container">
                <div class="user-appointments-list">
                    <div v-if="appointments.length === 0" class="no-appointments">
                        No appointments found.
                    </div>
                    <div v-else class="user-appointment-cards">
                        <div v-for="appointment in appointments"
                             :key="appointment.id"
                             class="user-appointment-card">
                            <div class="user-appointment-header">
                                <h3>{{ formatDate(appointment.date) }}</h3>
                                <span :class="['status', appointment.status.toLowerCase()]">
                                    {{ appointment.status }}
                                </span>
                            </div>
                            <div class="user-appointment-details">
                                <p><strong>Time:</strong> {{ appointment.time }}</p>
                                <p><strong>Purpose:</strong> {{ appointment.purpose }}</p>
                            </div>
                            <div class="user-appointment-actions">
                                <button v-if="appointment.status === 'Scheduled'"
                                        @click="cancelAppointment(appointment.id)"
                                        class="cancel-btn">
                                    Cancel Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserNavbar from './UserNavbar.vue'
import UserTopNavbar from './UserTopNavbar.vue'

// Mock data for appointments
const mockAppointments = [
    {
        id: 1,
        date: '2025-05-10',
        time: '09:00 AM',
        purpose: 'Regular Checkup',
        status: 'Scheduled'
    },
    {
        id: 2,
        date: '2025-05-15',
        time: '02:00 PM',
        purpose: 'Follow-up',
        status: 'Completed'
    },
    {
        id: 3,
        date: '2025-05-20',
        time: '11:30 AM',
        purpose: 'Dental Cleaning',
        status: 'Scheduled'
    },
    {
        id: 4,
        date: '2025-05-08',
        time: '03:15 PM',
        purpose: 'Consultation',
        status: 'Cancelled'
    }
]

export default {
    name: 'UserAppointments',
    components: {
        UserNavbar,
        UserTopNavbar
    },
    data() {
        return {
            appointments: mockAppointments,
            isSidebarCollapsed: false,
            mobileSidebarOpen: false, // For mobile sidebar state
            userProfile: {
                name: 'User',
                email: '',
                avatar: null
            }
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
        cancelAppointment(id) {
            if (confirm('Are you sure you want to cancel this appointment?')) {
                try {
                    // Update the status in mock data
                    const appointmentIndex = this.appointments.findIndex(apt => apt.id === id)
                    if (appointmentIndex !== -1) {
                        this.appointments[appointmentIndex].status = 'Cancelled'
                        alert('Appointment cancelled successfully!')
                    }
                } catch (error) {
                    console.error('Error cancelling appointment:', error)
                    alert('Failed to cancel appointment. Please try again.')
                }
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
    },
    mounted() {
        // Initialize sidebar state from localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            this.isSidebarCollapsed = JSON.parse(savedState);
        }

        // Load user profile from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            this.userProfile = {
                name: user.name || 'User',
                email: user.email || '',
                avatar: user.avatar || null
            };
        }
    }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/appointments.css';
</style>
