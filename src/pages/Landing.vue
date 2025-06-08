<template>
  <div>
    <Navbar/>
    <section id="home">
      <landing-1></landing-1>
    </section>
    
    <section id="scope">
      <landing-2></landing-2>
    </section>

    <section id="features">
      <landing-3></landing-3>
    </section>

    <section id="discover">
      <landing-4></landing-4>
      <landing-5></landing-5>
    </section>
    <landing-6></landing-6>
    <landing-seven></landing-seven>
    <pro-footer></pro-footer>

    <!-- Add GlobalChatbot here -->
    <GlobalChatbot />
  </div>
</template>

<script>
import Landing1 from '@/components/landing1.vue'
import Landing2 from '@/components/landing2.vue'
import Landing3 from '@/components/landing3.vue'
import Landing4 from '@/components/landing4.vue'
import Landing5 from '@/components/landing5.vue'
import Landing6 from '@/components/landing6.vue'
import Footer from '@/components/footer.vue'
import LandingSeven from '@/components/landing7.vue'
import Navbar from '../components/Navbar.vue'
import GlobalChatbot from '@/chat/chat.vue'

export default {
  name: 'Landing-page',
  components: {
    Navbar,
    'landing-1': Landing1,
    'landing-2': Landing2,
    'landing-3': Landing3,
    'landing-4': Landing4,
    'landing-5': Landing5,
    'landing-6': Landing6,
    'pro-footer': Footer,
    'landing-seven': LandingSeven,
    GlobalChatbot
  }
}
</script>

<style scoped>
section {
  scroll-margin-top: 90px; /* Adjust based on your navbar height */
}
</style>