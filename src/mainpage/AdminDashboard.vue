<template>  <div class="page-container" :class="{'sidebar-collapsed-content': isSidebarCollapsed}">
    <AdminNavbar
      :isSidebarCollapsed="isSidebarCollapsed"
      @sidebar-toggle="handleSidebarToggle"
      ref="adminNavbar"
    />
    <AdminTopNavbar 
      :isSidebarCollapsed="isSidebarCollapsed"
      :userProfile="userProfile"
      :status="adminStatus"
      @sidebar-toggle="toggleSidebar"
      @mobile-sidebar-toggle="handleMobileSidebarToggle"
      @sign-out="handleSignOut"
      @status-change="handleStatusChange"
    />

    
    <div class="content">
      <!-- Quick Actions Section -->
      <div class="admin-dash-quick-actions">
        <h2 class="admin-dash-section-title">Quick Actions</h2>
        <div class="admin-dash-action-buttons">
        
          <button class="admin-dash-action-btn" @click="handleQuickAction('units')">
            <i class="bi bi-gear"></i>
            <span>Manage Units</span>
          </button>
          <button class="admin-dash-action-btn" @click="handleQuickAction('settings')">
            <i class="bi bi-sliders"></i>
            <span>System Settings</span>
          </button>
         
          
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="admin-dash-stats-container">
        <div
          class="admin-dash-stat-card"
          v-for="(stat, index) in statisticsCards"
          :key="stat.key"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="handleStatCardClick(stat.key)"
        >
          <div class="admin-dash-stat-icon" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="admin-dash-stat-info">
            <h3>{{ stat.title }}</h3>
            <p class="admin-dash-stat-number">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-trend" :class="stat.trendClass" v-if="stat.trend">
                <i :class="stat.trendIcon"></i>
                {{ stat.trend }}
              </span>
            </p>
          </div>
          <div class="admin-dash-stat-overlay"></div>
        </div>
      </div>

      <!-- Dashard Grid -->
      <div class="admin-dash-dashboard-grid">        <!-- Service Units Overview -->
        <div class="admin-dash-service-units-section" :class="{ 'has-more-items': hasMoreThanThreeUnits }">
          <div class="admin-dash-section-header">
            <h2>Service Units Overview</h2>
            <div class="admin-dash-header-actions">
              <div class="admin-dash-units-summary">
                <span class="units-count">{{ departments.length }} Units</span>
                <span class="units-active">{{ activeUnitsCount }} Active</span>
              </div>              <div class="admin-dash-sort-dropdown">
                <i class="bi bi-funnel"></i>
                <span class="selected-option">{{ getSelectedOptionText() }}</span>
                <select v-model="sortOption" @change="handleSortChange" class="admin-dash-sort-select">
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                  <option value="queue-desc">Highest</option>
                  <option value="queue-asc">Lowest</option>
                </select>
              </div>              <button class="admin-dash-view-all-btn" @click="navigateToServices" title="View All Services">
                <span>View All</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="admin-dash-loading-skeleton">
            <div v-for="n in 3" :key="n" class="skeleton-unit-item">
              <div class="skeleton-header"></div>
              <div class="skeleton-details"></div>
            </div>
          </div>

          <!-- Service Units List -->
          <div v-else class="admin-dash-service-units-list" :class="{ 'scrollable': hasMoreThanThreeUnits }">
            <div
              v-for="(dept, index) in sortedDepartments"
              :key="dept.id"
              class="admin-dash-service-unit-item"
              :style="{ animationDelay: `${(index + 4) * 100}ms` }"
              @click="handleUnitClick(dept)"
            ><div class="admin-dash-unit-main-info">
                <div class="unit-title-section">
                  <h3>{{ dept.name }}</h3>
                  <div class="unit-queue-indicator">
                    <i class="bi bi-people-fill"></i>
                    <span>{{ dept.currentQueue }}</span>
                  </div>
                </div>
              </div>              <div class="admin-dash-unit-bottom-section">
                <div class="admin-dash-unit-details">
                <div class="admin-dash-queue-info">
                  <div class="detail-item">
                    <i class="bi bi-people"></i>
                    <span>Queue: {{ dept.currentQueue }}</span>
                  </div>
                </div>
                <div class="admin-dash-hours-info">
                  <div class="detail-item">
                    <i class="bi bi-clock"></i>
                    <span>{{ getServiceHours(dept.id) }}</span>
                  </div>
                </div>
                <div class="admin-dash-operating-status">
                  <div class="detail-item" :class="isUnitOpen(dept.id) ? 'status-open' : 'status-closed'">
                    <i class="bi bi-circle-fill"></i>
                    <span>{{ isUnitOpen(dept.id) ? 'Open' : 'Closed' }}</span>
                  </div>
                </div>
              </div>
                <div class="admin-dash-unit-status-badge" :class="dept.status">
                  <i class="bi bi-circle-fill"></i>
                  {{ dept.status }}
                </div>
              </div>
              <div class="admin-dash-unit-hover-overlay"></div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="admin-dash-charts-section">
          <div class="admin-dash-chart-container">
            <div class="chart-header">
              <h2>Queue Distribution</h2>
              <div class="chart-actions">
                <button class="chart-action-btn" @click="refreshChartData" title="Refresh Data">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
                <button class="chart-action-btn" @click="exportChartData" title="Export Chart">
                  <i class="bi bi-download"></i>
                </button>
              </div>
            </div>
            <div class="chart-wrapper" :class="{ 'chart-loading': isChartLoading }">
              <div v-if="isChartLoading" class="chart-loading-overlay">
                <div class="chart-spinner"></div>
              </div>
              <Pie :data="queueDistributionData" :options="pieChartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import AdminTopNavbar from './AdminTopNavbar.vue'
import { Pie } from 'vue-chartjs'
import axios from 'axios'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend,
  ArcElement
)

export default {
  name: 'AdminDashboard',
  components: {
    AdminNavbar,
    AdminTopNavbar,
    Pie
  },
  data() {
    return {
      isSidebarCollapsed: false,
      userProfile: null,
      adminStatus: 'active',
      isLoading: true,
      isChartLoading: false,
      sortOption: 'name-asc',
      statistics: {
        totalQueue: 0,
        queueTrend: 0,
        priorityQueue: 0,
        priorityTrend: 0,
        scheduledQueue: 0,
        scheduledTrend: 0,
        activeUnits: 0,
        unitsTrend: 0
      },
      // Add previous statistics to track changes
      previousStatistics: {
        totalQueue: 0,
        priorityQueue: 0,
        scheduledQueue: 0,
        activeUnits: 0
      },
      departments: [],
      serviceHours: [],      queueDistributionData: {
        labels: ['Regular Queue', 'Priority Queue', 'Scheduled', 'Completed'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: [
            '#0B0B1B',
            '#6461A0',
            '#CDC8FE',
            '#9693CE'
          ],
          borderColor: [
            '#ffffff',
            '#ffffff',
            '#ffffff',
            '#ffffff'
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#1a1a2e',
            '#7975b5',
            '#d4d0ff',
            '#a8a5d4'
          ],
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 3
        }]
      },      pieChartOptions: {
        responsive: true,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 22,        // Slightly increased for better visibility
              boxHeight: 22,       // Matched to boxWidth
              padding: 18,         // Optimized spacing
              font: {
                size: 15,          // Slightly larger font for better readability
                weight: '500'      // Added font weight
              },
              generateLabels: function(chart) {
                const datasets = chart.data.datasets[0].data;
                const labels = chart.data.labels;
                const colors = chart.data.datasets[0].backgroundColor;

                return labels.map((label, index) => ({
                  text: `${label} (${datasets[index]})`,
                  fillStyle: colors[index],
                  strokeStyle: colors[index],
                  lineWidth: 0,
                  hidden: false,
                  index: index
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#6461A0',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        maintainAspectRatio: false,  // Allows custom height to fill container
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        elements: {
          arc: {
            borderWidth: 2,          // Adds subtle border to pie slices
            borderColor: '#ffffff'   // White border for better separation
          }
        }
      }
    }
  },
  computed: {
    statisticsCards() {
      return [
        {
          key: 'totalQueue',
          title: 'Regular Queue',
          value: this.statistics.totalQueue,
          icon: 'bi bi-people-fill',
          iconClass: 'icon-regular',
          trend: this.statistics.queueTrend !== 0 ? `${this.statistics.queueTrend > 0 ? '+' : ''}${this.statistics.queueTrend}` : null,
          trendClass: this.statistics.queueTrend > 0 ? 'trend-up' : this.statistics.queueTrend < 0 ? 'trend-down' : 'trend-neutral',
          trendIcon: this.statistics.queueTrend > 0 ? 'bi bi-arrow-up' : this.statistics.queueTrend < 0 ? 'bi bi-arrow-down' : null
        },
        {
          key: 'priorityQueue',
          title: 'Priority Queue',
          value: this.statistics.priorityQueue,
          icon: 'bi bi-calendar-check',
          iconClass: 'icon-priority',
          trend: this.statistics.priorityTrend !== 0 ? `${this.statistics.priorityTrend > 0 ? '+' : ''}${this.statistics.priorityTrend}` : null,
          trendClass: this.statistics.priorityTrend > 0 ? 'trend-up' : this.statistics.priorityTrend < 0 ? 'trend-down' : 'trend-neutral',
          trendIcon: this.statistics.priorityTrend > 0 ? 'bi bi-arrow-up' : this.statistics.priorityTrend < 0 ? 'bi bi-arrow-down' : null
        },
        {
          key: 'scheduledQueue',
          title: 'Scheduled Queue',
          value: this.statistics.scheduledQueue,
          icon: 'bi bi-calendar2-check',
          iconClass: 'icon-scheduled',
          trend: this.statistics.scheduledTrend !== 0 ? `${this.statistics.scheduledTrend > 0 ? '+' : ''}${this.statistics.scheduledTrend}` : null,
          trendClass: this.statistics.scheduledTrend > 0 ? 'trend-up' : this.statistics.scheduledTrend < 0 ? 'trend-down' : 'trend-neutral',
          trendIcon: this.statistics.scheduledTrend > 0 ? 'bi bi-arrow-up' : this.statistics.scheduledTrend < 0 ? 'bi bi-arrow-down' : null
        },
        {
          key: 'activeUnits',
          title: 'Service Units',
          value: this.statistics.activeUnits,
          icon: 'bi bi-check-circle',
          iconClass: 'icon-units',
          trend: this.statistics.unitsTrend !== 0 ? `${this.statistics.unitsTrend > 0 ? '+' : ''}${this.statistics.unitsTrend}` : null,
          trendClass: this.statistics.unitsTrend > 0 ? 'trend-up' : this.statistics.unitsTrend < 0 ? 'trend-down' : 'trend-neutral',
          trendIcon: this.statistics.unitsTrend > 0 ? 'bi bi-arrow-up' : this.statistics.unitsTrend < 0 ? 'bi bi-arrow-down' : null
        }
      ];
    },
    activeUnitsCount() {
      return this.departments.filter(dept => dept.status === 'active').length;
    },    sortedDepartments() {
      if (!this.departments || this.departments.length === 0) {
        return [];
      }

      let sorted = [...this.departments]; // Create a copy to avoid mutating original array

      switch (this.sortOption) {
        case 'queue-desc':
          return sorted.sort((a, b) => b.currentQueue - a.currentQueue);
        case 'queue-asc':
          return sorted.sort((a, b) => a.currentQueue - b.currentQueue);
        case 'name-asc':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
          return sorted.sort((a, b) => b.name.localeCompare(a.name));
        default:
          return sorted; // Return original order for 'default'
      }
    },
    hasMoreThanThreeUnits() {
      return this.departments && this.departments.length > 3;
    }
  },
  watch: {
    adminStatus: {
      // eslint-disable-next-line no-unused-vars
      handler(newStatus) {
        this.updateDepartmentStatuses();
      }
    }
  },
  async mounted() {
    // Get initial sidebar state from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isSidebarCollapsed = savedState === 'true';

    // Load previous statistics from localStorage if available
    const savedPreviousStats = localStorage.getItem('previousStatistics');
    if (savedPreviousStats) {
      try {
        this.previousStatistics = JSON.parse(savedPreviousStats);
      } catch (e) {
        console.log('Could not parse previous statistics from localStorage');
      }
    }

    // Load user profile from localStorage or fetch it
    this.loadUserProfile();
    await this.fetchDepartments();
    this.fetchAdminStatus();

    // Set up periodic refresh to update trends
    this.setupPeriodicRefresh();

    // Set loading to false after initial data load
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  },
  methods: {
    // Add method to load user profile
    loadUserProfile() {
      const storedProfile = localStorage.getItem('userData');
      if (storedProfile) {
        try {
          this.userProfile = JSON.parse(storedProfile);
        } catch (e) {
          this.fetchUserProfile();
        }
      } else {
        this.fetchUserProfile();
      }
    },

    // Add method to fetch user profile
    async fetchUserProfile() {
      try {
        const admin = localStorage.getItem('admin');
        if (!admin) {
          this.$router.push('/admin/login');
          return;
        }

        // Get session token for authentication
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        const response = await axios.get('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          withCredentials: true,
          headers: headers
        });

        if (response.data) {
            this.userProfile = {
                name: response.data.name || 'Unknown User',
                email: response.data.email || '',
                role: 'Administrator',
                avatar: response.data.avatar || null
            };
            localStorage.setItem('userData', JSON.stringify(this.userProfile));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('admin');
          this.$router.push('/admin/login');
        }
      }
    },

    // New method to fetch admin status
    async fetchAdminStatus() {
      try {
        // Get session token for authentication
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        const response = await axios.get('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
          withCredentials: true,
          headers: headers  // Add this line
        });
        
        if (response.data) {
          this.adminStatus = response.data.queue_status || 'active';
          this.userProfile = response.data;
        }
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    },
    
    toggleSidebar(value) {
      // Use provided value or toggle current state
      const newState = value !== undefined ? value : !this.isSidebarCollapsed;
      this.isSidebarCollapsed = newState;
      
      // Save to localStorage for persistence
      localStorage.setItem('sidebarCollapsed', newState);
    },
      handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed;
      // Save state to localStorage for persistence between page loads
      localStorage.setItem('sidebarCollapsed', collapsed);
    },

    handleMobileSidebarToggle() {
      // Delegate mobile sidebar toggle to AdminNavbar component
      this.$refs.adminNavbar?.toggleSidebar();
    },
    handleSignOut() {
      try {
        axios.post('https://flow-backend-yxdw.onrender.com/logout.php', {}, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear authentication data
        localStorage.clear();
        // Redirect to login page
        this.$router.push('/admin/login');
      }
    },
    async fetchDepartments() {
      try {
        const adminId = localStorage.getItem('adminId');
        const response = await axios.get(`https://flow-backend-yxdw.onrender.com/departments.php?admin_id=${adminId}`);

        if (response.data) {
          // Filter out archived services
          this.departments = response.data
            .filter(dept => !dept.is_archived)
            .map(dept => ({
              ...dept,
              status: this.getDepartmentStatus(dept),
              currentQueue: parseInt(dept.regular_queue) + parseInt(dept.priority_queue)
            }));

          // Calculate totals only from active departments
          const totalRegularQueue = this.departments.reduce((sum, dept) => sum + parseInt(dept.regular_queue || 0), 0);
          const totalPriorityQueue = this.departments.reduce((sum, dept) => sum + parseInt(dept.priority_queue || 0), 0);
          const totalScheduledQueue = this.departments.reduce((sum, dept) => sum + parseInt(dept.scheduled_queue || 0), 0);
          const totalCompletedQueue = this.departments.reduce((sum, dept) => sum + parseInt(dept.completed_queue || 0), 0);
          const activeUnits = this.departments.length;

          // Calculate trends by comparing with previous values
          const queueTrend = totalRegularQueue - this.previousStatistics.totalQueue;
          const priorityTrend = totalPriorityQueue - this.previousStatistics.priorityQueue;
          const scheduledTrend = totalScheduledQueue - this.previousStatistics.scheduledQueue;
          const unitsTrend = activeUnits - this.previousStatistics.activeUnits;

          // Update statistics with trends
          this.statistics = {
            totalQueue: totalRegularQueue,
            queueTrend: queueTrend,
            priorityQueue: totalPriorityQueue,
            priorityTrend: priorityTrend,
            scheduledQueue: totalScheduledQueue,
            scheduledTrend: scheduledTrend,
            activeUnits: activeUnits,
            unitsTrend: unitsTrend
          };

          // Store current values as previous for next comparison
          this.previousStatistics = {
            totalQueue: totalRegularQueue,
            priorityQueue: totalPriorityQueue,
            scheduledQueue: totalScheduledQueue,
            activeUnits: activeUnits
          };

          // Save to localStorage for persistence
          localStorage.setItem('previousStatistics', JSON.stringify(this.previousStatistics));

          // Create a new dataset to ensure reactivity
          this.queueDistributionData = {
            labels: ['Regular Queue', 'Priority Queue', 'Scheduled', 'Completed'],
            datasets: [{
              data: [
                totalRegularQueue,
                totalPriorityQueue,
                totalScheduledQueue,
                totalCompletedQueue
              ],
              backgroundColor: [
                '#333D79',
                '#6461A0',
                '#CDC8FE',
                '#9693CE'
              ]
            }]
          };
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    },

    getDepartmentStatus(dept) {
      // First check admin's status - if inactive or maintenance, override department status
      if (this.adminStatus === 'inactive' || this.adminStatus === 'maintenance') {
        return this.adminStatus;
      }

      // Check if department itself is in maintenance mode
      if (dept.status === 'maintenance') {
        return 'maintenance';
      }

      // If admin is active and department isn't in maintenance, then check operating hours
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()

      const [startHours, startMinutes] = dept.hours_start.split(':')
      const [endHours, endMinutes] = dept.hours_end.split(':')

      const startTime = parseInt(startHours) * 100 + parseInt(startMinutes)
      const endTime = parseInt(endHours) * 100 + parseInt(endMinutes)

      return (currentTime >= startTime && currentTime <= endTime) ? 'active' : 'inactive'
    },

    checkIfOpen(start, end) {
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()

      const [startHours, startMinutes] = start.split(':')
      const [endHours, endMinutes] = end.split(':')

      const startTime = parseInt(startHours) * 100 + parseInt(startMinutes)
      const endTime = parseInt(endHours) * 100 + parseInt(endMinutes)

      return currentTime >= startTime && currentTime <= endTime
    },

    getServiceHours(deptId) {
      const dept = this.departments.find(d => d.id === parseInt(deptId))
      if (dept) {
        // Convert start time
        const [startHour, startMinute] = dept.hours_start.split(':')
        const startHourNum = parseInt(startHour)
        const startPeriod = startHourNum >= 12 ? 'PM' : 'AM'
        const start12Hour = startHourNum === 0 ? 12 : startHourNum > 12 ? startHourNum - 12 : startHourNum
        const startTime = `${start12Hour}:${startMinute} ${startPeriod}`

        // Convert end time
        const [endHour, endMinute] = dept.hours_end.split(':')
        const endHourNum = parseInt(endHour)
        const endPeriod = endHourNum >= 12 ? 'PM' : 'AM'
        const end12Hour = endHourNum === 0 ? 12 : endHourNum > 12 ? endHourNum - 12 : endHourNum
        const endTime = `${end12Hour}:${endMinute} ${endPeriod}`

        return `${startTime} - ${endTime}`
      }
      return 'N/A'
    },

    isUnitOpen(deptId) {
      const dept = this.departments.find(d => d.id === parseInt(deptId))
      if (!dept) return false
      
      // Consider units closed if admin status is maintenance or inactive
      if (this.adminStatus === 'maintenance' || this.adminStatus === 'inactive') {
        return false
      }
      
      // Consider units closed if their own status is maintenance or inactive
      if (dept.status === 'maintenance' || dept.status === 'inactive') {
        return false
      }

      // If active, then check operating hours
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()

      const [startHours, startMinutes] = dept.hours_start.split(':')
      const [endHours, endMinutes] = dept.hours_end.split(':')

      const startTime = parseInt(startHours) * 100 + parseInt(startMinutes)
      const endTime = parseInt(endHours) * 100 + parseInt(endMinutes)

      return currentTime >= startTime && currentTime <= endTime
    },

    handlePageTransition() {
      document.body.classList.add('transitioning');

      // Remove the class after the page has loaded
      window.setTimeout(() => {
        document.body.classList.remove('transitioning');
      }, 50);
    },

    // New methods for enhanced functionality
    handleQuickAction(action) {
      console.log(`Quick action triggered: ${action}`);
      // Placeholder for future functionality
      switch(action) {
        case 'reports':
          // Navigate to reports page or show modal
          this.$router.push('/admin/reports');
          break;
        case 'units':
          // Navigate to services page
          this.$router.push('/admin/appointments');
          break;
        case 'settings':
          // Navigate to settings
          this.$router.push('/admin/settings');
          break;
        case 'export':
          // Trigger export functionality
          this.exportData();
          break;
        case 'notifications':
          // Show notification modal
          this.showNotificationModal();
          break;
      }
    },

    handleStatCardClick(statKey) {
      console.log(`Stat card clicked: ${statKey}`);
      // Add navigation or detailed view functionality
      // For now, just add a visual feedback
      const card = event.currentTarget;
      card.classList.add('card-clicked');
      setTimeout(() => {
        card.classList.remove('card-clicked');
      }, 200);
    },

    handleUnitClick(department) {
      console.log(`Unit clicked: ${department.name}`);
      // Navigate to service appointment view
      this.$router.push({
        name: 'AdminAppointmentsView',
        params: {
          serviceId: department.id,
          serviceName: department.name
        }
      });
    },

    // Add method to set up periodic refresh
    setupPeriodicRefresh() {
      // Refresh data every 30 seconds to update trends
      this.refreshInterval = setInterval(() => {
        this.fetchDepartments();
      }, 30000); // 30 seconds
    },

    refreshChartData() {
      this.isChartLoading = true;
      // Simulate data refresh
      setTimeout(() => {
        this.fetchDepartments();
        this.isChartLoading = false;
      }, 1000);
    },

    exportChartData() {
      console.log('Exporting chart data...');
      // Implement chart export functionality
      const chartData = {
        labels: this.queueDistributionData.labels,
        data: this.queueDistributionData.datasets[0].data,
        timestamp: new Date().toISOString()
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(chartData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `queue-distribution-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    exportData() {
      console.log('Exporting dashboard data...');
      // Implement general data export
    },

    showNotificationModal() {
      console.log('Showing notification modal...');
      // Implement notification modal
    },

    navigateToServices() {
      this.$router.push('/admin/appointments');
    },    handleSortChange() {
      // The computed property will automatically update when sortOption changes
      // This method can be used for additional logic if needed (e.g., analytics tracking)
      console.log(`Sort option changed to: ${this.sortOption}`);
    },

    getSelectedOptionText() {
      const options = {
        'name-asc': 'A-Z',
        'name-desc': 'Z-A',
        'queue-desc': 'Highest',
        'queue-asc': 'Lowest'
      };
      return options[this.sortOption] || 'A-Z';
    },

    // Add this new method
    handleStatusChange(newStatus) {
      this.adminStatus = newStatus;
      
      // Immediately update all department statuses
      this.updateDepartmentStatuses();
      
      // Save ONLY the status change to the backend
      axios.put('https://flow-backend-yxdw.onrender.com/adminprofile.php', {
        queue_status: newStatus,
        action: 'update_status_only'
      }, { withCredentials: true })
      .then(response => {
        console.log('Status updated successfully:', response.data);
      })
      .catch(error => {
        console.error('Failed to update status:', error);
      });
    },

    // Add this in the methods section
    updateDepartmentStatuses() {
      if (this.departments && this.departments.length) {
        this.departments = this.departments.map(dept => ({
          ...dept,
          status: this.getDepartmentStatus(dept)
        }));
      }
    },
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
</script>

<style scoped>
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/dashboard.css';
@import '@/styles/mainpage-admin/content.css';
@import '@/styles/mainpage-admin/topnav.css';
</style>