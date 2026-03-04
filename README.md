# ArtisanSpace 2.0

A comprehensive e-commerce platform that bridges creativity and commerce for handmade treasures. ArtisanSpace connects skilled artisans with customers who appreciate handmade craftsmanship, providing tools for showcasing, selling, and managing handmade products.

## 🚀 Features

### For Artisans

- **Customizable Storefront**: Upload high-quality photos and 3D models of your work
- **Product Management**: Manage inventory, pricing, and product details
- **Order Management**: Track and fulfill customer orders
- **Workshop Management**: Create and manage crafting workshops
- **Custom Requests**: Handle personalized customer requests
- **Analytics Dashboard**: Monitor sales and performance

### For Customers

- **Browse Artisanal Products**: Discover unique handmade items
- **3D Product Visualization**: View products in interactive 3D
- **Secure Payments**: Integrated Razorpay payment gateway
- **Order Tracking**: Real-time order status updates
- **Custom Orders**: Request personalized items from artisans
- **Community Engagement**: Connect with artisans and other customers

### For Administrators

- **User Management**: Manage artisans, customers, and delivery personnel
- **Content Moderation**: Review and approve product listings
- **Analytics & Reporting**: Comprehensive platform analytics
- **Support Ticket System**: Handle customer and artisan support requests
- **Payment Management**: Monitor transactions and payouts

### For Delivery Partners

- **Order Assignment**: Receive and manage delivery assignments
- **Route Optimization**: Efficient delivery routing
- **Status Updates**: Real-time order status tracking

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payments**: Razorpay
- **Email Service**: Nodemailer
- **Validation**: Zod
- **Logging**: Pino

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js & Recharts
- **3D Rendering**: Three.js
- **Routing**: React Router DOM
- **Forms**: React Hook Form

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rithvik086/ArtisanSpace2.0.git
cd ArtisanSpace2.0
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install root dependencies (concurrently for running both services)
npm install

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/artisanspace

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Email Service (Gmail example)
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (for payments)
RAZORPAY_API_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Optional: Skip DB connection for demo
SKIP_DB=false
```

### 4. Set up External Services

#### MongoDB

- **Local**: Install MongoDB and start the service
- **Cloud**: Use MongoDB Atlas and update `MONGO_URI` accordingly

#### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Update the `.env` file

#### Razorpay

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your API key and secret
3. Set up webhooks for payment confirmations

#### Email Service

- For Gmail: Enable 2FA and generate an App Password
- Update `MAIL_USER` and `MAIL_PASS` in `.env`

### 5. Build and Run

#### Development Mode

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

#### Production Build

```bash
# Build the project
npm run build

# Start production server
npm start
```

#### Individual Services

```bash
# Backend only
cd backend
npm run dev  # Development
npm run build && npm start  # Production

# Frontend only
cd frontend
npm run dev  # Development
npm run build && npm run preview  # Production
```

## 📁 Project Structure

```
ArtisanSpace2.0/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── admin/           # Admin dashboard
│   │   ├── artisan/         # Artisan dashboard
│   │   ├── components/      # Reusable components
│   │   ├── delivery/        # Delivery interface
│   │   ├── lib/             # Utilities and configs
│   │   ├── manager/         # Manager dashboard
│   │   ├── pages/           # Page components
│   │   ├── redux/           # State management
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── package.json              # Root package.json
└── README.md
```

## 🔐 User Roles & Permissions

- **Admin**: Full platform access, user management, content moderation
- **Manager**: Oversees artisans and operations
- **Artisan**: Product management, order fulfillment, workshop creation
- **Customer**: Browsing, purchasing, custom requests
- **Delivery**: Order delivery and status updates

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- CORS configuration
- Secure password hashing with bcrypt
- Environment variable validation

## 📊 API Documentation

The backend provides RESTful APIs under `/api/v1/` prefix:

- **Authentication**: `/api/v1/auth/*`
- **Products**: `/api/v1/products/*` (new `/bulk` POST endpoint allows bulk insertion via JSON array)
- **Users**: `/api/v1/users/*`
- **Orders**: `/api/v1/orders/*`
- **Payments**: `/api/v1/payments/*`
- **Admin**: `/api/v1/admin/*`
- **Delivery**: `/api/v1/delivery/*`

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Backend Deployment

- Use services like Heroku, Railway, or Vercel
- Ensure environment variables are set
- Database should be accessible from deployment environment

### Frontend Deployment

- Build the frontend: `npm run build --prefix frontend`
- Deploy to Netlify, Vercel, or any static hosting service
- Update `CORS_ORIGIN` and `FRONTEND_URL` in backend config

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
