<template>
  <div class="chatbot-container">
    <!-- Chat Toggle Button -->
    <button 
      class="chatbot-toggle" 
      @click="toggleChat"
      :class="{ 'chat-open': isChatOpen }"
    >
      <i :class="isChatOpen ? 'bi bi-x-lg' : 'bi bi-chat-dots'"></i>
    </button>

    <!-- Chat Window -->
    <div class="chatbot-window" v-if="isChatOpen">
      <div class="chatbot-header">
        <div class="chatbot-avatar">
          <i class="bi bi-robot"></i>
        </div>
        <div class="chatbot-info">
          <h4>FlowBot</h4>
          <span>Flow Assistant</span>
        </div>
      </div>

      <div class="chatbot-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message', message.type]"
        >
          <div class="message-wrapper">
            <div v-if="message.type === 'bot'" class="chatbot-message-avatar">
              <i class="bi bi-robot"></i>
            </div>
            <div class="message-content" v-html="message.content"></div>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        <div v-if="isTyping" class="message bot typing">
          <div class="message-wrapper">
            <div class="chatbot-message-avatar">
              <i class="bi bi-robot"></i>
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chatbot-input">
        <input 
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="Ask me anything about Flow..."
          :disabled="isTyping"
        />
        <button 
          @click="sendMessage" 
          :disabled="!userInput.trim() || isTyping"
          class="send-btn"
        >
          <i class="bi bi-send"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { generateText } from '@/data/chat.config.js'

export default {
  name: 'GlobalChatbot',
  data() {
    return {
      isChatOpen: false,
      userInput: '',
      isTyping: false,
      loadingTimeout: null,
      messages: [
        {
          id: 1,
          type: 'bot',
          content: '<b style="margin-bottom: 5px;">Hello! I\'m FlowBot, your Flow Assistant.</b><p style="text-align: initial;">I can help you with queue management, booking appointments, and navigating the Flow platform. What would you like to know?</p>',
          timestamp: new Date()
        }
      ]
    }
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen
      if (this.isChatOpen) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isTyping) return

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: this.userInput,
        timestamp: new Date()
      }

      this.messages.push(userMessage)
      const userQuestion = this.userInput
      this.userInput = ''
      this.isTyping = true

      // Add a timeout to display error if taking too long
      this.loadingTimeout = setTimeout(() => {
        if (this.isTyping) {
          this.handleResponseFailure('Request is taking longer than expected. Still trying...');
        }
      }, 10000); // 10 seconds timeout

      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        const response = await generateText(userQuestion)
        
        clearTimeout(this.loadingTimeout)
        
        if (!response) {
          this.handleResponseFailure();
          return;
        }
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response,
          timestamp: new Date()
        }

        this.messages.push(botMessage)
      } catch (error) {
        clearTimeout(this.loadingTimeout)
        console.error('Chatbot error:', error)
        this.handleResponseFailure();
      } finally {
        this.isTyping = false
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    handleResponseFailure(message = '<b>Sorry, I encountered an error.</b><p>Please try again or contact support if the issue persists.</p>') {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: message,
        timestamp: new Date()
      }
      this.messages.push(errorMessage)
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  },
  beforeUnmount() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 45px;
  right: 130px;
  z-index: 1000;
}

.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6bff 0%, #6d4aff 100%);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(106, 74, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(106, 74, 255, 0.4);
}

.chatbot-toggle.chat-open {
  background: #dc3545;
}

.chatbot-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chatbot-header {
  padding: 20px;
  background: linear-gradient(135deg, #4a6bff 0%, #6d4aff 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chatbot-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chatbot-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chatbot-info span {
  font-size: 12px;
  opacity: 0.9;
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: rgba(74, 107, 255, 0.5) rgba(241, 243, 245, 0.5); /* For Firefox */
}

/* Custom scrollbar for WebKit browsers (Chrome, Safari, Edge) */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: rgba(241, 243, 245, 0.5);
  border-radius: 10px;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: rgba(74, 107, 255, 0.5);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 107, 255, 0.8);
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.bot {
  align-self: flex-start;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chatbot-message-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #4a6bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  line-height: 1.4;
}

.message.user .message-content {
  background: #4a6bff;
  color: white;
  border-bottom-right-radius: 6px;
}

.message.bot .message-content {
  background: #f1f3f5;
  color: #2c3e50;
  border-bottom-left-radius: 6px;
}

.message-content b {
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

.message-content p {
  margin: 0;
  text-align: initial;
}

.message-time {
  font-size: 10px;
  color: #6c757d;
  margin-top: 4px;
  text-align: right;
}

.message.bot .message-time {
  margin-left: 40px; /* Align the timestamp with the message, not the avatar */
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f1f3f5;
  border-radius: 18px;
  border-bottom-left-radius: 6px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chatbot-input {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chatbot-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
}

.chatbot-input input:focus {
  border-color: #4a6bff;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4a6bff;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #3a5bff;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .chatbot-container {
    bottom: 15px;
    right: 15px;
  }

  .chatbot-window {
    width: 320px;
    height: 450px;
  }

  .chatbot-toggle {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 30px);
    right: -15px;
  }
}
</style>