const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || (isProduction ? 100 : 1000);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow any origin for dev
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: rateLimitMax, // limit each IP to this many requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management System API' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/warehouse', require('./routes/warehouse'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/store', require('./routes/store'));
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/promotion', require('./routes/promotion'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
