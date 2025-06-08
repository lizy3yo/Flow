<template>
  <body> 
    <div style="position: relative; min-height: 80vh;">
      <div class="banner animate-pop-in">
        <div class="banner-text">
          <p class="banner-p1 animate-on-scroll">One Powerful Queue System, Endless Possibilities</p>
          <h1 class="banner-h1 animate-on-scroll"><i>Optimize Wait Times Anywhere</i></h1>
          <p class="banner-p2">
            <span class="word-cycle animate-pop-in">
              <span>Government Offices</span>
              <span>Healthcare Institutions</span>
              <span>Schools</span>
              <span>Businesses</span>
            </span>
          </p>
        </div>  
        <div class="banner-image animate-pop-in">
          <img src="@/images/line2.0.png" alt="Line graphic" />
        </div>
      </div>
    </div>
  </body>
</template>

<script>
export default {
  name: 'landing-2',
  mounted() {
    this.initScrollAnimation();
  },
  methods: {
    initScrollAnimation() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Set base delay CSS variable for consistent timing
            if (entry.target.classList.contains('word-cycle')) {
              entry.target.style.setProperty('--base-delay', '0.8s');
            }
            
            // Add the show class to trigger animations
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2
      });

      // Target both animation classes
      document.querySelectorAll('.animate-on-scroll, .animate-pop-in').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(el);
      });
    }
  }
}
</script>

<style>
@import '@/styles/landing2.css';

</style>
