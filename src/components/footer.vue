<template>
  <footer class="pro-footer">
    <div class="pro-footer__container">
      <!-- Company Info Section -->
      <div class="pro-footer__company">
        <div class="pro-footer__logo">
          <div class="logo-container">
            <img src="@/images/logo.png" alt="Logo" />
            <h1>Flow</h1>
          </div>
        </div>
        <p class="pro-footer__description">
          Empowering your digital journey with innovative solutions and exceptional service.
        </p>
      </div>

      <!-- Quick Links Section -->
      <div class="pro-footer__section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#">Solutions</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Resources</a></li>
          <li><a href="#">Case Studies</a></li>
        </ul>
      </div>

      <!-- Support Section -->
      <div class="pro-footer__section">
        <h3>Support</h3>
        <ul>
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Documentation</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">API Status</a></li>
        </ul>
      </div>

      <!-- Newsletter Section -->
      <div class="pro-footer__newsletter">
        <h3>Subscribe to Our Newsletter</h3>
        <p>Stay updated with our latest news and updates</p>
        <div class="pro-footer__form">
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="pro-footer__bottom">
      <div class="pro-footer__bottom-container">
        <div class="pro-footer__social">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
        </div>
        <div class="pro-footer__copyright">
          <p>&copy; 2025 Your Company. All rights reserved.</p>
        </div>
        <div class="pro-footer__legal">
          <a href="#">Privacy Policy</a>
          <span class="divider">|</span>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterPro'
}
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container img {
  height: 40px; /* Adjust this value based on your needs */
  width: auto;
}

.logo-container h1 {
  margin: 0;
}
</style> 