/**
 * Integration Examples - Helper utilities for chatbot widget testing
 * Provides utilities for demonstrating different integration scenarios
 */

(function () {
    'use strict';

    /**
     * Integration Examples Namespace
     */
    window.ChatbotIntegration = {

        /**
         * Initialize integration examples
         */
        init: function () {
            console.log('Chatbot Integration Examples loaded');
            this.setupDemoHelpers();
            this.setupEventListeners();
            this.detectEnvironment();
        },

        /**
         * Setup demo helper functions
         */
        setupDemoHelpers: function () {
            // Theme switching
            window.switchChatbotTheme = (theme) => {
                if (window.ChatbotWidget && window.ChatbotWidget.updateConfig) {
                    window.ChatbotWidget.updateConfig({ theme: theme });
                    console.log('Theme switched to:', theme);
                }
            };

            // Position switching
            window.changeChatbotPosition = (position) => {
                if (window.ChatbotWidget && window.ChatbotWidget.updateConfig) {
                    window.ChatbotWidget.updateConfig({ position: position });
                    console.log('Position changed to:', position);
                }
            };

            // Open/close shortcuts
            window.openChatbot = () => {
                if (window.ChatbotWidget && window.ChatbotWidget.open) {
                    window.ChatbotWidget.open();
                }
            };

            window.closeChatbot = () => {
                if (window.ChatbotWidget && window.ChatbotWidget.close) {
                    window.ChatbotWidget.close();
                }
            };

            // Send predefined messages
            window.sendDemoMessage = (message) => {
                if (window.ChatbotWidget && window.ChatbotWidget.sendMessage) {
                    window.ChatbotWidget.sendMessage(message || 'This is a demo message!');
                }
            };
        },

        /**
         * Setup event listeners for integration demos
         */
        setupEventListeners: function () {
            // Listen for chatbot events
            window.addEventListener('chatbot:init', (e) => {
                console.log('Chatbot initialized:', e.detail);
                this.onChatbotReady();
            });

            window.addEventListener('chatbot:open', (e) => {
                console.log('Chatbot opened');
                this.trackEvent('chatbot_opened');
            });

            window.addEventListener('chatbot:close', (e) => {
                console.log('Chatbot closed');
                this.trackEvent('chatbot_closed');
            });

            window.addEventListener('chatbot:message', (e) => {
                console.log('Message exchanged:', e.detail);
                this.trackEvent('message_sent', {
                    userMessage: e.detail.user,
                    botResponse: e.detail.bot
                });
            });

            window.addEventListener('chatbot:error', (e) => {
                console.error('Chatbot error:', e.detail);
                this.trackEvent('chatbot_error', e.detail);
            });
        },

        /**
         * Called when chatbot is ready
         */
        onChatbotReady: function () {
            // Add demo-specific functionality
            this.addDemoControls();
            this.setupKeyboardShortcuts();
        },

        /**
         * Add demo control buttons
         */
        addDemoControls: function () {
            // Only add controls in demo environments
            if (!this.isDemoEnvironment()) return;

            const controlsId = 'chatbot-demo-controls';
            if (document.getElementById(controlsId)) return; // Already exists

            const controls = document.createElement('div');
            controls.id = controlsId;
            controls.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 250px;
            `;

            controls.innerHTML = `
                <div style="margin-bottom: 10px; font-weight: bold;">🤖 Demo Controls</div>
                <button onclick="openChatbot()" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Open</button>
                <button onclick="closeChatbot()" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Close</button>
                <button onclick="sendDemoMessage()" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Demo Msg</button>
                <br>
                <button onclick="switchChatbotTheme('corporate-blue')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Blue</button>
                <button onclick="switchChatbotTheme('warm-orange')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Orange</button>
                <button onclick="switchChatbotTheme('modern-purple')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Purple</button>
                <br>
                <button onclick="changeChatbotPosition('bottom-right')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Right</button>
                <button onclick="changeChatbotPosition('bottom-left')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Left</button>
                <br>
                <button onclick="this.parentElement.style.display='none'" style="margin-top: 5px; padding: 4px 8px; font-size: 10px;">Hide</button>
            `;

            document.body.appendChild(controls);

            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (controls.parentElement) {
                    controls.style.opacity = '0.3';
                }
            }, 10000);
        },

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts: function () {
            document.addEventListener('keydown', (e) => {
                // Only in demo environment
                if (!this.isDemoEnvironment()) return;

                // Ctrl/Cmd + Shift + C = Toggle chatbot
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    if (window.ChatbotWidget) {
                        if (window.ChatbotWidget.isOpen) {
                            window.ChatbotWidget.close();
                        } else {
                            window.ChatbotWidget.open();
                        }
                    }
                }

                // Ctrl/Cmd + Shift + M = Send demo message
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
                    e.preventDefault();
                    sendDemoMessage('Demo message sent via keyboard shortcut!');
                }
            });
        },

        /**
         * Detect current environment
         */
        detectEnvironment: function () {
            const environment = {
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                isMobile: window.innerWidth <= 768,
                isTouch: 'ontouchstart' in window,
                integration: this.detectIntegrationMethod()
            };

            console.log('Environment detected:', environment);
            this.environment = environment;
        },

        /**
         * Detect integration method
         */
        detectIntegrationMethod: function () {
            // Check if we're in an iframe
            if (window !== window.top) {
                return 'iframe';
            }

            // Check for NPM-style integration
            if (window.ChatbotConfig && window.ChatbotConfig.integrationMethod === 'npm-package') {
                return 'npm';
            }

            // Default to CDN
            return 'cdn';
        },

        /**
         * Check if we're in a demo environment
         */
        isDemoEnvironment: function () {
            return window.location.hostname === 'localhost' ||
                window.location.hostname.includes('demo') ||
                window.location.hostname.includes('test') ||
                window.location.search.includes('demo=true');
        },

        /**
         * Track events for analytics (demo implementation)
         */
        trackEvent: function (eventName, data = {}) {
            const event = {
                name: eventName,
                data: data,
                timestamp: new Date().toISOString(),
                session: this.getSessionId(),
                environment: this.environment
            };

            console.log('Event tracked:', event);

            // In a real implementation, send to analytics service
            if (window.gtag) {
                window.gtag('event', eventName, data);
            }

            // Store in sessionStorage for demo purposes
            try {
                const events = JSON.parse(sessionStorage.getItem('chatbot_events') || '[]');
                events.push(event);
                sessionStorage.setItem('chatbot_events', JSON.stringify(events.slice(-50))); // Keep last 50 events
            } catch (e) {
                console.warn('Could not store event in sessionStorage:', e);
            }
        },

        /**
         * Get or create session ID
         */
        getSessionId: function () {
            let sessionId = sessionStorage.getItem('chatbot_session_id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('chatbot_session_id', sessionId);
            }
            return sessionId;
        },

        /**
         * Integration testing utilities
         */
        testing: {
            /**
             * Run integration tests
             */
            runTests: function () {
                console.log('Running chatbot integration tests...');

                const tests = [
                    this.testWidgetInitialization,
                    this.testThemeSwitching,
                    this.testPositioning,
                    this.testMessaging,
                    this.testResponsiveness
                ];

                let passed = 0;
                let failed = 0;

                tests.forEach((test, index) => {
                    try {
                        const result = test.call(this);
                        if (result) {
                            console.log(`✅ Test ${index + 1} passed:`, test.name);
                            passed++;
                        } else {
                            console.log(`❌ Test ${index + 1} failed:`, test.name);
                            failed++;
                        }
                    } catch (error) {
                        console.error(`💥 Test ${index + 1} crashed:`, test.name, error);
                        failed++;
                    }
                });

                console.log(`Test results: ${passed} passed, ${failed} failed`);
                return { passed, failed, total: tests.length };
            },

            /**
             * Test widget initialization
             */
            testWidgetInitialization: function () {
                return window.ChatbotWidget &&
                    typeof window.ChatbotWidget === 'object' &&
                    document.getElementById('chatbot-widget-container') !== null;
            },

            /**
             * Test theme switching
             */
            testThemeSwitching: function () {
                if (!window.ChatbotWidget || !window.ChatbotWidget.updateConfig) return false;

                const originalTheme = window.ChatbotWidget.config.theme;
                window.ChatbotWidget.updateConfig({ theme: 'warm-orange' });
                const themeChanged = window.ChatbotWidget.config.theme === 'warm-orange';

                // Restore original theme
                window.ChatbotWidget.updateConfig({ theme: originalTheme });

                return themeChanged;
            },

            /**
             * Test positioning
             */
            testPositioning: function () {
                if (!window.ChatbotWidget || !window.ChatbotWidget.updateConfig) return false;

                const originalPosition = window.ChatbotWidget.config.position;
                window.ChatbotWidget.updateConfig({ position: 'bottom-left' });
                const positionChanged = window.ChatbotWidget.config.position === 'bottom-left';

                // Restore original position
                window.ChatbotWidget.updateConfig({ position: originalPosition });

                return positionChanged;
            },

            /**
             * Test messaging functionality
             */
            testMessaging: function () {
                if (!window.ChatbotWidget || !window.ChatbotWidget.sendMessage) return false;

                const initialMessageCount = window.ChatbotWidget.messages ? window.ChatbotWidget.messages.length : 0;
                window.ChatbotWidget.sendMessage('Test message');

                // Check if message was added (this is immediate, before API response)
                return window.ChatbotWidget.messages &&
                    window.ChatbotWidget.messages.length > initialMessageCount;
            },

            /**
             * Test responsiveness
             */
            testResponsiveness: function () {
                const container = document.getElementById('chatbot-widget-container');
                if (!container) return false;

                // Check if widget adapts to different screen sizes
                const originalWidth = window.innerWidth;

                // Simulate mobile viewport
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: 375
                });

                const isMobileResponsive = window.ChatbotWidget.isMobile && window.ChatbotWidget.isMobile();

                // Restore original width
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: originalWidth
                });

                return isMobileResponsive;
            }
        },

        /**
         * Performance monitoring utilities
         */
        performance: {
            /**
             * Measure widget load time
             */
            measureLoadTime: function () {
                const startTime = performance.now();

                return new Promise((resolve) => {
                    window.addEventListener('chatbot:init', () => {
                        const loadTime = performance.now() - startTime;
                        console.log(`Widget loaded in ${loadTime.toFixed(2)}ms`);
                        resolve(loadTime);
                    });
                });
            },

            /**
             * Monitor memory usage
             */
            monitorMemory: function () {
                if (performance.memory) {
                    const memory = {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                    };
                    console.log('Memory usage:', memory);
                    return memory;
                }
                return null;
            },

            /**
             * Measure API response time
             */
            measureAPIResponse: function () {
                if (!window.ChatbotWidget) return Promise.resolve(null);

                const startTime = performance.now();

                return new Promise((resolve) => {
                    window.addEventListener('chatbot:message', () => {
                        const responseTime = performance.now() - startTime;
                        console.log(`API response time: ${responseTime.toFixed(2)}ms`);
                        resolve(responseTime);
                    });

                    // Send a test message
                    window.ChatbotWidget.sendMessage('Performance test message');
                });
            }
        },

        /**
         * Accessibility testing utilities
         */
        accessibility: {
            /**
             * Check accessibility compliance
             */
            checkCompliance: function () {
                const issues = [];
                const container = document.getElementById('chatbot-widget-container');

                if (!container) {
                    issues.push('Widget container not found');
                    return issues;
                }

                // Check for ARIA labels
                const buttons = container.querySelectorAll('button');
                buttons.forEach((button, index) => {
                    if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                        issues.push(`Button ${index} missing aria-label`);
                    }
                });

                // Check for keyboard navigation
                const focusableElements = container.querySelectorAll('button, input, textarea');
                focusableElements.forEach((element, index) => {
                    if (element.tabIndex < 0) {
                        issues.push(`Element ${index} not keyboard accessible`);
                    }
                });

                // Check color contrast (simplified)
                const textElements = container.querySelectorAll('*');
                // This is a simplified check - in practice, you'd use a proper color contrast library

                console.log('Accessibility check completed:', issues.length === 0 ? 'PASSED' : 'ISSUES FOUND');
                if (issues.length > 0) {
                    console.warn('Accessibility issues:', issues);
                }

                return issues;
            },

            /**
             * Test keyboard navigation
             */
            testKeyboardNav: function () {
                const container = document.getElementById('chatbot-widget-container');
                if (!container) return false;

                const focusableElements = container.querySelectorAll('button, input, textarea');

                // Test if all elements can receive focus
                let allFocusable = true;
                focusableElements.forEach((element) => {
                    element.focus();
                    if (document.activeElement !== element) {
                        allFocusable = false;
                        console.warn('Element not focusable:', element);
                    }
                });

                return allFocusable;
            }
        },

        /**
         * Demo scenario runners
         */
        scenarios: {
            /**
             * E-commerce scenario
             */
            ecommerce: function () {
                console.log('Running e-commerce demo scenario...');

                setTimeout(() => {
                    if (window.ChatbotWidget) {
                        window.ChatbotWidget.open();
                        setTimeout(() => {
                            window.ChatbotWidget.sendMessage("I'm looking for a new laptop for gaming. What do you recommend?");
                        }, 1000);
                    }
                }, 2000);
            },

            /**
             * Corporate support scenario
             */
            corporate: function () {
                console.log('Running corporate support demo scenario...');

                setTimeout(() => {
                    if (window.ChatbotWidget) {
                        window.ChatbotWidget.open();
                        setTimeout(() => {
                            window.ChatbotWidget.sendMessage("I need help with your business consulting services. Can you provide more information?");
                        }, 1000);
                    }
                }, 2000);
            },

            /**
             * Technical support scenario
             */
            support: function () {
                console.log('Running technical support demo scenario...');

                setTimeout(() => {
                    if (window.ChatbotWidget) {
                        window.ChatbotWidget.open();
                        setTimeout(() => {
                            window.ChatbotWidget.sendMessage("I'm having trouble with my account login. Can you help me reset my password?");
                        }, 1000);
                    }
                }, 2000);
            }
        },

        /**
         * Export demo data
         */
        exportDemoData: function () {
            const data = {
                environment: this.environment,
                events: JSON.parse(sessionStorage.getItem('chatbot_events') || '[]'),
                config: window.ChatbotWidget ? window.ChatbotWidget.config : null,
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `chatbot-demo-data-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Demo data exported');
        },

        /**
         * Show integration code examples
         */
        showIntegrationCode: function () {
            const examples = {
                cdn: `<!-- CDN Integration -->
<script>
window.ChatbotConfig = {
    apiEndpoint: 'https://your-api.com/chat',
    theme: 'corporate-blue',
    orgId: 'your-org-id',
    greeting: 'Hello! How can we help?'
};
</script>
<script src="https://your-cdn.com/chatbot-widget.js"></script>`,

                npm: `// NPM Integration
import ChatbotWidget from '@yourorg/chatbot-widget';

const widget = new ChatbotWidget({
    apiEndpoint: 'https://your-api.com/chat',
    theme: 'warm-orange',
    orgId: 'your-org-id'
});

widget.init();`,

                iframe: `<!-- Iframe Integration -->
<iframe 
    src="https://your-domain.com/widget/iframe?orgId=your-org&theme=modern-purple"
    width="350" 
    height="500"
    frameborder="0"
    title="Customer Support Chat">
</iframe>`
            };

            console.log('Integration examples:');
            Object.entries(examples).forEach(([method, code]) => {
                console.log(`\n${method.toUpperCase()}:\n${code}\n`);
            });

            return examples;
        }
    };

    /**
     * Auto-initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ChatbotIntegration.init();
        });
    } else {
        window.ChatbotIntegration.init();
    }

    console.log('Chatbot Integration Examples script loaded');

})();