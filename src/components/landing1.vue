<template>
  <div>
    <div class="main-container">

   <div class="main-content" ref="mainContent">
     <div class="title">
       <h1 class="title-h1"><i>Streamline </i>queues,<br>
           Enhance customer flow</h1>
       <p>Redefine wait times with a smart system that digitizes queuing,<br>
        streamlines scheduling, reduces crowds, and enhances efficiency.</p>
     </div>

     <div class="d-flex">
      <router-link to="/signup/user" class="sign-up-btn">Sign Up</router-link>
     </div>

    <div class="lines-img">
    <img src="@/images/wavev2.png" alt="lines">
    </div>

      <div class="draft-img">
      <p class="draft-preview-text">preview the interface >></p>
      <img src="@/images/draft.png" alt="draft">
     </div>
   </div>

   <div class="dots-img dots-1">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-2">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-3">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-4">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-5">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-6">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-7">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-8">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-9">
    <img src="@/images/circledot.png" alt="dots">
   </div>

   <div class="dots-img dots-10">
    <img src="@/images/circledot.png" alt="dots">
   </div>

  </div>


  <div class="last" ref="lastSection">
   <div class="last-content">
    <h1 style="text-align:left; padding-left: 225px;">Virtual Queuing<br>Solutions</h1>
    <p>Say goodbye to long lines. Our virtual queuing system lets users join <br>
      and manage queues remotely, improving wait times and enhancing
      <br>the customer experience.</p>
   </div>
  <img src="@/images/queue.jpg" class="landing-img-design">
  </div>
  </div>
</template>

<script>
export default {
  name: 'landing-1',
  mounted() {
    this.initScrollAnimation();
  },
  methods: {
    initScrollAnimation() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });

      // Observe the main content section
      if (this.$refs.mainContent) {
        observer.observe(this.$refs.mainContent);
      }

      // Observe the last section
      if (this.$refs.lastSection) {
        observer.observe(this.$refs.lastSection);
      }

      // Observe other animated elements
      document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
      });
    }
  }
}
</script>


<style>
@import '@/styles/color.css';
@import '@/styles/landing1.css';


</style>