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
        <div class="user-content" :class="{ 'user-content-expanded': isSidebarCollapsed }">            <!-- Back Button positioned at top -->
            <button class="back-btn" @click="goBack" aria-label="Go back to previous page">
                <i class="bi bi-arrow-left" aria-hidden="true"></i>
                <span>Back</span>
            </button>
            
            <!-- Modern Header Section -->
            <header class="header-section" role="banner">
                <!-- Header Navigation & Title -->
                <div class="header-top">
                    <div class="header-title">
                        <h1>Book Appointment</h1>
                        <p>Select your preferred queue type and join the service</p>
                    </div>
                </div>

                <!-- Enhanced Queue Type Tabs -->
                <nav class="queue-tabs-section" role="tablist" aria-label="Queue type selection">
                    <div class="queue-tabs-container">
                        <div class="queue-tabs">                            <button
                                class="tab-btn"
                                :class="{ active: activeTab === 'regular' }"
                                @click="setActiveTab('regular')"
                                @keydown="handleTabKeydown($event)"
                                role="tab"
                                :aria-selected="activeTab === 'regular'"
                                aria-controls="regular-panel"
                                :tabindex="activeTab === 'regular' ? 0 : -1"
                            >
                                <div class="tab-icon">
                                    <i class="bi bi-person-plus" aria-hidden="true"></i>
                                </div>
                                <div class="tab-content">
                                    <span class="tab-title">Regular</span>
                                    <span class="tab-subtitle">Walk-in queue</span>
                                </div>
                            </button>
                            <button
                                class="tab-btn"
                                :class="{ active: activeTab === 'scheduled' }"
                                @click="setActiveTab('scheduled')"
                                @keydown="handleTabKeydown($event)"
                                role="tab"
                                :aria-selected="activeTab === 'scheduled'"
                                aria-controls="scheduled-panel"
                                :tabindex="activeTab === 'scheduled' ? 0 : -1"
                            >
                                <div class="tab-icon">
                                    <i class="bi bi-calendar-plus" aria-hidden="true"></i>
                                </div>
                                <div class="tab-content">
                                    <span class="tab-title">Scheduled</span>
                                    <span class="tab-subtitle">Book for later</span>
                                </div>
                            </button>
                            <button
                                class="tab-btn"
                                :class="{ active: activeTab === 'priority' }"
                                @click="setActiveTab('priority')"
                                @keydown="handleTabKeydown($event)"
                                role="tab"
                                :aria-selected="activeTab === 'priority'"
                                aria-controls="priority-panel"
                                :tabindex="activeTab === 'priority' ? 0 : -1"
                            >
                                <div class="tab-icon">
                                    <i class="bi bi-star" aria-hidden="true"></i>
                                </div>
                                <div class="tab-content">
                                    <span class="tab-title">Priority</span>
                                    <span class="tab-subtitle">Express service</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </nav>
            </header><!-- Modern Main Content Section -->
            <div class="main-content-section">
                <!-- Department Info Card -->
                <div class="department-card">
                    <div class="department-header">
                        <div class="department-icon">
                            <img v-if="establishment?.avatar"
                                 :src="`https://flow-backend-yxdw.onrender.com${establishment.avatar}`"
                                 :alt="establishment.name"
                                 class="establishment-avatar"
                            />
                            <i v-else class="bi bi-building"></i>
                        </div>
                        <div class="department-info">
                            <h2>{{ departmentInfo.establishmentName }}</h2>
                            <h3>{{ departmentInfo.serviceName }}</h3>
                            <div class="department-details">
                                <div class="detail-item">
                                    <i class="bi bi-geo-alt"></i>
                                    <span>{{ departmentInfo.room }} • {{ departmentInfo.address }}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="bi bi-envelope"></i>
                                    <span>{{ departmentInfo.email }}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="bi bi-telephone"></i>
                                    <span>{{ departmentInfo.phone }}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="bi bi-clock"></i>
                                    <span>{{ departmentInfo.hours }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="join-queue-action">
                            <button class="join-queue-btn" @click="joinQueue(activeTab)">
                                <i :class="getTabIcon(activeTab)"></i>
                                <span>{{ getTabActionText(activeTab) }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Queue Status Grid -->
                <div class="status-grid">
                    <div class="status-card">
                        <div class="status-icon serving">
                            <i class="bi bi-person-check"></i>
                        </div>
                        <div class="status-content">
                            <h3>Now Serving</h3>
                            <div class="status-number">{{ getCurrentServing() || '---' }}</div>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon next">
                            <i class="bi bi-person-lines-fill"></i>
                        </div>
                        <div class="status-content">
                            <h3>Next in Line</h3>
                            <div class="status-number">{{ getNextInLine() || '---' }}</div>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon queue">
                            <i class="bi bi-people"></i>
                        </div>
                        <div class="status-content">
                            <h3>In Queue</h3>
                            <div class="status-number">{{ getInQueueCount() }}</div>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon time">
                            <i class="bi bi-clock-history"></i>
                        </div>
                        <div class="status-content">
                            <h3>Est. Time</h3>
                            <div class="status-number">{{ getEstimatedTime() }}</div>
                        </div>
                    </div>
                </div>
            </div>            <!-- Queue Information Section -->
            <div class="queue-information-section">
                <!-- Your Queues -->
                <div class="your-queues-card">
                    <div class="card-header">
                        <h3>
                            <i class="bi bi-person-badge"></i>
                            Your {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }} Queues
                        </h3>
                        <div class="queue-count">{{ getFilteredYourQueue().length }}</div>
                    </div>
                    <div class="queue-table-container">
                        <div v-if="getFilteredYourQueue().length === 0" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>No {{ activeTab }} queues found</p>
                            <small>Join a queue to see it here</small>
                        </div>
                        <table v-else class="modern-queue-table">
                            <thead>
                                <tr>
                                    <th>Queue #</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="ticket in getFilteredYourQueue()" :key="ticket.number" 
                                    :class="{ 'serving-row': ticket.status === 'serving' }">
                                    <td>
                                        <span class="queue-number">{{ ticket.number }}</span>
                                    </td>
                                    <td>
                                        <span class="status-badge" :class="ticket.status">
                                            {{ ticket.status }}
                                        </span>
                                    </td>
                                    <td>{{ ticket.date }}</td>
                                    <td>{{ ticket.time || 'N/A' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Current Queue List -->
                <div class="current-queue-card">
                    <div class="card-header">
                        <h3>
                            <i class="bi bi-list-ol"></i>
                            {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }} Queue List
                        </h3>
                        <div class="live-indicator">
                            <span class="pulse-dot"></span>
                            Live
                        </div>
                    </div>
                    <div class="queue-list-container">
                        <div v-if="getFilteredQueueList().length === 0" class="empty-state">
                            <i class="bi bi-hourglass-split"></i>
                            <p>No active queues</p>
                            <small>Queue is currently empty</small>
                        </div>
                        <div v-else class="queue-items">
                            <div v-for="(ticket, index) in getFilteredQueueList()"
                                 :key="ticket.number"
                                 class="queue-item"
                                 :class="{ 
                                     'is-serving': ticket.status === 'serving',
                                     'is-next': index === 0 && ticket.status === 'pending'
                                 }">
                                <div class="queue-position">{{ index + 1 }}</div>
                                <div class="queue-info">
                                    <span class="queue-number">{{ ticket.number }}</span>
                                    <span class="queue-status" :class="ticket.status">{{ ticket.status }}</span>
                                </div>
                                <div class="queue-indicator">
                                    <i v-if="ticket.status === 'serving'" class="bi bi-play-circle-fill"></i>
                                    <i v-else-if="index === 0 && ticket.status === 'pending'" class="bi bi-clock"></i>
                                    <i v-else class="bi bi-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>        <!-- Schedule Modal -->
        <div class="avatar-modal-overlay" v-if="showScheduleModal" @click="cancelSchedule">
            <div class="avatar-modal" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="bi bi-calendar-plus"></i>
                        Schedule Appointment
                    </h3>
                    <button class="modal-close" @click="cancelSchedule" title="Close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="scheduleDate">
                            <i class="bi bi-calendar3"></i>
                            Preferred Date
                        </label>
                        <input
                            type="date"
                            id="scheduleDate"
                            v-model="scheduleDate"
                            :min="getCurrentDate()"
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label for="scheduleTime">
                            <i class="bi bi-clock"></i>
                            Preferred Time
                        </label>
                        <input
                            type="time"
                            id="scheduleTime"
                            v-model="scheduleTime"
                            :min="service?.hours_start"
                            :max="service?.hours_end"
                            class="form-input"
                        >
                        <small class="form-help">
                            Available: {{ convertTo12Hour(service?.hours_start) }} - {{ convertTo12Hour(service?.hours_end) }}
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="cancelSchedule">Cancel</button>
                        <button class="btn-primary" @click="confirmSchedule">
                            <i class="bi bi-check2"></i>
                            Confirm Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>        <!-- Priority Reason Modal -->
        <div class="avatar-modal-overlay" v-if="showPriorityModal" @click="cancelPriority">
            <div class="avatar-modal" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="bi bi-star"></i>
                        Priority Queue Reason
                    </h3>
                    <button class="modal-close" @click="cancelPriority" title="Close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="priorityReason">
                            <i class="bi bi-person-check"></i>
                            Select your priority category
                        </label>
                        <select id="priorityReason" v-model="priorityReason" class="form-select">
                            <option value="">Choose a category</option>
                            <option value="Senior Citizen">Senior Citizen (60+ years old)</option>
                            <option value="PWD">Person with Disability</option>
                            <option value="Pregnant">Pregnant</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div class="priority-notice">
                        <div class="notice-header">
                            <i class="bi bi-exclamation-triangle"></i>
                            <strong>Important Notice</strong>
                        </div>
                        <p>Priority queues are reserved for qualified individuals only. You may be required to present valid identification or documentation. Misuse of priority queue may result in removal from the queue.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="cancelPriority">Cancel</button>
                        <button class="btn-primary" @click="confirmPriority">
                            <i class="bi bi-check2"></i>
                            Confirm Priority
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Alert Container -->
        <div class="user-service-alert-container" v-if="success || error">
            <div v-if="success" class="user-service-alert user-service-alert-success">
                <i class="bi bi-check-circle"></i>
                <span>{{ success }}</span>
            </div>
            <div v-if="error" class="user-service-alert user-service-alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import UserNavbar from './UserNavbar.vue'
import UserTopNavbar from './UserTopNavbar.vue'
import axios from 'axios'

const API_BASE_URL = 'https://flow-backend-yxdw.onrender.com'

const getAuthHeaders = () => {
    const sessionToken = localStorage.getItem('userSessionToken');
    return {
        headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
        },
        withCredentials: true
    };
};

export default {
    name: 'UserBookAppointmentView',
    components: {
        UserNavbar,
        UserTopNavbar
    },
    data() {
        return {
            service: null,
            establishment: null,
            activeTab: 'regular',
            isSidebarCollapsed: false,
            mobileSidebarOpen: false, // For mobile sidebar state
            userProfile: {
                name: 'User',
                email: '',
                avatar: null
            },
            // Separate queue data for each type
            regularQueueData: {
                currentServing: '',
                nextInLine: '',
                inQueue: '0',
                estimatedTime: '',
                queueList: []
            },
            scheduledQueueData: {
                currentServing: '',
                nextInLine: '',
                inQueue: '0',
                estimatedTime: '',
                queueList: []
            },
            priorityQueueData: {
                currentServing: '',
                nextInLine: '',
                inQueue: '0',
                estimatedTime: '',
                queueList: []
            },            yourQueue: [],
            error: null,
            success: null,
            polling: null,
            waitingTime: '00:00:00',
            waitingTimeInterval: null,
            showScheduleModal: false,
            showPriorityModal: false,
            scheduleDate: '',
            scheduleTime: '',
            priorityReason: '',
            scheduleResolve: null,
            priorityResolve: null
        }
    },
    async created() {
        try {
            // Set active tab based on query parameter if available
            if (this.$route.query.tab) {
                this.activeTab = this.$route.query.tab;
            }

            await this.fetchServiceDetails();
            await this.fetchEstablishmentDetails();
            await this.fetchQueueData();
            this.startPolling();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    },
    beforeUnmount() {
        this.stopPolling();
        this.stopWaitingTimeCounter();
    },
    computed: {
        departmentInfo() {
            if (!this.service || !this.establishment) return {}

            const startTime = this.convertTo12Hour(this.service.hours_start);
            const endTime = this.convertTo12Hour(this.service.hours_end);

            return {
                id: this.service.id,
                establishmentName: this.establishment.name,
                serviceName: this.service.name,
                room: this.service.location,
                address: this.establishment.address,
                email: this.establishment.email,
                phone: this.service.phone || 'N/A',
                hours: `${startTime} - ${endTime}`,
                status: this.establishment.queue_status,
                max_queues: this.service.max_queues,
                ticket_prefix: this.service.ticket_prefix || 'A'
            }
        },
        isDepartmentAvailable() {
            return this.departmentInfo.status === 'active'
        }
    },
    methods: {
        setActiveTab(tab) {
            this.activeTab = tab;
        },
          // Add keyboard navigation for tabs
        handleTabKeydown(event) {
            const tabs = ['regular', 'scheduled', 'priority'];
            const currentIndex = tabs.indexOf(this.activeTab);
            
            switch (event.key) {
                case 'ArrowLeft': {
                    event.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                    this.setActiveTab(tabs[prevIndex]);
                    this.$nextTick(() => {
                        document.querySelector(`[aria-controls="${tabs[prevIndex]}-panel"]`)?.focus();
                    });
                    break;
                }
                case 'ArrowRight': {
                    event.preventDefault();
                    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                    this.setActiveTab(tabs[nextIndex]);
                    this.$nextTick(() => {
                        document.querySelector(`[aria-controls="${tabs[nextIndex]}-panel"]`)?.focus();
                    });
                    break;
                }
                case 'Home': {
                    event.preventDefault();
                    this.setActiveTab(tabs[0]);
                    this.$nextTick(() => {
                        document.querySelector(`[aria-controls="${tabs[0]}-panel"]`)?.focus();
                    });
                    break;
                }
                case 'End': {
                    event.preventDefault();
                    this.setActiveTab(tabs[tabs.length - 1]);
                    this.$nextTick(() => {
                        document.querySelector(`[aria-controls="${tabs[tabs.length - 1]}-panel"]`)?.focus();
                    });
                    break;
                }
            }
        },

        getTabIcon(tab) {
            const icons = {
                'regular': 'bi bi-person-plus',
                'scheduled': 'bi bi-calendar-plus',
                'priority': 'bi bi-star'
            };
            return icons[tab];
        },
        getTabActionText(tab) {
            const texts = {
                'regular': 'Join Queue',
                'scheduled': 'Book Queue',
                'priority': 'Priority Queue'
            };
            return texts[tab];
        },
        getCurrentServing() {
            return this[`${this.activeTab}QueueData`].currentServing;
        },
        getNextInLine() {
            return this[`${this.activeTab}QueueData`].nextInLine;
        },
        getInQueueCount() {
            return this[`${this.activeTab}QueueData`].inQueue;
        },
        getEstimatedTime() {
            return this[`${this.activeTab}QueueData`].estimatedTime;
        },
        getQueuePrefix(type) {
            const serviceName = this.service?.name || 'SERVICE';
            const cleanServiceName = serviceName.replace(/\s+/g, '').toUpperCase();

            const prefixes = {
                'regular': `R${cleanServiceName}`,
                'priority': `P${cleanServiceName}`,
                'scheduled': `S${cleanServiceName}`
            };
            return prefixes[type];
        },
        getFilteredYourQueue() {
            return this.yourQueue.filter(queue => {
                // Check if queue number starts with the expected pattern
                const queueType = this.activeTab.charAt(0).toUpperCase();
                const serviceName = this.service?.name?.replace(/\s+/g, '').toUpperCase() || 'SERVICE';
                const expectedPattern = `${queueType}${serviceName}`;
                return queue.number.startsWith(expectedPattern);
            });
        },
        getFilteredQueueList() {
            return this[`${this.activeTab}QueueData`].queueList;
        },
        getYourRecentQueue() {
            const filtered = this.getFilteredYourQueue();
            return filtered.length > 0 ? filtered[0] : null;
        },
        getYourNextQueue() {
            const filtered = this.getFilteredYourQueue();
            return filtered.length > 0 ? filtered[filtered.length - 1] : null;
        },
        getWaitingTimeDisplay() {
            if (this.activeTab === 'scheduled') {
                const recent = this.getYourRecentQueue();
                return recent?.time || 'No time';
            } else {
                const recent = this.getYourRecentQueue();
                return recent?.status === 'waiting' ? this.waitingTime : '00:00:00';
            }
        },
        async fetchServiceDetails() {
            try {
                const serviceId = this.$route.params.serviceId
                const response = await axios.get(`${API_BASE_URL}/services.php?id=${serviceId}`)
                this.service = response.data
            } catch (error) {
                console.error('Error fetching service details:', error)
                this.error = 'Failed to load service details'
            }
        },
        async fetchEstablishmentDetails() {
            try {
                const serviceId = this.$route.params.serviceId;
                const serviceResponse = await axios.get(`${API_BASE_URL}/services.php?id=${serviceId}`);
                const adminId = serviceResponse.data.admin_id;

                const response = await axios.get(`${API_BASE_URL}/establishments.php?admin_id=${adminId}`);
                const establishments = response.data;

                this.establishment = establishments.find(est => est.admin_id === adminId);

                if (!this.establishment) {
                    throw new Error('Establishment not found');
                }
            } catch (error) {
                console.error('Error fetching establishment details:', error);
                this.error = 'Failed to load establishment details';
            }
        },
        async fetchQueueData() {
            try {
                const serviceId = this.$route.params.serviceId;
                const response = await axios.get(
                    `${API_BASE_URL}/queue.php?service_id=${serviceId}`,
                    getAuthHeaders()
                );

                if (response.data) {
                    // Process all queue data
                    const allQueues = response.data.currentQueues || [];

                    // Get service name for filtering
                    const serviceName = this.service?.name?.replace(/\s+/g, '').toUpperCase() || 'SERVICE';

                    // Separate queues by type using new naming convention
                    const regularQueues = allQueues.filter(q => q.queue_number.startsWith(`R${serviceName}`));
                    const priorityQueues = allQueues.filter(q => q.queue_number.startsWith(`P${serviceName}`));
                    const scheduledQueues = allQueues.filter(q => q.queue_number.startsWith(`S${serviceName}`));

                    // Update regular queue data
                    this.regularQueueData = {
                        currentServing: this.findCurrentServing(regularQueues),
                        nextInLine: this.findNextInLine(regularQueues),
                        inQueue: regularQueues.filter(q => q.status === 'pending').length.toString(),
                        estimatedTime: this.calculateEstimatedTime(regularQueues.length),
                        queueList: regularQueues.map(q => ({
                            number: q.queue_number,
                            status: q.status
                        }))
                    };

                    // Update priority queue data
                    this.priorityQueueData = {
                        currentServing: this.findCurrentServing(priorityQueues),
                        nextInLine: this.findNextInLine(priorityQueues),
                        inQueue: priorityQueues.filter(q => q.status === 'pending').length.toString(),
                        estimatedTime: this.calculateEstimatedTime(priorityQueues.length),
                        queueList: priorityQueues.map(q => ({
                            number: q.queue_number,
                            status: q.status
                        }))
                    };

                    // Update scheduled queue data
                    this.scheduledQueueData = {
                        currentServing: this.findCurrentServing(scheduledQueues),
                        nextInLine: this.findNextInLine(scheduledQueues),
                        inQueue: scheduledQueues.filter(q => q.status === 'pending').length.toString(),
                        estimatedTime: this.calculateEstimatedTime(scheduledQueues.length),
                        queueList: scheduledQueues.map(q => ({
                            number: q.queue_number,
                            status: q.status
                        }))
                    };

                    // Process user's queues with enhanced time handling
                    const sortedQueues = (response.data.yourQueues || []).sort((a, b) => {
                        const dateA = new Date(a.scheduled_time || a.created_at);
                        const dateB = new Date(b.scheduled_time || b.created_at);
                        return dateA - dateB;
                    });

                    this.yourQueue = sortedQueues.map(q => {
    // For scheduled queues, use scheduled_time
    if (q.scheduled_time) {
        return {
            number: q.queue_number,
            status: q.status,
            date: new Date(q.scheduled_time).toLocaleDateString(),
            time: new Date(q.scheduled_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            created_at: q.created_at
        };
    }
    // For regular and priority queues, use created_at (when they joined)
    else {
        return {
            number: q.queue_number,
            status: q.status,
            date: new Date(q.created_at).toLocaleDateString(),
            time: new Date(q.created_at).toLocaleTimeString(),
            created_at: q.created_at
        };
    }
});

                    this.stopWaitingTimeCounter();
                    this.startWaitingTimeCounter();
                }
            } catch (error) {
                console.error('Error fetching queue data:', error);
                this.error = 'Failed to load queue data';

                if (error.response?.status === 401) {
                    alert('Session expired. Please login again.');
                    this.$router.push('/login');
                }
            }
        },
        findCurrentServing(queues) {
            const serving = queues.find(q => q.status === 'serving');
            return serving ? serving.queue_number : '';
        },
        findNextInLine(queues) {
            const pending = queues.filter(q => q.status === 'pending');
            return pending.length > 0 ? pending[0].queue_number : '';
        },
        calculateEstimatedTime(queueLength) {
            const avgWaitTime = 10; // Default 10 minutes per person
            const totalWaitTime = avgWaitTime * queueLength;
            return `${totalWaitTime} mins`;
        },
        // ... rest of existing methods remain the same ...
        hasActiveQueue() {
            return this.yourQueue.some(queue =>
                ['waiting', 'pending', 'serving', 'scheduled'].includes(queue.status.toLowerCase())
            );
        },
        hasQueueOnSameDay(date) {
            const targetDate = new Date(date).toLocaleDateString();
            return this.yourQueue.some(queue => {
                const queueDate = new Date(queue.date).toLocaleDateString();
                return queueDate === targetDate;
            });
        },
        startPolling() {
            this.polling = setInterval(async () => {
                await this.fetchQueueData();
            }, 30000);
        },
        stopPolling() {
            if (this.polling) {
                clearInterval(this.polling)
            }
        },
        startWaitingTimeCounter() {
            this.stopWaitingTimeCounter();

            const recentQueue = this.getYourRecentQueue();
            if (recentQueue?.status === 'waiting') {
                const startTime = new Date(recentQueue.created_at).getTime();

                this.waitingTimeInterval = setInterval(() => {
                    const now = new Date().getTime();
                    const diff = now - startTime;

                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    this.waitingTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }, 1000);
            } else {
                this.waitingTime = '00:00:00';
            }
        },
        stopWaitingTimeCounter() {
            if (this.waitingTimeInterval) {
                clearInterval(this.waitingTimeInterval);
                this.waitingTimeInterval = null;
            }
        },
        async joinQueue(queueType = 'regular') {
            try {
                if (queueType !== 'scheduled') {
                    const hasActiveQueueOfType = this.yourQueue.some(queue =>
                        queue.status.toLowerCase() !== 'completed' &&
                        queue.status.toLowerCase() !== 'cancelled' &&
                        queue.number.startsWith(this.getQueuePrefix(queueType))
                    );                    if (hasActiveQueueOfType) {
                        this.error = `You already have an active ${queueType} queue. Please wait for it to be completed.`;
                        setTimeout(() => { this.error = null; }, 3000);
                        return;
                    }
                }

                const prefix = this.getQueuePrefix(queueType);

                const queueData = {
                    service_id: this.departmentInfo.id,
                    queue_type_id: this.getQueueTypeId(queueType),
                    estimated_wait: parseInt(this.getEstimatedTime()),
                    notes: '',
                    ticket_prefix: prefix
                };

                if (queueType === 'scheduled') {
                    const scheduledTime = await this.promptScheduleTime();
                    if (!scheduledTime) return;                    if (this.hasQueueOnSameDay(scheduledTime)) {
                        this.error = 'You already have a queue scheduled for this date. Please select a different date.';
                        setTimeout(() => { this.error = null; }, 3000);
                        return;
                    }

                    queueData.scheduled_time = scheduledTime;
                }

                if (queueType === 'priority') {
                    const priorityReason = await this.promptPriorityReason();
                    if (!priorityReason) return;
                    queueData.notes = priorityReason;
                }

                const response = await axios.post(
                    `${API_BASE_URL}/queue.php`,
                    queueData,
                    getAuthHeaders()
                );                if (response.data.success) {
                    this.success = `Queue request submitted! Your number is ${response.data.queue_number}`;
                    setTimeout(() => { this.success = null; }, 3000);
                    await this.fetchQueueData(); // Refresh data
                }

            } catch (error) {
                console.error('Error joining queue:', error);                if (error.response?.status === 401) {
                    this.error = 'Session expired. Please login again.';
                    setTimeout(() => {
                        this.error = null;
                        this.$router.push('/login');
                    }, 2000);
                } else {
                    this.error = 'Failed to join queue. Please try again.';
                    setTimeout(() => { this.error = null; }, 3000);
                }
            }
        },
        getQueueTypeId(type) {
            const types = {
                'regular': 1,
                'priority': 2,
                'scheduled': 3
            };
            return types[type] || 1;
        },        promptScheduleTime() {
            return new Promise((resolve) => {
                this.showScheduleModal = true;
                this.scheduleDate = this.getCurrentDate();
                this.scheduleTime = this.service?.hours_start || '09:00';
                this.scheduleResolve = resolve;
                // Prevent body scroll when modal is open
                document.body.classList.add('modal-open');
            });
        },
        promptPriorityReason() {
            return new Promise((resolve) => {
                this.showPriorityModal = true;
                this.priorityReason = '';
                this.priorityResolve = resolve;
                // Prevent body scroll when modal is open
                document.body.classList.add('modal-open');
            });
        },confirmSchedule() {
            if (!this.scheduleDate) {
                this.error = 'Please select a date';
                setTimeout(() => { this.error = null; }, 3000);
                return;
            }

            if (!this.scheduleTime) {
                this.error = 'Please select a time';
                setTimeout(() => { this.error = null; }, 3000);
                return;
            }

            // Validate time is within service hours
            if (this.service && (this.scheduleTime < this.service.hours_start || this.scheduleTime > this.service.hours_end)) {
                this.error = `Please select a time between ${this.convertTo12Hour(this.service.hours_start)} and ${this.convertTo12Hour(this.service.hours_end)}`;
                setTimeout(() => { this.error = null; }, 3000);
                return;
            }            this.showScheduleModal = false;
            this.success = 'Appointment time scheduled successfully';
            setTimeout(() => { this.success = null; }, 3000);
            this.scheduleResolve(`${this.scheduleDate} ${this.scheduleTime}:00`);
            // Remove modal-open class to restore body scroll
            document.body.classList.remove('modal-open');
        },        cancelSchedule() {
            this.showScheduleModal = false;
            this.error = null;
            this.scheduleResolve(null);
            // Remove modal-open class to restore body scroll
            document.body.classList.remove('modal-open');
        },confirmPriority() {
            if (!this.priorityReason) {
                this.error = 'Please select a priority reason';
                setTimeout(() => { this.error = null; }, 3000);
                return;
            }            this.showPriorityModal = false;
            this.success = 'Priority reason confirmed';
            setTimeout(() => { this.success = null; }, 3000);
            this.priorityResolve(this.priorityReason);
            // Remove modal-open class to restore body scroll
            document.body.classList.remove('modal-open');
        },        cancelPriority() {
            this.showPriorityModal = false;
            this.error = null;
            this.priorityResolve(null);
            // Remove modal-open class to restore body scroll
            document.body.classList.remove('modal-open');
        },
        goBack() {
            if (this.establishment) {
                this.$router.push({
                    name: 'UserBookAppointment',
                    params: { departmentId: this.establishment.admin_id }
                });
            } else {
                this.$router.push('/user/book-appointment');
            }
        },
        getCurrentDate() {
            const now = new Date();
            return now.toISOString().split('T')[0];
        },
        convertTo12Hour(time24) {
            if (!time24) return '';
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
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

<style>
@import '@/styles/mainpage-user/bookappointmentview.css';
</style>
