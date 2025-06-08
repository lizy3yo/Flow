<template>
  <section class="landing7">
    <div class="landing7-content">
      <h1 class="landing7-title scroll-animate">
        <span><i>Smooth</i>, <i>Simple</i>, <i>Smart</i>.</span>
        <span class="flow-text">That's Flow.</span>
      </h1>
      <p class="landing7-description scroll-animate">
        Join virtual queues, get real-time updates, and take control of your time—no waiting, no hassle. Stay ahead, stay in Flow.
      </p>
      <router-link to="/signup/user" class="landing7-button scroll-animate">Sign Up</router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LandingSeven',
  mounted() {
    this.$nextTick(() => {
      this.initScrollAnimation();
    });
  },
  methods: {
    initScrollAnimation() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate');
            }, entry.target.dataset.delay || 0);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '50px'
      });

      document.querySelectorAll('.scroll-animate').forEach((el, index) => {
        el.dataset.delay = index * 200;
        observer.observe(el);
      });
    }
  }
}
</script>

<style src="../styles/landing7.css" scoped></style>
