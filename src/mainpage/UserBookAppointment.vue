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
            
            <!-- Back Button -->
            <button @click="goBack" class="user-book-appointment-back-btn">
                <i class="bi bi-arrow-left"></i>
                Back
            </button>
            
            <!-- Header Section -->
            <div class="user-book-header-section">
                <h1 class="user-book-main-header">Available Services</h1>
                <p class="user-book-subtitle">Browse and select from available services to book your appointment. Check operating hours and current queue status.</p>
            </div>

            <!-- Search and Filter Section -->
            <div class="user-book-filters-container">
                <!-- Search Bar -->
                <div class="user-book-search-bar">
                    <i class="bi bi-search"></i>
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search services..."
                    >
                </div>                <!-- Filters -->
                <div class="user-book-filter-options">
                    <select v-model="sortBy" class="user-book-filter-select">
                        <option value="nameAsc">Name (A-Z)</option>
                        <option value="nameDesc">Name (Z-A)</option>
                    </select>

                    <select v-model="queueSort" class="user-book-filter-select">
                        <option value="">Queue Order</option>
                        <option value="queueAsc">Queue (Low to High)</option>
                        <option value="queueDesc">Queue (High to Low)</option>
                    </select>

                    <select v-model="waitTimeSort" class="user-book-filter-select">
                        <option value="">All Wait Time</option>
                        <option value="waitTimeAsc">Wait Time (Low to High)</option>
                        <option value="waitTimeDesc">Wait Time (High to Low)</option>
                    </select>

                    <select v-model="statusFilter" class="user-book-filter-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <!-- View Toggle Buttons -->
                <div class="user-book-filter-options">
                    <div class="view-toggle-container">
                        <button 
                            @click="viewMode = 'grid'" 
                            :class="['view-toggle-btn', { 'active': viewMode === 'grid' }]"
                            title="Grid View"
                        >
                            <i class="bi bi-grid-3x3-gap"></i>
                        </button>
                        <button 
                            @click="viewMode = 'table'" 
                            :class="['view-toggle-btn', { 'active': viewMode === 'table' }]"
                            title="Table View"
                        >
                            <i class="bi bi-table"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Services Grid View -->
            <div v-if="viewMode === 'grid'" class="user-book-departments-grid"><div v-for="service in filteredDepartments" :key="service.id" class="user-book-card">
                    <div class="user-book-content">                        <div class="user-book-content-main">
                            <h2 v-html="highlightText(service.name)"></h2>
                            <div class="user-book-info">                                <div class="user-book-info-item">
                                    <span>Status:</span>
                                    <span :class="{'user-book-queue-active': getDepartmentStatus(service) === 'active', 'user-book-queue-inactive': getDepartmentStatus(service) === 'inactive'}">
                                        {{ getDisplayStatus(service) }}
                                    </span>
                                </div>
                                <div class="user-book-info-item">
                                    <i class="bi bi-clock"></i>
                                    <span>{{ formatTime(service.hours_start) }} - {{ formatTime(service.hours_end) }}</span>
                                </div>
                                <div class="user-book-info-item">
                                    <i class="bi bi-geo-alt"></i>
                                    <span v-html="highlightText(service.location)"></span>
                                </div>
                                <div class="user-book-info-item">
                                    <i class="bi bi-people"></i>
                                    <span>Queue: {{ service.current_queue || 0 }}/{{ service.max_queues }}</span>
                                </div>
                                <div class="user-book-info-item">
                                    <i class="bi bi-stopwatch"></i>
                                    <span>Wait: {{ service.avg_wait_time }} mins</span>
                                </div>
                            </div>
                        </div>                        <button
                            class="user-book-view-btn"
                            @click="viewQueueDetails(service)"
                            :class="{ 'disabled': getDepartmentStatus(service) === 'inactive' }"
                            :disabled="getDepartmentStatus(service) === 'inactive'"
                        >
                            {{ getDepartmentStatus(service) === 'inactive' ? 'Unavailable' : 'View Queue Details' }}
                            <i class="bi bi-arrow-right" v-if="getDepartmentStatus(service) === 'active'"></i>
                            <i class="bi bi-exclamation-triangle" v-if="getDepartmentStatus(service) === 'inactive'"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Services Table View -->
            <div v-else-if="viewMode === 'table'" class="user-book-table-container">
                <div class="user-book-table-wrapper">
                    <table class="user-book-table">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Operating Hours</th>
                                <th>Location</th>
                                <th>Queue Status</th>
                                <th>Wait Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="service in filteredDepartments" :key="service.id" class="table-row">
                                <td>
                                    <span v-html="highlightText(service.name)" class="service-name"></span>
                                </td>
                                <td>
                                    <div class="hours-display">
                                        <i class="bi bi-clock"></i>
                                        <span>{{ formatTime(service.hours_start) }} - {{ formatTime(service.hours_end) }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="location-display">
                                        <i class="bi bi-geo-alt"></i>
                                        <span v-html="highlightText(service.location)"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="queue-display">
                                        <i class="bi bi-people"></i>
                                        <span>{{ service.current_queue || 0 }}/{{ service.max_queues }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="wait-time-display">
                                        <i class="bi bi-stopwatch"></i>
                                        <span>{{ service.avg_wait_time }} mins</span>
                                    </div>
                                </td>
                                <td>
                                    <span 
                                        :class="['status-badge', {
                                            'status-active': getDepartmentStatus(service) === 'active', 
                                            'status-inactive': getDepartmentStatus(service) === 'inactive'
                                        }]"
                                    >
                                        {{ getDisplayStatus(service) }}
                                    </span>
                                </td>
                                <td>                                    <button
                                        class="user-book-view-btn"
                                        @click="viewQueueDetails(service)"
                                        :class="{ 'disabled': getDepartmentStatus(service) === 'inactive' }"
                                        :disabled="getDepartmentStatus(service) === 'inactive'"
                                    >
                                        {{ getDepartmentStatus(service) === 'inactive' ? 'Unavailable' : 'View Queue Details' }}
                                        <i class="bi bi-arrow-right" v-if="getDepartmentStatus(service) === 'active'"></i>
                                        <i class="bi bi-exclamation-triangle" v-if="getDepartmentStatus(service) === 'inactive'"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserNavbar from './UserNavbar.vue'
import UserTopNavbar from './UserTopNavbar.vue'
import axios from 'axios'

const API_BASE_URL = 'https://flow-backend-yxdw.onrender.com'

export default {
    name: 'UserBookAppointment',
    components: {
        UserNavbar,
        UserTopNavbar
    },    data() {
        return {
            departments: [],
            error: null,
            searchQuery: '',
            sortBy: 'nameAsc',
            queueSort: '',
            waitTimeSort: '',
            statusFilter: '',
            isSidebarCollapsed: false,
            mobileSidebarOpen: false, // For mobile sidebar state
            userProfile: {
                name: 'User',
                email: '',
                avatar: null
            },
            viewMode: 'table' // Default to table view
        }
    },
    computed: {
        filteredDepartments() {
            let filtered = [...this.departments]

            // Apply search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase()
                filtered = filtered.filter(dept =>
                    dept.name.toLowerCase().includes(query) ||
                    dept.location.toLowerCase().includes(query)
                )
            }

            // Apply status filter
            if (this.statusFilter) {
                filtered = filtered.filter(dept =>
                    this.getDepartmentStatus(dept) === this.statusFilter
                )
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch (this.sortBy) {
                    case 'nameAsc':
                        return a.name.localeCompare(b.name)
                    case 'nameDesc':
                        return b.name.localeCompare(a.name)
                    default:
                        return 0
                }
            })

            if (this.queueSort) {
                filtered.sort((a, b) => {
                    switch (this.queueSort) {
                        case 'queueAsc':
                            return (a.current_queue || 0) - (b.current_queue || 0)
                        case 'queueDesc':
                            return (b.current_queue || 0) - (a.current_queue || 0)
                        default:
                            return 0
                    }
                })
            }

            if (this.waitTimeSort) {
                filtered.sort((a, b) => {
                    switch (this.waitTimeSort) {
                        case 'waitTimeAsc':
                            return (a.avg_wait_time || 0) - (b.avg_wait_time || 0)
                        case 'waitTimeDesc':
                            return (b.avg_wait_time || 0) - (a.avg_wait_time || 0)
                        default:
                            return 0
                    }
                })
            }

            return filtered
        }
    },
    mounted() {
        this.fetchDepartments();

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
    },
    methods: {
        async fetchDepartments() {
            try {
                const establishmentId = this.$route.params.departmentId;

                // Fetch services
                const response = await axios.get(`${API_BASE_URL}/services.php?admin_id=${establishmentId}`, {
                    withCredentials: true
                });

                this.departments = response.data.map(service => ({
                    id: service.id,
                    name: service.name,
                    hours_start: service.hours_start,
                    hours_end: service.hours_end,
                    max_queues: service.max_queues,
                    location: service.location,
                    current_queue: 0,
                    avg_wait_time: 0
                }));

                // Fetch current queue counts and calculate wait times for each service
                for (let service of this.departments) {
                    try {
                        // Get all active queues with their elapsed times
                        const queueResponse = await axios.get(
                            `${API_BASE_URL}/appointments.php?service_id=${service.id}&status=active`,
                            { withCredentials: true }
                        );

                        service.current_queue = queueResponse.data.length;

                        // Calculate average wait time from completed queues
                        const completedQueuesResponse = await axios.get(
                            `${API_BASE_URL}/appointments.php?service_id=${service.id}&status=completed`,
                            { withCredentials: true }
                        );

                        const completedQueues = completedQueuesResponse.data;
                        if (completedQueues.length > 0) {
                            // Calculate waiting times from completed queues
                            const waitingTimes = completedQueues.map(queue => {
                                const startTime = new Date(queue.created_at).getTime();
                                const endTime = new Date(queue.completed_at).getTime();
                                return Math.floor((endTime - startTime) / (1000 * 60)); // Convert to minutes
                            });

                            // Calculate average waiting time
                            const avgWaitTime = Math.ceil(waitingTimes.reduce((sum, time) => sum + time, 0) / waitingTimes.length);

                            // Multiply by number of people in queue to get estimated total wait time
                            const estimatedWaitTime = avgWaitTime * service.current_queue;
                            service.avg_wait_time = estimatedWaitTime || 0;
                        } else {
                            // Default to 10 minutes per person if no completed queues
                            const defaultWaitTime = 10 * service.current_queue;
                            service.avg_wait_time = defaultWaitTime;
                        }

                    } catch (error) {
                        console.error(`Error fetching queue data for service ${service.id}:`, error);
                        service.current_queue = 0;
                        service.avg_wait_time = '0';
                    }
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                this.error = 'Failed to load services';
            }
        },        getDepartmentStatus(dept) {
            const now = new Date()
            const currentTime = now.getHours() * 100 + now.getMinutes()
            const [startHours, startMinutes] = dept.hours_start.split(':')
            const [endHours, endMinutes] = dept.hours_end.split(':')
            const startTime = parseInt(startHours) * 100 + parseInt(startMinutes)
            const endTime = parseInt(endHours) * 100 + parseInt(endMinutes)

            return (currentTime >= startTime && currentTime <= endTime) ? 'active' : 'inactive'
        },

        getDisplayStatus(service) {
            const status = this.getDepartmentStatus(service);
            return status === 'active' ? 'Active' : 'Inactive';
        },

        viewQueueDetails(service) {
            this.$router.push({
                name: 'UserBookAppointmentView',
                params: {
                    serviceId: service.id,
                    adminId: service.admin_id
                }
            })
        },

        goBack() {
            this.$router.push({
                name: 'UserBook'  // Navigate to UserBook view
            })
        },        highlightText(text) {
            if (!this.searchQuery || !text) return text;

            // Escape special characters in the search query
            const escapedQuery = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(`(${escapedQuery})`, 'gi');

            return text.toString().replace(searchRegex, '<mark class="user-book-highlight">$1</mark>');
        },

        formatTime(time) {
            if (!time) return '';
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
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
@import '@/styles/mainpage-user/bookappointment.css';
</style>
