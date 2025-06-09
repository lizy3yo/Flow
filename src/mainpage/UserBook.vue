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

                <!-- Header Section -->
                <div class="user-book-header-section">
                    <h1 class="user-book-main-header">Book an Appointment</h1>
                    <p class="user-book-subtitle">Find and schedule appointments with institutions across the Philippines. Browse available services and book your preferred time slot.</p>
                </div>

                <!-- Search and Filter Section -->
                <div class="user-book-filters-container">
                    <!-- Search Bar -->
                    <div class="user-book-search-bar">
                        <i class="bi bi-search"></i>
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Search departments..."
                        >
                    </div>

                    <!-- Filters -->
                    <div class="user-book-filter-options">
                        <select v-model="selectedCity" class="user-book-filter-select">
                            <option value="">All Locations</option>
                            <optgroup label="Metro Manila">
                                <option value="Manila">Manila</option>
                                <option value="Quezon City">Quezon City</option>
                                <option value="Makati">Makati</option>
                                <option value="Taguig">Taguig</option>
                                <option value="Pasig">Pasig</option>
                                <option value="Mandaluyong">Mandaluyong</option>
                                <option value="Pasay">Pasay</option>
                                <option value="Parañaque">Parañaque</option>
                                <option value="Muntinlupa">Muntinlupa</option>
                                <option value="Las Piñas">Las Piñas</option>
                            </optgroup>
                            <optgroup label="Luzon">
                                <option value="Baguio">Baguio</option>
                                <option value="Angeles">Angeles</option>
                                <option value="Olongapo">Olongapo</option>
                                <option value="Dagupan">Dagupan</option>
                                <option value="Laoag">Laoag</option>
                                <option value="Naga">Naga</option>
                                <option value="Legazpi">Legazpi</option>
                                <option value="Lucena">Lucena</option>
                            </optgroup>
                            <optgroup label="Visayas">
                                <option value="Cebu City">Cebu City</option>
                                <option value="Iloilo">Iloilo</option>
                                <option value="Bacolod">Bacolod</option>
                                <option value="Tacloban">Tacloban</option>
                                <option value="Tagbilaran">Tagbilaran</option>
                                <option value="Dumaguete">Dumaguete</option>
                            </optgroup>
                            <optgroup label="Mindanao">
                                <option value="Davao City">Davao City</option>
                                <option value="Zamboanga">Zamboanga</option>
                                <option value="Cagayan de Oro">Cagayan de Oro</option>
                                <option value="General Santos">General Santos</option>
                                <option value="Butuan">Butuan</option>
                                <option value="Cotabato">Cotabato</option>
                                <option value="Iligan">Iligan</option>
                            </optgroup>
                        </select>
                    </div>                     <div class="user-book-filter-options">
                        <div class="user-book-dropdown" v-click-outside="closeDropdown">
                            <button @click="toggleDropdown" class="user-book-filter-button">
                                Filters <i class="bi bi-funnel"></i>
                            </button>
                            <div class="user-book-dropdown-content" v-show="isDropdownOpen">
                                <!-- Sort by Name -->
                                <div class="filter-group">
                                    <h4>Sort by Name</h4>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="nameSort" value="nameAsc">
                                        Name (A-Z)
                                    </label>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="nameSort" value="nameDesc">
                                        Name (Z-A)
                                    </label>
                                </div>

                                <!-- Sort by Queue -->
                                <div class="filter-group">
                                    <h4>Sort by Queue</h4>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="queueSort" value="queueAsc">
                                        Queue (Low to High)
                                    </label>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="queueSort" value="queueDesc">
                                        Queue (High to Low)
                                    </label>
                                </div>

                                <!-- Status Filter -->
                                <div class="filter-group">
                                    <h4>Status</h4>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="selectedStatus" value="active">
                                        Active
                                    </label>
                                    <label class="checkbox-container">
                                        <input type="radio" v-model="selectedStatus" value="inactive">
                                        Inactive
                                    </label>
                                </div>
                            </div>
                        </div>
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
                </div>                <!-- Departments Grid View -->
                <div v-if="viewMode === 'grid'" class="user-book-departments-grid">
                    <div v-for="dept in filteredDepartments" :key="dept.id" class="user-book-card">
                        <div class="user-book-content">
                            <div class="user-book-icon">
                                <img v-if="dept.avatar"
                                     :src="`https://flow-backend-yxdw.onrender.com${dept.avatar}`"
                                     :alt="dept.name"
                                     class="establishment-avatar"
                                />
                                <i v-else class="bi bi-hospital"></i>
                            </div>
                            <h2 v-html="highlightText(dept.name)"></h2>
                            <p v-html="highlightText(dept.description)"></p>
                            <div class="user-book-info">
                                <div class="user-book-info-item">
                                    <i class="bi bi-clock"></i>
                                    <span>
                                        Queue Status:
                                        <span v-html="highlightText(dept.status)" :class="{'user-book-queue-active': dept.status === 'active', 'user-book-queue-inactive': dept.status === 'inactive'}"></span>
                                    </span>
                                </div>
                                <!-- Replace the existing location display -->
                                <div class="user-book-info-item">
                                    <i class="bi bi-geo-alt"></i>
                                    <span v-html="highlightText(dept.city)"></span>
                                </div>
                                <!-- Add the address below -->
                                <div class="user-book-info-item">
                                    <i class="bi bi-pin-map"></i>
                                    <span v-html="highlightText(dept.address)"></span>
                                </div>
                                <div class="user-book-info-item">
                                    <i class="bi bi-building"></i>
                                    <span v-html="highlightText(dept.type)"></span>
                                </div>
                            </div>                            <button
                                class="user-book-view-btn"
                                @click.stop="handleBookingClick(dept)"
                                :class="{ 'disabled': dept.status === 'inactive' }"
                                :disabled="dept.status === 'inactive'"
                            >
                                {{ dept.status === 'inactive' ? 'Unavailable' : 'Book Appointment' }}
                                <i class="bi bi-arrow-right" v-if="dept.status === 'active'"></i>
                                <i class="bi bi-exclamation-triangle" v-if="dept.status === 'inactive'"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Departments Table View -->
                <div v-else-if="viewMode === 'table'" class="user-book-table-container">
                    <div class="user-book-table-wrapper">
                        <table class="user-book-table">
                            <thead>
                                <tr>
                                    <th>Establishment</th>
                                    <th>Description</th>
                                    <th>Location</th>
                                    <th>Address</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="dept in filteredDepartments" :key="dept.id" class="table-row">
                                    <td class="service-cell">
                                        <div class="service-info">
                                            <div class="service-avatar">
                                                <img v-if="dept.avatar"
                                                     :src="`https://flow-backend-yxdw.onrender.com${dept.avatar}`"
                                                     :alt="dept.name"
                                                     class="table-establishment-avatar"
                                                />
                                                <i v-else class="bi bi-hospital"></i>
                                            </div>
                                            <span v-html="highlightText(dept.name)" class="service-name"></span>
                                        </div>
                                    </td>
                                    <td class="description-cell">
                                        <span v-html="highlightText(dept.description)" class="service-description"></span>
                                    </td>
                                    <td>
                                        <span v-html="highlightText(dept.city)"></span>
                                    </td>
                                    <td>
                                        <span v-html="highlightText(dept.address)" class="address-text"></span>
                                    </td>
                                    <td>
                                        <span v-html="highlightText(dept.type)" class="type-badge"></span>
                                    </td>
                                    <td>
                                        <span 
                                            v-html="highlightText(dept.status)" 
                                            :class="['status-badge', {
                                                'status-active': dept.status === 'active', 
                                                'status-inactive': dept.status === 'inactive'
                                            }]"
                                        ></span>
                                    </td>
                                    <td>                                        <button
                                            class="user-book-view-btn"
                                            @click="handleBookingClick(dept)"
                                            :class="{ 'disabled': dept.status === 'inactive' }"
                                            :disabled="dept.status === 'inactive'"
                                        >
                                            {{ dept.status === 'inactive' ? 'Unavailable' : 'Book Appointment' }}
                                            <i class="bi bi-arrow-right" v-if="dept.status === 'active'"></i>
                                            <i class="bi bi-exclamation-triangle" v-if="dept.status === 'inactive'"></i>
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

export default {
    name: 'UserBook',
    directives: {
        clickOutside: {
            mounted(el, binding) {
                el.clickOutsideEvent = function(event) {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value(event);
                    }
                };
                document.addEventListener('click', el.clickOutsideEvent);
            },
            unmounted(el) {
                document.removeEventListener('click', el.clickOutsideEvent);
            },
        },
    },
    components: {
        UserNavbar,
        UserTopNavbar
    },    data() {
        return {
            searchQuery: '',
            selectedCity: '',
            selectedStatus: '',
            nameSort: '',
            queueSort: '',
            isDropdownOpen: false,
            departments: [], // Initialize as empty array
            isSidebarCollapsed: false,
            mobileSidebarOpen: false, // For mobile sidebar state
            userProfile: null,
            viewMode: 'table' // Default to table view
        }
    },

    async created() {
        try {
            const response = await axios.get('https://flow-backend-yxdw.onrender.com/flow-application-cc/api/establishments.php')
            if (response.data) {
                this.departments = response.data.map(dept => ({
                    id: dept.admin_id,
                    name: dept.name,
                    description: dept.description,
                    icon: 'bi bi-hospital', // Fallback icon
                    avatar: dept.avatar, // Add this line
                    currentQueue: 0,
                    status: dept.queue_status,
                    city: dept.location, // Separate city
                    address: dept.address, // Separate address
                    type: dept.building_type
                }))
            }
        } catch (error) {
            console.error('Error fetching departments:', error)
        }
    },
    computed: {
        filteredDepartments() {
            let filtered = [...this.departments]

            // Enhanced search functionality
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase()
                filtered = filtered.filter(dept =>
                    dept.name.toLowerCase().includes(query) ||
                    dept.description.toLowerCase().includes(query) ||
                    dept.city.toLowerCase().includes(query) ||     // Changed from dept.location
                    dept.address.toLowerCase().includes(query) ||  // Added address search
                    dept.type.toLowerCase().includes(query) ||
                    dept.status.toLowerCase().includes(query)
                )
            }

            // Filter by city
            if (this.selectedCity) {
                filtered = filtered.filter(dept =>
                    dept.city.includes(this.selectedCity)  // Changed from dept.location
                )
            }

            // Filter by status
            if (this.selectedStatus) {
                filtered = filtered.filter(dept =>
                    dept.status === this.selectedStatus
                )
            }

            // Apply all sorts simultaneously
            filtered.sort((a, b) => {
                // First priority: Name sort
                if (this.nameSort) {
                    if (this.nameSort === 'nameAsc') {
                        const comparison = a.name.localeCompare(b.name);
                        if (comparison !== 0) return comparison;
                    } else if (this.nameSort === 'nameDesc') {
                        const comparison = b.name.localeCompare(a.name);
                        if (comparison !== 0) return comparison;
                    }
                }

                // Second priority: Queue sort
                if (this.queueSort) {
                    if (this.queueSort === 'queueAsc') {
                        return a.currentQueue - b.currentQueue;
                    } else if (this.queueSort === 'queueDesc') {
                        return b.currentQueue - a.currentQueue;
                    }
                }

                return 0;
            });

            return filtered;
        }
    },
    methods: {
        handleBookingClick(dept) {
            if (dept.status === 'inactive') {
                alert('This service is currently inactive and not accepting appointments.');
                return;
            }
            this.navigateToBooking(dept.id);
        },
        navigateToBooking(deptId) {
            this.$router.push({
                name: 'UserBookAppointment',
                params: { departmentId: deptId }
            })
        },
        highlightText(text) {
            if (!this.searchQuery || !text) return text;

            // Escape special characters in the search query
            const escapedQuery = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(`(${escapedQuery})`, 'gi');

            return text.toString().replace(searchRegex, '<mark class="user-book-highlight">$1</mark>');
        },
        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },
        closeDropdown() {
            this.isDropdownOpen = false;
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
        },
        async fetchUserProfile() {
            try {
                const response = await axios.get('/flow-application-cc/api/user-profile.php', {
                    withCredentials: true
                });

                if (response.data) {
                    this.userProfile = {
                        name: `${response.data.first_name} ${response.data.last_name}`.trim() || 'User',
                        email: response.data.email || '',
                        avatar: response.data.avatar // Remove formatAvatarUrl here
                    };
                    localStorage.setItem('user', JSON.stringify(this.userProfile));
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    this.userProfile = {
                        name: user.name || 'User',
                        email: user.email || '',
                        avatar: user.avatar // Remove formatAvatarUrl here
                    };
                }
            }
        },
        formatAvatarUrl(url) {
            if (!url) return null;
            if (url === 'null' || url === 'undefined') return null;

            // If it's already an absolute URL, return it as is
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }

            // If it's a relative path, make it absolute
            if (url.startsWith('/')) {
                return `https://flow-backend-yxdw.onrender.com${url}`;
            }

            // If it doesn't start with a slash, add one
            return `https://flow-backend-yxdw.onrender.com/${url}`;
        },
    },
    mounted() {
        // Initialize sidebar state from localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            this.isSidebarCollapsed = JSON.parse(savedState);
        }

        // Update user profile fetching
        this.fetchUserProfile();
    }
}
</script>

<style scoped>
@import '@/styles/mainpage-user/book.css';
@import '@/styles/mainpage-user/root.css';
@import '@/styles/mainpage-user/content.css';
</style>
