// test-server/app.js - Simplified version without rate limiting
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
app.use(helmet());
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

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'test-harness'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Page not found',
        error: {}
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Chatbot Test Harness running on http://localhost:${PORT}`);
    console.log(`📋 Available test routes:`);
    console.log(`   • CDN Integration: http://localhost:${PORT}/`);
    console.log(`   • NPM Integration: http://localhost:${PORT}/npm-test`);
    console.log(`   • Iframe Integration: http://localhost:${PORT}/iframe-test`);
    console.log(`   • Health Check: http://localhost:${PORT}/health`);
    console.log(`   • Mock Chat API: POST http://localhost:${PORT}/api/chat/message`);
});

module.exports = app;