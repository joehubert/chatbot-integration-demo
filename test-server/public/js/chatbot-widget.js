/**
 * Chatbot Widget - Test Harness Implementation
 * A simple but functional chatbot widget for integration testing
 * Supports multiple themes, responsive design, and realistic chat simulation
 */

(function () {
    'use strict';

    // Default configuration
    const DEFAULT_CONFIG = {
        apiEndpoint: '/api/chat',
        theme: 'corporate-blue',
        position: 'bottom-right',
        greeting: 'Hello! How can I help you today?',
        orgId: 'demo-org',
        autoOpen: false,
        showTyping: true,
        companyName: 'Demo Company',
        primaryColor: '#007bff',
        logo: null,
        context: 'website',
        integrationMethod: 'cdn',
        mobileOptimized: true,
        touchFriendly: true
    };

    // Widget state
    let widgetState = {
        isOpen: false,
        isInitialized: false,
        messages: [],
        sessionId: null,
        isTyping: false,
        config: {},
        elements: {}
    };

    class ChatbotWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.sessionId = this.generateSessionId();
            this.messages = [];
            this.isOpen = false;
            this.isTyping = false;
            this.elements = {};

            // Bind methods
            this.init = this.init.bind(this);
            this.open = this.open.bind(this);
            this.close = this.close.bind(this);
            this.sendMessage = this.sendMessage.bind(this);
            this.updateConfig = this.updateConfig.bind(this);
        }

        /**
         * Initialize the widget
         */
        init() {
            if (widgetState.isInitialized) {
                console.warn('Chatbot widget already initialized');
                return;
            }

            // Merge global config with instance config
            if (window.ChatbotConfig) {
                this.config = { ...this.config, ...window.ChatbotConfig };
            }

            // Update global state
            widgetState.config = this.config;
            widgetState.sessionId = this.sessionId;

            this.loadTheme();
            this.createWidget();
            this.attachEventListeners();
            this.handleAutoOpen();

            widgetState.isInitialized = true;

            // Make widget globally accessible
            window.ChatbotWidget = this;

            console.log('Chatbot widget initialized:', this.config);
            this.fireEvent('init', { config: this.config });
        }

        /**
         * Load theme CSS
         */
        loadTheme() {
            const themeId = `chatbot-theme-${this.config.theme}`;

            // Remove existing theme
            const existingTheme = document.getElementById(themeId);
            if (existingTheme) {
                existingTheme.remove();
            }

            // Load new theme
            const link = document.createElement('link');
            link.id = themeId;
            link.rel = 'stylesheet';
            link.href = `${this.getBaseUrl()}/css/themes/${this.config.theme}.css`;
            document.head.appendChild(link);
        }

        /**
         * Create widget HTML structure
         */
        createWidget() {
            // Create container
            const container = document.createElement('div');
            container.id = 'chatbot-widget-container';
            container.className = `chatbot-widget-${this.config.theme}`;
            container.style.cssText = this.getContainerStyles();

            // Create launcher button
            const launcher = this.createLauncher();
            container.appendChild(launcher);

            // Create chat window
            const chatWindow = this.createChatWindow();
            container.appendChild(chatWindow);

            // Add to DOM
            document.body.appendChild(container);

            // Store elements
            this.elements = {
                container,
                launcher,
                chatWindow,
                header: chatWindow.querySelector('.chatbot-header'),
                messages: chatWindow.querySelector('.chatbot-messages'),
                input: chatWindow.querySelector('.chatbot-input'),
                sendButton: chatWindow.querySelector('.chatbot-send-button')
            };

            widgetState.elements = this.elements;
        }

        /**
         * Create launcher button
         */
        createLauncher() {
            const launcher = document.createElement('button');
            launcher.className = `chatbot-launcher-${this.config.theme}`;
            launcher.innerHTML = '💬';
            launcher.title = 'Open Chat';
            launcher.setAttribute('aria-label', 'Open chat widget');

            launcher.addEventListener('click', () => {
                this.toggle();
            });

            return launcher;
        }

        /**
         * Create chat window
         */
        createChatWindow() {
            const chatWindow = document.createElement('div');
            chatWindow.className = 'chatbot-window';
            chatWindow.style.cssText = this.getChatWindowStyles();
            chatWindow.style.display = 'none';

            chatWindow.innerHTML = `
                <div class="chatbot-header chatbot-header-${this.config.theme}">
                    <div class="chatbot-title">${this.config.companyName || 'Support Chat'}</div>
                    <button class="chatbot-close" aria-label="Close chat">✕</button>
                </div>
                <div class="chatbot-messages chatbot-messages-${this.config.theme}">
                    ${this.config.greeting ? this.createWelcomeMessage() : ''}
                </div>
                <div class="chatbot-input-area chatbot-input-area-${this.config.theme}">
                    <textarea 
                        class="chatbot-input chatbot-input-${this.config.theme}" 
                        placeholder="Type your message..."
                        rows="1"
                        aria-label="Type your message"
                    ></textarea>
                    <button class="chatbot-send-button chatbot-send-button-${this.config.theme}" aria-label="Send message">
                        📤
                    </button>
                </div>
            `;

            return chatWindow;
        }

        /**
         * Create welcome message
         */
        createWelcomeMessage() {
            return `
                <div class="chatbot-welcome chatbot-welcome-${this.config.theme}">
                    ${this.config.greeting}
                </div>
            `;
        }

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Close button
            const closeButton = this.elements.chatWindow.querySelector('.chatbot-close');
            closeButton.addEventListener('click', () => {
                this.close();
            });

            // Send button
            this.elements.sendButton.addEventListener('click', () => {
                this.handleSendMessage();
            });

            // Input field
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            // Auto-resize textarea
            this.elements.input.addEventListener('input', () => {
                this.autoResizeTextarea();
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.elements.container.contains(e.target)) {
                    // Don't close on outside click for mobile
                    if (!this.isMobile()) {
                        this.close();
                    }
                }
            });
        }

        /**
         * Handle auto-open functionality
         */
        handleAutoOpen() {
            if (this.config.autoOpen) {
                setTimeout(() => {
                    this.open();
                }, 1000); // Delay for better UX
            }
        }

        /**
         * Toggle widget open/closed
         */
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        /**
         * Open the widget
         */
        open() {
            if (this.isOpen) return;

            this.isOpen = true;
            widgetState.isOpen = true;

            this.elements.chatWindow.style.display = 'block';
            this.elements.launcher.style.display = 'none';

            // Focus input
            setTimeout(() => {
                this.elements.input.focus();
            }, 100);

            this.fireEvent('open');
            console.log('Chatbot widget opened');
        }

        /**
         * Close the widget
         */
        close() {
            if (!this.isOpen) return;

            this.isOpen = false;
            widgetState.isOpen = false;

            this.elements.chatWindow.style.display = 'none';
            this.elements.launcher.style.display = 'flex';

            this.fireEvent('close');
            console.log('Chatbot widget closed');
        }

        /**
         * Send a message
         */
        async sendMessage(messageText) {
            if (!messageText || typeof messageText !== 'string') return;

            const message = messageText.trim();
            if (!message) return;

            // Add user message
            this.addMessage({
                type: 'user',
                text: message,
                timestamp: new Date()
            });

            // Clear input if it matches the message
            if (this.elements.input.value.trim() === message) {
                this.elements.input.value = '';
                this.autoResizeTextarea();
            }

            // Show typing indicator
            if (this.config.showTyping) {
                this.showTypingIndicator();
            }

            try {
                // Simulate API call
                const response = await this.callAPI(message);

                // Hide typing indicator
                this.hideTypingIndicator();

                // Add bot response
                this.addMessage({
                    type: 'bot',
                    text: response.response || 'I apologize, but I couldn\'t process your request.',
                    timestamp: new Date()
                });

                this.fireEvent('message', {
                    user: message,
                    bot: response.response,
                    isTestResponse: response.isTestResponse
                });

            } catch (error) {
                console.error('Error sending message:', error);

                this.hideTypingIndicator();
                this.addMessage({
                    type: 'bot',
                    text: 'Sorry, I\'m having trouble connecting right now. Please try again.',
                    timestamp: new Date()
                });

                this.fireEvent('error', { error: error.message });
            }
        }

        /**
         * Handle send message from UI
         */
        handleSendMessage() {
            const message = this.elements.input.value.trim();
            if (message) {
                this.sendMessage(message);
            }
        }

        /**
         * Add message to chat
         */
        addMessage(message) {
            this.messages.push(message);
            widgetState.messages = this.messages;

            const messageElement = this.createMessageElement(message);
            this.elements.messages.appendChild(messageElement);

            // Scroll to bottom
            this.scrollToBottom();
        }

        /**
         * Create message element
         */
        createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message chatbot-message-${message.type} chatbot-message-${message.type}-${this.config.theme}`;

            const avatar = document.createElement('div');
            avatar.className = `chatbot-avatar chatbot-avatar-${message.type} chatbot-avatar-${message.type}-${this.config.theme}`;

            const bubble = document.createElement('div');
            bubble.className = `chatbot-message-bubble chatbot-message-bubble-${this.config.theme}`;
            bubble.textContent = message.text;

            if (message.type === 'user') {
                messageDiv.appendChild(bubble);
                messageDiv.appendChild(avatar);
            } else {
                messageDiv.appendChild(avatar);
                messageDiv.appendChild(bubble);
            }

            // Add timestamp if needed
            const time = document.createElement('div');
            time.className = `chatbot-message-time chatbot-message-time-${this.config.theme}`;
            time.textContent = this.formatTime(message.timestamp);
            bubble.appendChild(time);

            return messageDiv;
        }

        /**
         * Show typing indicator
         */
        showTypingIndicator() {
            if (this.isTyping) return;

            this.isTyping = true;
            widgetState.isTyping = true;

            const typingDiv = document.createElement('div');
            typingDiv.className = `chatbot-typing chatbot-typing-${this.config.theme}`;
            typingDiv.id = 'chatbot-typing-indicator';

            typingDiv.innerHTML = `
                <div class="chatbot-avatar chatbot-avatar-bot chatbot-avatar-bot-${this.config.theme}"></div>
                <div>
                    <span>Typing</span>
                    <div class="chatbot-typing-dots chatbot-typing-dots-${this.config.theme}">
                        <div class="chatbot-typing-dot chatbot-typing-dot-${this.config.theme}"></div>
                        <div class="chatbot-typing-dot chatbot-typing-dot-${this.config.theme}"></div>
                        <div class="chatbot-typing-dot chatbot-typing-dot-${this.config.theme}"></div>
                    </div>
                </div>
            `;

            this.elements.messages.appendChild(typingDiv);
            this.scrollToBottom();
        }

        /**
         * Hide typing indicator
         */
        hideTypingIndicator() {
            this.isTyping = false;
            widgetState.isTyping = false;

            const typingIndicator = document.getElementById('chatbot-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        /**
         * Call API (simulated for test harness)
         */
        async callAPI(message) {
            const url = this.config.apiEndpoint + '/message';

            const payload = {
                message: message,
                sessionId: this.sessionId,
                orgId: this.config.orgId,
                context: this.config.context,
                timestamp: new Date().toISOString()
            };

            // Simulate network delay
            const delay = parseInt(process?.env?.RESPONSE_DELAY_MS) || 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.warn('API call failed, using fallback response:', error);

                // Fallback response for demo purposes
                return {
                    success: true,
                    response: this.getFallbackResponse(message),
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString(),
                    isTestResponse: true
                };
            }
        }

        /**
         * Get fallback response for demo
         */
        getFallbackResponse(message) {
            const responses = [
                "Thanks for your message! This is a demo response from the test harness.",
                "I understand you're asking about: \"" + message + "\". How can I help you further?",
                "That's a great question! In a real implementation, I'd provide specific information based on your query.",
                "I'm here to help! This widget is working perfectly for testing integration methods.",
                "Thanks for testing the chatbot widget! Your message has been received successfully."
            ];

            // Simple keyword matching for more realistic responses
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
                return "I'm here to help! What specific assistance do you need today?";
            }

            if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
                return "I'd be happy to help you with pricing information. What product or service are you interested in?";
            }

            if (lowerMessage.includes('demo') || lowerMessage.includes('test')) {
                return "Great! You're successfully testing the chatbot widget. Everything is working as expected!";
            }

            if (lowerMessage.includes('integration')) {
                return "This widget supports multiple integration methods: CDN, NPM package, and iframe embedding. Which method are you testing?";
            }

            // Random fallback
            return responses[Math.floor(Math.random() * responses.length)];
        }

        /**
         * Update widget configuration
         */
        updateConfig(newConfig) {
            const oldTheme = this.config.theme;
            this.config = { ...this.config, ...newConfig };
            widgetState.config = this.config;

            // Reload theme if changed
            if (newConfig.theme && newConfig.theme !== oldTheme) {
                this.loadTheme();
                this.updateThemeClasses();
            }

            // Update position if changed
            if (newConfig.position) {
                this.elements.container.style.cssText = this.getContainerStyles();
            }

            this.fireEvent('configUpdate', { config: this.config });
        }

        /**
         * Update theme classes
         */
        updateThemeClasses() {
            // This is a simplified implementation
            // In a full implementation, you'd update all theme-related classes
            console.log('Theme updated to:', this.config.theme);
        }

        /**
         * Auto-resize textarea
         */
        autoResizeTextarea() {
            const textarea = this.elements.input;
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }

        /**
         * Scroll messages to bottom
         */
        scrollToBottom() {
            const messages = this.elements.messages;
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);
        }

        /**
         * Fire custom event
         */
        fireEvent(eventName, data = {}) {
            const event = new CustomEvent(`chatbot:${eventName}`, {
                detail: { ...data, widget: this }
            });
            window.dispatchEvent(event);
        }

        /**
         * Utility methods
         */
        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        formatTime(date) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        isMobile() {
            return window.innerWidth <= 768;
        }

        getBaseUrl() {
            return window.location.origin;
        }

        /**
         * Get container styles based on position
         */
        getContainerStyles() {
            const base = `
                position: fixed;
                z-index: 9999;
                font-family: inherit;
            `;

            switch (this.config.position) {
                case 'bottom-left':
                    return base + `
                        bottom: 20px;
                        left: 20px;
                    `;
                case 'bottom-right':
                default:
                    return base + `
                        bottom: 20px;
                        right: 20px;
                    `;
            }
        }

        /**
         * Get chat window styles
         */
        getChatWindowStyles() {
            return `
                width: ${this.config.widgetWidth || '350px'};
                height: ${this.config.widgetHeight || '500px'};
                max-width: 90vw;
                max-height: 80vh;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                background: white;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            `;
        }

        /**
         * Destroy widget
         */
        destroy() {
            if (this.elements.container) {
                this.elements.container.remove();
            }

            const themeLink = document.getElementById(`chatbot-theme-${this.config.theme}`);
            if (themeLink) {
                themeLink.remove();
            }

            widgetState.isInitialized = false;
            delete window.ChatbotWidget;

            this.fireEvent('destroy');
        }
    }

    /**
     * Auto-initialization
     */
    function autoInit() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoInit);
            return;
        }

        // Check if global config exists
        if (window.ChatbotConfig) {
            const widget = new ChatbotWidget(window.ChatbotConfig);
            widget.init();
        } else {
            console.log('ChatbotConfig not found. Initialize manually: new ChatbotWidget(config).init()');
        }
    }

    /**
     * Global API
     */
    window.ChatbotWidget = ChatbotWidget;

    /**
     * Legacy global methods for backward compatibility
     */
    window.ChatbotWidget.open = function () {
        if (window.ChatbotWidget && typeof window.ChatbotWidget.open === 'function') {
            window.ChatbotWidget.open();
        }
    };

    window.ChatbotWidget.close = function () {
        if (window.ChatbotWidget && typeof window.ChatbotWidget.close === 'function') {
            window.ChatbotWidget.close();
        }
    };

    window.ChatbotWidget.sendMessage = function (message) {
        if (window.ChatbotWidget && typeof window.ChatbotWidget.sendMessage === 'function') {
            window.ChatbotWidget.sendMessage(message);
        }
    };

    // Auto-initialize
    autoInit();

    console.log('Chatbot widget script loaded');

})();