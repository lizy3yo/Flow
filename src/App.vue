<template>
  <div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    <router-view></router-view>
    <button class="back-to-top" aria-label="Back to top"></button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLoading: false
    }
  },
  provide() {
    return {
      setLoading: this.setLoading
    }
  },
  methods: {
    setLoading(value) {
      this.isLoading = value;
    }
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.isLoading = true
      next()
    })

    this.$router.afterEach(() => {
      setTimeout(() => {
        this.isLoading = false
      }, 500)
    })
  },
  mounted() {
    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) { // Show after scrolling 300px
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);  
  transition: opacity 0.3s ease-in-out;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255, 255, 255, 0.2);  
  border-top: 3px solid #ffffff; 
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;  
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);  
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-overlay.fade-enter-active,
.loading-overlay.fade-leave-active {
  transition: opacity 0.3s;
}

.loading-overlay.fade-enter-from,
.loading-overlay.fade-leave-to {
  opacity: 0;
}
</style>