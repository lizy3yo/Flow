<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container-fluid">

      <!-- LEFT: Logo + Brand -->
      <div class="navbar-left">
        <div class="navbar-brand-wrapper">
          <img src="@/images/logo.png" alt="Logo">
          <router-link class="navbar-brand" to="/">Flow</router-link>
        </div>
      </div>

      <!-- Navbar Toggler Button -->
      <button class="navbar-toggler" type="button" @click="toggleNavbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible Content -->
      <div class="collapse navbar-collapse" :class="{ 'show': isNavbarOpen }">
        <!-- CENTER: Nav Links -->
        <div class="navbar-center">
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="nav-item">
              <a @click.prevent="scrollTo('home'); closeNavbar()" class="nav-link" href="#home">Home</a>
            </li>
             <li class="nav-item">
              <a @click.prevent="scrollTo('scope'); closeNavbar()" class="nav-link" href="#scope">Use Cases</a>
            </li>
            <li class="nav-item">
              <a @click.prevent="scrollTo('features'); closeNavbar()" class="nav-link" href="#features">Features</a>
            </li>
             <li class="nav-item">
              <a @click.prevent="scrollTo('benefits'); closeNavbar()" class="nav-link" href="#benefits">Benefits</a>
            </li>
            <li class="nav-item">
              <a @click.prevent="scrollTo('discover'); closeNavbar()" class="nav-link" href="#discover">Overview</a>
            </li>
          </ul>
        </div>

        <!-- RIGHT: Buttons -->
        <div class="navbar-right">
          <div class="nav-buttons">
            <router-link to="/login" class="btn login">Login</router-link>
            <router-link to="/signup/user" class="btn register">Sign Up</router-link>
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
export default {
    name: 'NavbarComponent',
    data() {
        return {
            scrolled: false,
            isNavbarOpen: false
        };
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        scrollTo(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                // Get navbar height to use as offset
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;

                // Calculate the element's position accounting for navbar height
                let extraOffset = 20; // Default padding

                if (elementId === 'scope') {
                    extraOffset = 40; // Decrease this value to scroll further down
                }

                if (elementId === 'features') {
                    extraOffset = -20; // Decrease this value to scroll further down
                }

                if (elementId === 'benefits') {
                    extraOffset = 40; // Adjust this value for benefits section
                }

                if (elementId === 'discover') {
                    extraOffset = -800; // Decrease this value to scroll further down
                }

                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight - extraOffset;

                // Scroll to the adjusted position
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        },
        handleScroll() {
            this.scrolled = window.scrollY > 10;
            const navbar = document.querySelector('.navbar');
            if (this.scrolled) {
                navbar.classList.add('navbar-glow');
            } else {
                navbar.classList.remove('navbar-glow');
            }
        },
        toggleNavbar() {
            this.isNavbarOpen = !this.isNavbarOpen;
        },
        closeNavbar() {
            this.isNavbarOpen = false;
        },
        handleResize() {
            if (window.innerWidth > 991) {
                this.isNavbarOpen = false;
            }
        }
    }
};
</script>

<style>
@import '@/styles/navbar.css';

.navbar {
    position: sticky;
    top: 10px;
    width: 100%;
    z-index: 1000;
}

.nav-link {
    cursor: pointer;
}
</style>
