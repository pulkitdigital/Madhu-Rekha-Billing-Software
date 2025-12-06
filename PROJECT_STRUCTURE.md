# Madhu Rekha Billing Software - Project Structure

## Overview
Madhu Rekha Billing Software is a full-stack billing management system built with React (frontend) and Node.js/Express (backend), using Prisma ORM and PostgreSQL for database management.

## Project Architecture

```
madhu-rekha-billing/
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── layout/       # Layout components (Sidebar, Topbar)
│   │   │   └── ui/           # UI components (Button, Card, Input)
│   │   ├── pages/            # Page components
│   │   │   ├── BillDetail.jsx
│   │   │   ├── BillsList.jsx
│   │   │   ├── CreateBill.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InvoicePrintPage.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── ReceiptPrintPage.jsx
│   │   ├── services/         # API service functions
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # Constants and configuration
│   │   ├── types/            # TypeScript type definitions
│   │   ├── lib/
│   │   │   └── api.js        # API client
│   │   ├── layout/           # Layout wrapper
│   │   ├── App.jsx           # Main App component
│   │   ├── main.jsx          # Entry point
│   │   ├── App.css           # Global styles
│   │   └── index.css         # Base styles
│   ├── public/               # Static assets
│   ├── package.json
│   ├── vite.config.js        # Vite configuration
│   ├── eslint.config.js      # ESLint configuration
│   └── index.html            # HTML template
│
├── Backend (Node.js + Express)
│   ├── madhurekha-billing-backend/
│   │   ├── src/
│   │   │   ├── routes/       # API route definitions
│   │   │   ├── controllers/  # Request handlers & business logic
│   │   │   ├── services/     # Database & business logic services
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── utils/        # Utility functions
│   │   │   └── constants/    # Constants & configuration
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema
│   │   │   └── migrations/   # Database migrations
│   │   ├── prisma-client/    # Generated Prisma client
│   │   ├── logs/             # Application logs
│   │   ├── uploads/          # File uploads directory
│   │   ├── server.js         # Main server file
│   │   ├── package.json
│   │   └── .env              # Environment variables
│   │
│   └── vercel.json           # Vercel deployment config
│
└── docs/                     # Documentation
```

## Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 7.9.6
- **State Management**: TanStack React Query 5.90.11
- **Linting**: ESLint 9.39.1

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.21.2
- **Database ORM**: Prisma 6.19.0
- **Database**: PostgreSQL (via Prisma)
- **PDF Generation**: PDFKit 0.17.2, Puppeteer 24.31.0
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.4.5
- **Development**: Nodemon 3.1.7

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Installation

#### Frontend Setup
```bash
cd madhu-rekha-billing-software
npm install
npm run dev
```

#### Backend Setup
```bash
cd madhu-rekha-billing-backend
npm install
npm run prisma:generate
npm run dev
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client

## Features

- **Bill Management**: Create, view, and manage bills
- **Patient Management**: Manage patient information
- **Invoice Generation**: Generate and print invoices
- **Receipt Management**: Create and print receipts
- **Service Tracking**: Manage services and charges
- **Payment Recording**: Track payment information
- **PDF Export**: Generate PDF reports and invoices

## Database Schema

The application uses Prisma ORM with the following main models:
- **Bill** - Billing records
- **BillItem** - Items/services within bills
- **Patient** - Patient information
- **Payment** - Payment records
- **Receipt** - Receipt information
- **Service** - Service definitions and pricing

## Directory Structure Guidelines

### Frontend (`src/`)
- **components/** - Reusable UI components
- **pages/** - Page-level components (routes)
- **hooks/** - Custom React hooks for logic reuse
- **services/** - API calls and external service integrations
- **utils/** - Helper functions
- **constants/** - App-wide constants
- **types/** - TypeScript type definitions
- **layout/** - Layout components for page structure
- **lib/** - Library configurations (API client, etc.)

### Backend (`src/`)
- **routes/** - Express route definitions
- **controllers/** - Request handlers and response logic
- **services/** - Business logic and database operations
- **middleware/** - Authentication, validation, error handling
- **utils/** - Helper functions
- **constants/** - App-wide constants

## Environment Variables

Create a `.env` file in the backend directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/madhu_rekha
NODE_ENV=development
PORT=5000
```

## Deployment

### Frontend
- Configured for Vercel deployment
- Run `npm run build` to generate production build
- Deploy `dist/` directory

### Backend
- Vercel configuration included in `vercel.json`
- Database migrations handled by Prisma

## Contributing

1. Create feature branches from `main`
2. Follow the existing code structure
3. Run linting before committing: `npm run lint`
4. Test changes locally before pushing

## License

Private - Madhu Rekha Billing Software

## Support

For issues or questions, contact the development team.
