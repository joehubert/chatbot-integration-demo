# chatbot-integration-demo
Simple website to use as a harness for the AI chatbot (separate project).


# Project Structure and Files

This section explains the structure of the project and the purpose for the dirs and files.

## **Root Level Files**
```
chatbot-integration-demo/
├── README.md
├── package.json
├── .env.example
├── .gitignore
```

## **Test Server Files**
```
test-server/
├── app.js                          # Main Express application
├── views/                          # EJS templates
│   ├── index.ejs                   # CDN integration test
│   ├── npm-integration.ejs         # NPM package test
│   ├── iframe-integration.ejs      # Iframe embedding test
│   ├── mobile-test.ejs            # Mobile responsive test
│   ├── corporate-sim.ejs          # Corporate website simulation
│   ├── ecommerce-sim.ejs          # E-commerce integration
│   └── error.ejs                  # Error page template
├── public/
│   ├── css/
│   │   ├── themes/
│   │   │   ├── corporate-blue.css  # Professional blue theme
│   │   │   ├── warm-orange.css     # Friendly orange theme
│   │   │   └── modern-purple.css   # Contemporary purple theme
│   │   └── demo-sites.css          # Styling for demo pages
│   ├── js/
│   │   ├── chatbot-widget.js       # Main widget script
│   │   └── integration-examples.js # Integration helpers
│   └── images/                     # Demo logos and assets
│       └── logos/
│           ├── acme-corp.png
│           └── techshop.png
```

## **Examples Files**
```
examples/
├── vanilla-html/
│   ├── index.html                  # Pure HTML/JS integration
│   ├── style.css
│   └── script.js
├── react-app/
│   ├── package.json
│   ├── src/
│   │   ├── App.js                  # React component integration
│   │   ├── ChatbotWidget.js
│   │   └── index.js
│   └── public/
│       └── index.html
├── wordpress-plugin/
│   ├── chatbot-widget.php          # Main plugin file
│   ├── admin/
│   │   └── admin-panel.php         # WordPress admin configuration
│   └── assets/
│       ├── admin.css
│       └── admin.js
├── shopify-theme/
│   ├── layout/
│   │   └── theme.liquid            # Shopify theme integration
│   ├── snippets/
│   │   └── chatbot-widget.liquid
│   └── assets/
│       └── chatbot-config.js
└── static-site/
    ├── _config.yml                 # Jekyll configuration
    ├── _includes/
    │   └── chatbot-widget.html     # Jekyll/Hugo integration
    └── assets/
        └── chatbot-init.js
```

## **Mock Data Files**
```
mock-data/
├── organizations/
│   ├── acme-corp.json              # Sample organization config
│   ├── techshop.json
│   └── demo-org.json
├── responses/
│   ├── general-responses.json      # General conversational responses
│   ├── product-responses.json      # Product-specific responses
│   ├── error-responses.json        # Error scenario responses
│   └── contextual-responses.json   # Page-specific responses
└── sample-content/
    ├── company-info.json           # Sample company information
    ├── product-catalog.json        # Sample product data
    └── faq-content.json            # Sample FAQ content
```

## **Documentation Files**
```
documentation/
├── integration-guide.md           # Step-by-step integration instructions
├── configuration-reference.md     # Configuration options reference
├── troubleshooting.md             # Common issues and solutions
├── api-reference.md               # Mock API documentation
└── best-practices.md              # Integration best practices
```

## **Scripts Files**
```
scripts/
├── setup-mock-data.js             # Initialize mock data
├── build-examples.js              # Build example projects
└── validate-config.js             # Validate configuration files
```

## **Additional Development Files**
```
tests/
├── unit/
│   ├── widget.test.js              # Widget functionality tests
│   └── api.test.js                 # API endpoint tests
├── integration/
│   ├── server.test.js              # Server integration tests
│   └── examples.test.js            # Example integration tests
└── e2e/
    ├── widget-interactions.test.js # End-to-end widget tests
    └── mobile-responsive.test.js   # Mobile testing
```

## **Configuration Files**
```
config/
├── themes.json                     # Theme configurations
├── demo-sites.json                 # Demo site configurations
└── widget-defaults.json           # Default widget settings
```

## **Priority Order for Implementation:**
1. **Core server files**: `app.js`, basic EJS templates
2. **Widget JavaScript**: `chatbot-widget.js`
3. **Basic styling**: Theme CSS files
4. **Mock data**: Organization and response JSON files
5. **Integration examples**: Starting with vanilla HTML
6. **Documentation**: Integration guides and API reference
7. **Testing files**: Unit and integration tests

This represents approximately **40-50 files** total for a complete test harness implementation.