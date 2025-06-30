// test-server/app.js - Fixed version with proper error handling
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
} else {
    // Development - more permissive CSP
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "'unsafe-inline'"],
                "style-src": ["'self'", "'unsafe-inline'"],
            },
        },
    }));
}
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes for different integration test scenarios
app.get('/', (req, res) => {
    res.render('index', {
        title: 'CDN Script Tag Integration Test',
        description: 'Testing chatbot widget loaded via CDN script tag'
    });
});

app.get('/npm-test', (req, res) => {
    res.render('npm-integration', {
        title: 'NPM Package Integration Test',
        description: 'Testing chatbot as bundled NPM package'
    });
});

app.get('/iframe-test', (req, res) => {
    res.render('iframe-integration', {
        title: 'Iframe Integration Test',
        description: 'Testing chatbot in sandboxed iframe'
    });
});

app.get('/mobile-test', (req, res) => {
    res.render('mobile-test', {
        title: 'Mobile Responsive Test',
        description: 'Testing mobile optimization and touch interactions'
    });
});

app.get('/corporate-sim', (req, res) => {
    res.render('corporate-sim', {
        title: 'Corporate Website Simulation',
        description: 'Testing chatbot in professional corporate environment'
    });
});

app.get('/ecommerce-sim', (req, res) => {
    res.render('ecommerce-sim', {
        title: 'E-commerce Integration Demo',
        description: 'Testing chatbot in online retail environment'
    });
});

// Mock chatbot API endpoint (for testing widget integration)
app.post('/api/chat/message', (req, res) => {
    const { message, sessionId } = req.body;

    // Simple mock responses for testing
    const mockResponses = [
        "Thanks for your message! This is a test response.",
        "I'm a test chatbot. How can I help you?",
        "This is just a demo - the real chatbot will be much smarter!",
        "Great question! In a real deployment, this would connect to your knowledge base.",
        "Test response: I understand you said '" + message + "'"
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Simulate some processing time
    setTimeout(() => {
        res.json({
            success: true,
            response: randomResponse,
            sessionId: sessionId || 'test-session',
            timestamp: new Date().toISOString(),
            isTestResponse: true
        });
    }, 500 + Math.random() * 1000); // 0.5-1.5 second delay
});

// Configuration endpoint for different organizations
app.get('/api/chatbot-config/:orgId', (req, res) => {
    const { orgId } = req.params;

    const configs = {
        'acme-corp': {
            theme: 'corporate-blue',
            position: 'bottom-right',
            greeting: 'Hello! How can Acme Corp help you today?',
            apiEndpoint: `http://localhost:${PORT}/api/chat`,
            orgId: 'acme-corp'
        },
        'local-cafe': {
            theme: 'warm-orange',
            position: 'bottom-left',
            greeting: 'Welcome to Local Cafe! Questions about our menu?',
            apiEndpoint: `http://localhost:${PORT}/api/chat`,
            orgId: 'local-cafe'
        }
    };

    const config = configs[orgId] || configs['acme-corp'];
    res.json(config);
});

// Serve the chatbot widget JavaScript
app.get('/widget/chatbot-widget.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache'); // No caching for development
    res.sendFile(path.join(__dirname, 'public/js/chatbot-widget.js'));
});

// Serve widget themes CSS
app.get('/css/themes/:theme.css', (req, res) => {
    const { theme } = req.params;
    const validThemes = ['corporate-blue', 'warm-orange', 'modern-purple'];

    if (!validThemes.includes(theme)) {
        return res.status(404).render('error', {
            errorCode: '404',
            errorMessage: `Theme '${theme}' not found`,
            errorStack: null,
            originalUrl: req.originalUrl
        });
    }

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'no-cache'); // No caching for development
    res.sendFile(path.join(__dirname, 'public/css/themes', `${theme}.css`));
});

// Iframe widget endpoint
app.get('/widget/iframe', (req, res) => {
    const { orgId, theme, position, greeting, autoOpen } = req.query;

    // Create a minimal HTML page for iframe embedding
    const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chatbot Widget</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background: transparent;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
        </style>
    </head>
    <body>
        <script>
            window.ChatbotConfig = {
                apiEndpoint: '${process.env.BASE_URL || `http://localhost:${PORT}`}/api/chat',
                theme: '${theme || process.env.DEFAULT_WIDGET_THEME || 'corporate-blue'}',
                position: '${position || 'center'}',
                greeting: '${greeting || process.env.DEFAULT_GREETING || 'Hello! How can I help you today?'}',
                orgId: '${orgId || process.env.DEFAULT_ORG_ID || 'demo-org'}',
                autoOpen: ${autoOpen === 'true'},
                showTyping: true,
                mobileOptimized: true
            };
        </script>
        <script src="${process.env.BASE_URL || `http://localhost:${PORT}`}/widget/chatbot-widget.js"></script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(iframeHtml);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'test-harness',
        port: PORT
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        errorCode: '404',
        errorMessage: `Page not found: ${req.originalUrl}`,
        errorStack: null,
        originalUrl: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);

    // Determine error code
    const errorCode = err.status || err.statusCode || 500;

    res.status(errorCode).render('error', {
        errorCode: errorCode.toString(),
        errorMessage: err.message || 'Something went wrong!',
        errorStack: process.env.NODE_ENV === 'development' ? err.stack : null,
        originalUrl: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Chatbot Test Harness running on http://localhost:${PORT}`);
    console.log(`📋 Available test routes:`);
    console.log(`   • CDN Integration: http://localhost:${PORT}/`);
    console.log(`   • NPM Integration: http://localhost:${PORT}/npm-test`);
    console.log(`   • Iframe Integration: http://localhost:${PORT}/iframe-test`);
    console.log(`   • Mobile Test: http://localhost:${PORT}/mobile-test`);
    console.log(`   • Corporate Demo: http://localhost:${PORT}/corporate-sim`);
    console.log(`   • E-commerce Demo: http://localhost:${PORT}/ecommerce-sim`);
    console.log(`   • Health Check: http://localhost:${PORT}/health`);
    console.log(`   • Mock Chat API: POST http://localhost:${PORT}/api/chat/message`);
    console.log(`\n💡 Use Ctrl+C to stop the server`);
});

module.exports = app;