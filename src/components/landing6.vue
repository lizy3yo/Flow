<template>
  <div class="landing4-wrapper">
    <h2 class="landing4-heading">How it <span class="landing4-flow">works?</span></h2>
    <!-- Navigation buttons - remove disabled state -->
    <button class="nav-button nav-prev" @click="prevContainer">
      <span>&lt;</span>
    </button>
    
    <div 
      v-for="i in 5" 
      :key="i"
      :class="['container', `container-${i}`, currentFocus === i ? 'focused' : '']"
      @click="setFocus(i)"
    >
      <h2>{{ containerTitles[i - 1] }}</h2>
      <img v-if="currentFocus === i" :src="require(`@/images/${i}.png`)" :alt="containerTitles[i-1]" class="landing6-service-img" style="max-width: 100px; margin: 0.5rem auto 1.2rem; display: block;" />
      <p>{{ getContainerContent(i) }}</p>
    </div>
    
    <button class="nav-button nav-next" @click="nextContainer">
      <span>&gt;</span>
    </button>

    <div class="progress-dots">
      <div v-for="i in 5" :key="`dot-${i}`" 
           :class="['progress-dot', currentFocus === i ? 'active' : '']">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'landing-4',
  data() {
    return {
      currentFocus: 1, // Container 1 is focused on initial load
      containerTitles: [
        "Sign Up",
        "Choose a Service",
        "Schedule an Appointment",
        "Track & Get Notified",
        "Complete Your Visit"
      ]
    }
  },
  methods: {
    prevContainer() {
      // Circular navigation - go to container 5 if at container 1
      if (this.currentFocus === 1) {
        this.currentFocus = 5;
      } else {
        this.currentFocus--;
      }
    },
    nextContainer() {
      // Circular navigation - go to container 1 if at container 5
      if (this.currentFocus === 5) {
        this.currentFocus = 1;
      } else {
        this.currentFocus++;
      }
    },
    setFocus(containerNumber) {
      this.currentFocus = containerNumber;
    },
    getContainerContent(index) {
      const contents = [
        "Create an account using your email or mobile number to access Flow’s full range of queue management tools.",
        "Select the service you need and the preferred branch location—view available options in real time.",
        "Book a virtual queue ticket instantly or schedule a visit at a convenient time.", 
        "Monitor your queue status live so you can arrive just in time.",
        "Receive your service without hassle. Flow ensures a smooth, efficient experience from arrival to completion."
      ];
      return contents[index-1];
    }
  }
}
</script>

<style>
@import '@/styles/landing6.css';
</style>