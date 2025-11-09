const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Test database connection
db.testConnection();

// API Routes
app.use('/api', routes);

// Serve HTML pages

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // ✅ change here
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/create-shipment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create-shipment.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'MySQL'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📊 Dashboard → http://localhost:3000/dashboard`);
  console.log(`🔗 API Base URL → http://localhost:3000/api`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await db.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});