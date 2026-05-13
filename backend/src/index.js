const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow any origin for dev
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
