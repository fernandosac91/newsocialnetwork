# Next.js 14 Full-Stack Application

A modern full-stack Next.js 14 application with authentication, database, payments, real-time features, and file storage.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js with JWT strategy
- **Database**: PostgreSQL via Prisma ORM
- **Payment Processing**: Stripe (subscriptions and webhook handling)
- **Real-time**: Socket.IO (prepared for chat functionality)
- **File Storage**: AWS S3 
- **Deployment**: Ready for deployment to your preferred platform

## Project Structure

```
/src
├── app                 # Next.js App Router
│   ├── api             # API routes
│   └── ...             # Page routes
├── lib                 # Library code
│   ├── auth            # Authentication logic
│   ├── db              # Database client
│   ├── payment         # Payment processing
│   ├── realtime        # Real-time communication
│   ├── services        # Business logic services
│   ├── storage         # File storage logic
│   └── utils           # Utility functions
├── generated           # Generated Prisma client
└── middleware.ts       # Next.js middleware for route protection
/prisma
└── schema.prisma       # Prisma schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- AWS account (for S3 storage)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
JWT_SECRET=your-jwt-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRICE_ID=price_your_stripe_price_id

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-aws-bucket-name

# Socket.IO
SOCKET_PORT=3001
```

## Features

- **Authentication**: Email/password authentication with JWT tokens
- **Database**: Prisma ORM with PostgreSQL
- **Payments**: Stripe integration with subscription support and webhook handling
- **Real-time**: Socket.IO integration (ready for chat functionality)
- **File Storage**: AWS S3 integration for file uploads and downloads
- **Security**: Middleware to protect all routes

## Development

### Database Migrations

To create a new migration after changing the Prisma schema:

```bash
npx prisma migrate dev --name your-migration-name
```

### Running with Socket.IO

To run the application with Socket.IO support:

```bash
node server.js
```

## Production

For production deployment, build the application:

```bash
npm run build
```

Then start the production server:

```bash
node server.js
```

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin API

The application includes the following admin-specific API endpoints:

- `GET /api/admin/users` - List all users with optional filters
- `GET /api/admin/events` - List all events
- `GET /api/admin/circles` - List all circles
- `PATCH /api/admin/user/:id` - Update user role or status
- `DELETE /api/admin/event/:id` - Delete an event
- `DELETE /api/admin/circle/:id` - Delete a circle

All admin endpoints require authorization and actions are logged for audit purposes.

## Docker Setup

For Docker deployment instructions, see [DOCKER_README.md](DOCKER_README.md).
