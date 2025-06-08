<template>
  <div class="page-container">
   <AdminNavbar />
   <main class="content-area">
     <div class="content">
       <div class="analytics-header">
         <h1>Analytics Dashboard</h1>
         <div class="date-filter">
           <select v-model="timeRange">
             <option value="day">Today</option>
             <option value="week">This Week</option>
             <option value="month">This Month</option>
             <option value="year">This Year</option>
           </select>
         </div>
       </div>

        <!-- Summary Cards -->
      <div class="summary-section">
        <h2>Overall Summary</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total Appointments</h3>
            <div class="count">{{ totalAppointments }}</div>
          </div>
          <div class="summary-card">
            <h3>Pending Appointments</h3>
            <div class="count">{{ pendingAppointments }}</div>
          </div>
          <div class="summary-card">
            <h3>Cancelled Appointments</h3>
            <div class="count">{{ cancelledAppointments }}</div>
          </div>
          <div class="summary-card">
            <h3>Completed Appointments</h3>
            <div class="count">{{ completedAppointments }}</div>
          </div>
        </div>
      </div>

       <!-- Overall Statistics -->
       <div class="stats-grid">
         <div class="stat-card">
           <i class="bi bi-people"></i>
           <div class="stat-info">
             <h3>Total Visitors</h3>
             <p>{{ totalVisitors }}</p>
           </div>
         </div>
         <div class="stat-card">
           <i class="bi bi-clock"></i>
           <div class="stat-info">
             <h3>Avg. Wait Time</h3>
             <p>{{ avgWaitTime }} mins</p>
           </div>
         </div>
         <div class="stat-card">
           <i class="bi bi-check-circle"></i>
           <div class="stat-info">
             <h3>Completion Rate</h3>
             <p>{{ completionRate }}%</p>
           </div>
         </div>
       </div>

       <!-- Department Analytics -->
       <div class="department-analytics">
         <div v-for="dept in departments" :key="dept.name" class="dept-card">
           <h2>{{ dept.name }}</h2>
           <div class="metrics-grid">
             <div class="metric">
               <span class="label">Total Queue</span>
               <span class="value">{{ dept.totalQueue }}</span>
             </div>
             <div class="metric">
               <span class="label">Completed</span>
               <span class="value">{{ dept.completed }}</span>
             </div>
             <div class="metric">
               <span class="label">Cancelled</span>
               <span class="value">{{ dept.cancelled }}</span>
             </div>
             <div class="metric">
               <span class="label">Avg. Service Time</span>
               <span class="value">{{ dept.avgServiceTime }} mins</span>
             </div>
           </div>
           <div class="chart-container">
             <canvas :id="'chart-' + dept.name.toLowerCase()"></canvas>
           </div>
         </div>
       </div>

       <!-- Historical Analytics -->
       <div class="historical-analytics">
         <h2>Historical Visitor Data</h2>
         <div class="history-controls">
           <div class="history-filters">
             <select v-model="historyRange">
               <option value="1">Last 7 Days</option>
               <option value="2">Last 30 Days</option>
               <option value="3">Last 3 Months</option>
             </select>
           </div>
         </div>
         <div class="history-chart-container">
           <canvas id="visitorHistoryChart"></canvas>
         </div>
         <div class="history-table">
           <table>
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Registrar</th>
                 <th>Admission</th>
                 <th>Cashier</th>
                 <th>Total</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="record in visitorHistory" :key="record.date">
                 <td>{{ record.date }}</td>
                 <td>{{ record.registrar }}</td>
                 <td>{{ record.admission }}</td>
                 <td>{{ record.cashier }}</td>
                 <td class="total">{{ record.total }}</td>
               </tr>
             </tbody>
           </table>
         </div>
       </div>
     </div>
   </main>
 </div>
</template>

<script>
import AdminNavbar from './AdminNavbar.vue'
import Chart from 'chart.js/auto'

export default {
 name: 'AdminAnalytics',
 components: {
   AdminNavbar
 },
 data() {
   return {
     timeRange: 'day',
     totalVisitors: 450,
     avgWaitTime: 15,
     completionRate: 85,
     historyRange: '1',
     // Appointment summary data
     totalAppointments: 450,
     pendingAppointments: 85,
     cancelledAppointments: 25,
     completedAppointments: 340,
     visitorHistory: [
       { date: '2023-03-01', registrar: 50, admission: 40, cashier: 30, total: 120 },
       { date: '2023-03-02', registrar: 60, admission: 50, cashier: 40, total: 150 },
       { date: '2023-03-03', registrar: 55, admission: 45, cashier: 35, total: 135 },
       { date: '2023-03-04', registrar: 70, admission: 60, cashier: 50, total: 180 },
       { date: '2023-03-05', registrar: 65, admission: 55, cashier: 45, total: 165 },
       { date: '2023-03-06', registrar: 75, admission: 65, cashier: 55, total: 195 },
       { date: '2023-03-07', registrar: 80, admission: 70, cashier: 60, total: 210 }
     ],
     departments: [
       {
         name: 'Registrar',
         totalQueue: 180,
         completed: 150,
         cancelled: 30,
         avgServiceTime: 12,
         hourlyData: [15, 25, 30, 22, 18, 20, 28, 35]
       },
       {
         name: 'Admission',
         totalQueue: 150,
         completed: 120,
         cancelled: 30,
         avgServiceTime: 15,
         hourlyData: [12, 18, 25, 20, 15, 22, 20, 28]
       },
       {
         name: 'Cashier',
         totalQueue: 120,
         completed: 100,
         cancelled: 20,
         avgServiceTime: 8,
         hourlyData: [10, 15, 20, 25, 18, 15, 12, 16]
       }
     ]
   }
 },
 mounted() {
   this.initializeCharts()
   this.initializeHistoryChart()
 },
 methods: {
   initializeCharts() {
     this.departments.forEach(dept => {
       const ctx = document.getElementById(`chart-${dept.name.toLowerCase()}`).getContext('2d')
       new Chart(ctx, {
         type: 'line',
         data: {
           labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
           datasets: [{
             label: 'Hourly Visitors',
             data: dept.hourlyData,
             borderColor: '#2196F3',
             tension: 0.4
           }]
         },
         options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
             legend: {
               display: false
             }
           }
         }
       })
     })
   },
   initializeHistoryChart() {
     const ctx = document.getElementById('visitorHistoryChart').getContext('2d')
     new Chart(ctx, {
       type: 'bar',
       data: {
         labels: this.visitorHistory.map(record => record.date),
         datasets: [
           {
             label: 'Registrar',
             data: this.visitorHistory.map(record => record.registrar),
             backgroundColor: '#2196F3'
           },
           {
             label: 'Admission',
             data: this.visitorHistory.map(record => record.admission),
             backgroundColor: '#4CAF50'
           },
           {
             label: 'Cashier',
             data: this.visitorHistory.map(record => record.cashier),
             backgroundColor: '#FFC107'
           }
         ]
       },
       options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
           legend: {
             display: true
           }
         }
       }
     })
   }
 }
}
</script>

<style scoped>
@import '@/styles/mainpage-admin/root.css';
@import '@/styles/mainpage-admin/analytics.css';
@import '@/styles/mainpage-admin/content.css';
</style>