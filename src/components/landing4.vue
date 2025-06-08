<template>
  <section ref="section" class="landing6-section" id="benefits">
    <h2 class="landing6-title">
      How Flow <span class="landing6-benefits">benefits</span> you?
    </h2>
    <div class="landing6-content">
      <div class="landing6-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['landing6-tab', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
      <div v-if="activeTab === 'Efficiency Improvement'" class="landing6-content-container">
        <div class="landing6-content-text">
          <h3 class="landing6-content-title">Reduce wait times and improve <br> operational flow</h3>
          <p class="landing6-content-desc">
            Flow replaces physical lines with a smart virtual queuing system, streamlining operations in public spaces like clinics and government offices. By reducing wait times and organizing multiple queues, it boosts staff productivity and ensures faster, more efficient service.
          </p>
        </div>
        <div class="landing6-content-image">
          <img src="@/images/efficiency.png" alt="Efficiency Improvement" class="benefit-image">
        </div>
      </div>
      <div v-else-if="activeTab === 'Customer Experience Enhancement'" class="landing6-content-container">
        <div class="landing6-content-text">
          <h3 class="landing6-content-title">Keep users informed and in control</h3>
          <p class="landing6-content-desc">
            With real-time queue updates, position tracking, and timely notifications, Flow gives users control over their time. Scheduling and reminders create a smooth, stress-free experience that keeps users informed and eliminates unnecessary waiting.
          </p>
        </div>
        <div class="landing6-content-image">
          <img src="@/images/customerexp.png" alt="Customer Experience Enhancement" class="benefit-image">
        </div>
      </div>
      <div v-else-if="activeTab === 'Service Delivery Optimization'" class="landing6-content-container">
        <div class="landing6-content-text">
          <h3 class="landing6-content-title">Prioritize needs and maximize <br>service efficiency</h3>
          <p class="landing6-content-desc">
            Flow enhances service delivery through express lane booking, crowd density indicators, and feedback tools. These features help prioritize urgent needs, manage crowds, and guide resource allocation—resulting in faster service and continuous improvement.
          </p>
        </div>
        <div class="landing6-content-image">
          <img src="@/images/service.png" alt="Service Delivery Optimization" class="benefit-image">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LandingSection6",
  data() {
    return {
      tabs: ["Efficiency Improvement", "Customer Experience Enhancement", "Service Delivery Optimization"],
      activeTab: "Efficiency Improvement",
      observer: null
    };
  },
  mounted() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.$refs.section.classList.add('visible');
            this.observer.unobserve(this.$refs.section);
          }
        });
      },
      {
        threshold: 0.2
      }
    );
    
    this.observer.observe(this.$refs.section);
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
};
</script>

<style src="../styles/landing4.css"></style>