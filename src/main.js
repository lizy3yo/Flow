import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import App from './App.vue'
import router from './router'
import './utils/axios' // Add this line
import GlobalChatbot from './chat/chat.vue'
import axios from 'axios'

const app = createApp(App)

app.use(router)
app.use(vue3GoogleLogin, {
    clientId: '423373752798-3lmutkhmfcs5a646l1up4gceciintqim.apps.googleusercontent.com',
    prompt: 'consent'
    // Remove redirect_uri
});

app.component('GlobalChatbot', GlobalChatbot)

axios.defaults.baseURL = 'https://flow-backend-yxdw.onrender.com';
axios.defaults.withCredentials = true;

app.mount('#app')
