# Inventory Management System

A comprehensive enterprise-grade Inventory, Warehouse, Vendor, Store, Billing, and Order Management System built with the MERN stack.

## Features

### Core Modules
- **Authentication System** - JWT-based authentication with Role-Based Access Control (RBAC)
- **Dashboard** - Real-time analytics with interactive charts and KPIs
- **Inventory Management** - Complete product lifecycle management with stock tracking
- **Warehouse Management** - Multi-warehouse support with transfer capabilities
- **Vendor Management** - Supplier relationship management with performance tracking
- **Store Management** - Multi-store operations with individual settings
- **Billing & Transactions** - Comprehensive transaction management with invoicing
- **Analytics** - Advanced reporting and business intelligence

### Key Features
- **Multi-Role Support**: SUPER_ADMIN, STORE_ADMIN, VENDOR_ADMIN, TRANSACTION_ADMIN
- **Real-time Updates**: Live dashboard with animated charts
- **Modern UI**: Dark theme with glassmorphism effects and smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Advanced Search**: Full-text search across all modules
- **Low Stock Alerts**: Automated notifications for inventory management
- **Transfer Management**: Stock movement between warehouses and stores
- **Payment Processing**: Multiple payment methods with status tracking
- **Reporting**: Comprehensive analytics with export capabilities

## Tech Stack

### Frontend
- **React.js** - UI framework with Vite for fast development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management with Zod validation
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **bcrypt** - Password hashing
- **Role-Based Access Control** - Granular permission system
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security middleware
- **Rate Limiting** - API protection against abuse

### Deployment
- **Frontend**: Vercel (CDN + Edge functions)
- **Backend**: Render (Node.js hosting)
- **Database**: MongoDB Atlas (Cloud database)

## Project Structure

```
inventory-management-system/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   │   ├── layout/      # Layout components (Header, Sidebar)
│   │   │   ├── forms/       # Form components
│   │   │   └── charts/      # Chart components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript definitions
│   │   └── constants/       # Application constants
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vercel.json         # Vercel deployment config
│   └── .env.example        # Environment variables template
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── validators/      # Input validation schemas
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   ├── services/        # Business logic services
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   ├── render.yaml         # Render deployment config
│   └── .env.example        # Environment variables template
├── shared/                   # Shared utilities and types
├── docs/                     # Documentation
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=InventoryPro
VITE_APP_VERSION=1.0.0
```

## Database Schema

### Core Models
- **User** - Authentication and role management
- **Product** - Product catalog with pricing and inventory
- **Vendor** - Supplier information and relationships
- **Warehouse** - Storage facility management
- **Store** - Retail store operations
- **Inventory** - Stock levels and locations
- **Transaction** - All financial transactions
- **Invoice** - Billing and payment records

## User Roles & Permissions

### SUPER_ADMIN
- Full system access
- Manage all stores and warehouses
- Manage vendors and employees
- View global analytics
- Approve inter-location transfers

### STORE_ADMIN
- Manage store inventory
- Handle customer billing
- View store analytics
- Create promotions
- Manage store employees

### VENDOR_ADMIN
- Add and manage products
- Track shipments and supply
- View vendor sales analytics
- Manage vendor profile

### TRANSACTION_ADMIN
- Handle invoices and payments
- Manage stock movements
- Track order logs
- Process refunds and returns

## Development

### Available Scripts

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run ESLint
```

### API Documentation

The API follows RESTful conventions:

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### Inventory Endpoints
- `GET /api/inventory/products` - Get all products
- `GET /api/inventory/products/:id` - Get single product
- `POST /api/inventory/products` - Create product
- `PUT /api/inventory/products/:id` - Update product
- `DELETE /api/inventory/products/:id` - Delete product
- `PUT /api/inventory/inventory` - Update inventory levels

#### Warehouse Endpoints
- `GET /api/warehouse/` - Get all warehouses
- `GET /api/warehouse/:id` - Get single warehouse
- `POST /api/warehouse/` - Create warehouse
- `PUT /api/warehouse/:id` - Update warehouse
- `POST /api/warehouse/stock-in` - Add stock to warehouse
- `POST /api/warehouse/stock-out` - Remove stock from warehouse
- `POST /api/warehouse/transfer` - Transfer stock between warehouses

#### Vendor Endpoints
- `GET /api/vendor/` - Get all vendors
- `GET /api/vendor/:id` - Get single vendor
- `POST /api/vendor/` - Create vendor
- `PUT /api/vendor/:id` - Update vendor
- `GET /api/vendor/:id/analytics` - Get vendor analytics

#### Store Endpoints
- `GET /api/store/` - Get all stores
- `GET /api/store/:id` - Get single store
- `POST /api/store/` - Create store
- `PUT /api/store/:id` - Update store
- `POST /api/store/transfer` - Transfer stock to store
- `GET /api/store/:id/analytics` - Get store analytics

#### Transaction Endpoints
- `GET /api/transaction/` - Get all transactions
- `GET /api/transaction/:id` - Get single transaction
- `POST /api/transaction/sale` - Create sale
- `POST /api/transaction/purchase` - Create purchase
- `POST /api/transaction/return` - Create return
- `GET /api/transaction/analytics` - Get transaction analytics

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure environment variables and MongoDB connection
3. Deploy automatically on push to main branch

### Database (MongoDB Atlas)
1. Create a free MongoDB Atlas cluster
2. Configure network access (whitelist Render IP)
3. Create database user with appropriate permissions
4. Update environment variables with connection string

## Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Test Coverage
- Authentication flows
- CRUD operations for all modules
- Role-based access control
- Data validation and sanitization
- Error handling and edge cases

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact:
- Email: support@inventorypro.com
- Documentation: [docs.inventorypro.com](https://docs.inventorypro.com)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## Acknowledgments

- Built with modern web technologies
- Inspired by leading ERP systems
- Designed for scalability and performance
- Focused on user experience and accessibility
