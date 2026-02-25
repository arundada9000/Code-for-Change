# Code for Change Nepal - Backend

Enterprise-level backend API for [codeforchangenepal.com](https://codeforchangenepal.com/) built with Express, TypeScript, MongoDB, Redis, and Cloudinary.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with domain-driven design
- **TypeScript**: Full type safety across the codebase
- **Security**: Helmet, CORS, rate limiting, HPP, mongo sanitization
- **Caching**: Redis integration for high-performance data retrieval
- **File Upload**: Cloudinary integration with Multer for image management
- **Error Handling**: Global error handler with custom AppError class
- **Validation**: Zod for environment variables, Mongoose for data validation

## 📁 Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Entry point
├── loaders/
│   └── database.ts           # Database connection loader
├── modules/
│   ├── events/               # Events module
│   │   ├── event.interface.ts
│   │   ├── event.model.ts
│   │   ├── event.service.ts
│   │   ├── event.controller.ts
│   │   └── event.route.ts
│   ├── blogs/                # Blogs module
│   │   ├── blog.interface.ts
│   │   ├── blog.model.ts
│   │   ├── blog.service.ts
│   │   ├── blog.controller.ts
│   │   └── blog.route.ts
│   └── [other modules...]
└── shared/
    ├── configs/              # Configuration files
    │   ├── env.ts
    │   ├── redis.ts
    │   └── cloudinary.ts
    ├── middlewares/          # Global middlewares
    │   └── multer.ts
    ├── utils/                # Utility functions
    │   ├── response.ts
    │   ├── errorHandler.ts
    │   └── cloudinary.ts
    ├── types/                # TypeScript types
    └── constants/            # Constants
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis (ioredis)
- **File Storage**: Cloudinary
- **Validation**: Zod, Joi
- **Security**: Helmet, CORS, HPP, express-mongo-sanitize

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/codeforchange
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=https://codeforchangenepal.com
```

## 🚀 Running the Application

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📡 API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (with image upload)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create blog (with image upload)
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

## 🏗️ Architecture Patterns

### Module Structure
Each module follows a consistent pattern:
1. **Interface**: TypeScript interfaces for type safety
2. **Model**: Mongoose schema with validation
3. **Service**: Business logic with Redis caching
4. **Controller**: Request handling with error management
5. **Routes**: API endpoint definitions

### Reusable Components
- **Error Handler**: `asyncHandler` wrapper and `AppError` class
- **Response Utility**: Standardized success/error responses
- **Cloudinary Utility**: Upload, delete, and URL parsing functions
- **Multer Middleware**: File upload handling with validation

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per hour per IP
- **HPP**: HTTP parameter pollution prevention
- **Mongo Sanitize**: NoSQL injection prevention
- **File Validation**: Type and size restrictions

## 📝 License

MIT
