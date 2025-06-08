<template>
    <body>
 <div class="container">
        <h1 class="animate-on-scroll">What Flow <span class="features">Offers</span></h1>
        <div class="grid">
            
            <div class="grid2">
            <div class="Virtual-card animate-on-scroll">
                <h2>Virtual Tickets</h2>
                <p>Secure your place in line without being physically present. Flow lets users generate digital queue tickets remotely, saving time and reducing overcrowding in service areas.</p>
            </div>
            <div class="live-ticket-card animate-on-scroll">
                <h2>Live Queue Ticketing</h2>
                <p>Stay informed every step of the way. Track your position in real-time, monitor estimated wait times, and plan your arrival accordingly to avoid unnecessary delays.</p>
            </div>
         </div>
           
         <div class="grid3">
            <div class="Appoinment-card animate-on-scroll">
                <h2>Appointment Scheduling</h2>
                <p>Plan ahead with ease. Book appointments for your preferred time slot at any branch, helping you skip walk-in lines and manage your day more efficiently.</p>
                <div class="assistant">Dwayne Tatum - CEO Assistant</div>
            </div>
            <div class="express-card animate-on-scroll">
                <h2>Express Lane Booking</h2>
                <p>For urgent needs, Flow offers fast-track booking options. Secure a priority slot and get the service you need without the long wait.</p>
            </div>
            <div class="user-card animate-on-scroll">
                <h2>User Profile</h2>
                <p>Easily access and update your personal information, service preferences, and history. Flow keeps everything organized in one secure place for a personalized experience.</p>
            </div>
          </div>
        </div>
    </div>
</body>
</template>

<script>
export default {
  name: 'landing-3',
  mounted() {
    this.initScrollAnimation();
  },
  methods: {
    initScrollAnimation() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2
      });

      document.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
      });
    }
  }
}
</script>

<style>
@import '@/styles/landing3.css';
</style>
