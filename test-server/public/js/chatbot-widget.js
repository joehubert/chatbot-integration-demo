/**
 * Shell Chatbot Widget - Web Components Implementation
 * Focuses on embeddability testing with mock intelligence
 */

class AIChatbotWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.config = {};
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
    }

    static get observedAttributes() {
        return ['org-id', 'theme', 'position', 'auto-open'];
    }

    connectedCallback() {
        this.loadConfig();
        this.render();
        this.attachEventListeners();
        this.initializeWidget();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.loadConfig();
            this.render();
        }
    }

    loadConfig() {
        // Merge attributes, global config, and defaults
        this.config = {
            orgId: this.getAttribute('org-id') || window.ChatbotConfig?.orgId || 'demo',
            theme: this.getAttribute('theme') || window.ChatbotConfig?.theme || 'corporate-blue',
            position: this.getAttribute('position') || window.ChatbotConfig?.position || 'bottom-right',
            autoOpen: this.getAttribute('auto-open') === 'true' || window.ChatbotConfig?.autoOpen || false,
            greeting: window.ChatbotConfig?.greeting || 'Hello! How can I help you?',
            apiEndpoint: window.ChatbotConfig?.apiEndpoint || '/api/chat',
            fallbackToIframe: !this.supportsWebComponents() || window.ChatbotConfig?.forceIframe
        };
    }

    supportsWebComponents() {
        return 'customElements' in window &&
            'attachShadow' in Element.prototype &&
            'getRootNode' in Element.prototype;
    }

    render() {
        if (this.config.fallbackToIframe) {
            this.renderIframe();
        } else {
            this.renderWebComponent();
        }
    }

    renderWebComponent() {
        const styles = this.getStyles();
        const html = this.getHTML();

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            ${html}
        `;
    }

    renderIframe() {
        const iframeUrl = new URL('/widget/iframe', window.location.origin);
        Object.entries(this.config).forEach(([key, value]) => {
            if (value !== undefined) {
                iframeUrl.searchParams.set(key, value);
            }
        });

        this.shadowRoot.innerHTML = `
            <style>
                :host { 
                    position: fixed; 
                    ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                    bottom: 20px; 
                    z-index: 9999; 
                }
                iframe { 
                    border: none; 
                    border-radius: 12px; 
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
                }
            </style>
            <iframe src="${iframeUrl}" width="350" height="500" title="AI Chatbot"></iframe>
        `;
    }

    getStyles() {
        return `
            :host {
                position: fixed;
                ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                bottom: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chatbot-launcher {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${this.getThemeColor()};
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chatbot-launcher:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }

            .chatbot-window {
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .chatbot-window.open {
                display: flex;
            }

            .chatbot-header {
                background: ${this.getThemeColor()};
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                background: #fafafa;
            }

            .message {
                margin-bottom: 12px;
                max-width: 80%;
                padding: 8px 12px;
                border-radius: 12px;
                word-wrap: break-word;
            }

            .message.user {
                background: ${this.getThemeColor()};
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }

            .message.bot {
                background: white;
                border: 1px solid #e1e5e9;
                border-bottom-left-radius: 4px;
            }

            .chatbot-input-area {
                padding: 16px;
                border-top: 1px solid #e1e5e9;
                display: flex;
                gap: 8px;
            }

            .chatbot-input {
                flex: 1;
                border: 1px solid #e1e5e9;
                border-radius: 20px;
                padding: 8px 12px;
                outline: none;
                resize: none;
                max-height: 80px;
            }

            .chatbot-send {
                background: ${this.getThemeColor()};
                color: white;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-btn {
                background: transparent;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }

            .close-btn:hover {
                background: rgba(255,255,255,0.2);
            }

            .typing-indicator {
                display: none;
                padding: 8px 12px;
                color: #666;
                font-style: italic;
                font-size: 14px;
            }

            .typing-indicator.show {
                display: block;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                :host {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                }

                .chatbot-window {
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                }

                .chatbot-launcher {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
    }

    getHTML() {
        return `
            <button class="chatbot-launcher" id="launcher" aria-label="Open chat">
                💬
            </button>
            <div class="chatbot-window" id="chatWindow">
                <div class="chatbot-header">
                    <span>AI Assistant</span>
                    <button class="close-btn" id="closeBtn" aria-label="Close chat">×</button>
                </div>
                <div class="chatbot-messages" id="messages">
                    <div class="message bot">${this.config.greeting}</div>
                </div>
                <div class="typing-indicator" id="typingIndicator">
                    AI is typing...
                </div>
                <div class="chatbot-input-area">
                    <textarea 
                        class="chatbot-input" 
                        id="messageInput" 
                        placeholder="Type your message..."
                        rows="1"
                    ></textarea>
                    <button class="chatbot-send" id="sendBtn" aria-label="Send message">
                        ➤
                    </button>
                </div>
            </div>
        `;
    }

    getThemeColor() {
        const themes = {
            'corporate-blue': '#2c5aa0',
            'warm-orange': '#ff7f50',
            'modern-purple': '#8b5cf6'
        };
        return themes[this.config.theme] || themes['corporate-blue'];
    }

    attachEventListeners() {
        if (this.config.fallbackToIframe) return;

        const launcher = this.shadowRoot.getElementById('launcher');
        const closeBtn = this.shadowRoot.getElementById('closeBtn');
        const sendBtn = this.shadowRoot.getElementById('sendBtn');
        const messageInput = this.shadowRoot.getElementById('messageInput');

        launcher?.addEventListener('click', () => this.toggleWidget());
        closeBtn?.addEventListener('click', () => this.closeWidget());
        sendBtn?.addEventListener('click', () => this.sendMessage());

        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        messageInput?.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 80) + 'px';
        });
    }

    initializeWidget() {
        if (this.config.autoOpen) {
            setTimeout(() => this.openWidget(), 1000);
        }

        // Dispatch ready event
        this.dispatchEvent(new CustomEvent('chatbot-ready', {
            detail: { config: this.config, method: this.config.fallbackToIframe ? 'iframe' : 'webcomponent' }
        }));
    }

    toggleWidget() {
        this.isOpen ? this.closeWidget() : this.openWidget();
    }

    openWidget() {
        if (this.config.fallbackToIframe) return;

        this.isOpen = true;
        const chatWindow = this.shadowRoot.getElementById('chatWindow');
        const launcher = this.shadowRoot.getElementById('launcher');

        chatWindow.classList.add('open');
        launcher.style.display = 'none';

        // Focus input
        setTimeout(() => {
            this.shadowRoot.getElementById('messageInput')?.focus();
        }, 100);

        this.dispatchEvent(new CustomEvent('chatbot-opened'));
    }

    closeWidget() {
        if (this.config.fallbackToIframe) return;

        this.isOpen = false;
        const chatWindow = this.shadowRoot.getElementById('chatWindow');
        const launcher = this.shadowRoot.getElementById('launcher');

        chatWindow.classList.remove('open');
        launcher.style.display = 'flex';

        this.dispatchEvent(new CustomEvent('chatbot-closed'));
    }

    async sendMessage() {
        const messageInput = this.shadowRoot.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Show typing indicator
        this.showTyping();

        try {
            // Simulate API call with shell responses
            const response = await this.getShellResponse(message);

            // Hide typing and add bot response
            this.hideTyping();
            this.addMessage(response, 'bot');

        } catch (error) {
            this.hideTyping();
            this.addMessage('Sorry, I\'m having trouble responding right now. Please try again.', 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = this.shadowRoot.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ text, sender, timestamp: Date.now() });

        this.dispatchEvent(new CustomEvent('chatbot-message', {
            detail: { message: text, sender, sessionId: this.sessionId }
        }));
    }

    showTyping() {
        const indicator = this.shadowRoot.getElementById('typingIndicator');
        indicator?.classList.add('show');
    }

    hideTyping() {
        const indicator = this.shadowRoot.getElementById('typingIndicator');
        indicator?.classList.remove('show');
    }

    async getShellResponse(message) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        // Simple shell responses for testing
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm a shell chatbot for testing embeddability. How can I help you?";
        }

        if (lowerMessage.includes('test')) {
            return "Great! The embedding is working perfectly. This shell chatbot is successfully isolated in a Web Component with Shadow DOM.";
        }

        if (lowerMessage.includes('integration')) {
            return "This widget demonstrates Web Components + iframe fallback architecture. It automatically chooses the best rendering method for your browser.";
        }

        if (lowerMessage.includes('help')) {
            return "I'm a test chatbot focused on validating embeddability. Try asking about 'test', 'integration', or 'features'.";
        }

        if (lowerMessage.includes('features')) {
            return "Key features being tested: CSS isolation, cross-browser compatibility, responsive design, and seamless integration. All working! 🎉";
        }

        // Fallback responses
        const responses = [
            "That's interesting! I'm still learning, but I can help test this widget's integration.",
            "Thanks for testing the chatbot! The embedding seems to be working well.",
            "I understand you're asking about: '" + message + "'. This shell version focuses on testing embeddability.",
            "Great question! In the full version, I'll have access to your organization's knowledge base.",
            "This demonstrates how easily this chatbot integrates into any website. Pretty smooth, right?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateSessionId() {
        return 'shell_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API methods
    getMessages() {
        return [...this.messages];
    }

    clearMessages() {
        const messagesContainer = this.shadowRoot.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `<div class="message bot">${this.config.greeting}</div>`;
        }
        this.messages = [];
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.render();
        this.attachEventListeners();
    }
}

// Register the custom element
if ('customElements' in window) {
    customElements.define('ai-chatbot-widget', AIChatbotWidget);
}

// Global initialization function for script tag integration
window.initAIChatbot = function (config = {}) {
    // For script tag integration, create element and add to DOM
    const widget = document.createElement('ai-chatbot-widget');

    // Set attributes from config
    if (config.orgId) widget.setAttribute('org-id', config.orgId);
    if (config.theme) widget.setAttribute('theme', config.theme);
    if (config.position) widget.setAttribute('position', config.position);
    if (config.autoOpen) widget.setAttribute('auto-open', config.autoOpen);

    // Store global config for the widget to access
    window.ChatbotConfig = { ...window.ChatbotConfig, ...config };

    document.body.appendChild(widget);
    return widget;
};

// Auto-initialization if global config exists
document.addEventListener('DOMContentLoaded', () => {
    if (window.ChatbotConfig && !document.querySelector('ai-chatbot-widget')) {
        window.initAIChatbot(window.ChatbotConfig);
    }
});

console.log('AI Chatbot Widget (Shell Version) loaded successfully');