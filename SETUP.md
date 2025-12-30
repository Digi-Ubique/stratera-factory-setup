# Stratera Factory Setup - Technical Setup Guide

## Overview

This document provides step-by-step instructions for developers to set up and run the Stratera Factory Setup application locally.

## Technology Stack

- Next.js 15.2.4
- React 19
- TypeScript 5
- Tailwind CSS 3.4.17
- Radix UI components (via shadcn/ui)
- Recharts 2.15.0 for charts
- Framer Motion for animations
- Zod for validation
- React Hook Form

## Prerequisites

- Node.js (version 18 or higher recommended for Next.js 15)
- npm or pnpm
- Git

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Digi-Ubique/stratera-factory-setup.git
cd stratera-factory-setup
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_STRATERA_PLATFORM_API_URL=https://stratera-core-platform-api-dev.azurewebsites.net
STRATERA_PLATFORM_API_URL=https://stratera-core-platform-api-dev.azurewebsites.net
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Step 5: Build for Production

```bash
npm run build
```

### Step 6: Start Production Server

```bash
npm run start
```

### Step 7: Run Linting

```bash
npm run lint
```

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint

## Application Routes

- `/` - Redirects to `/factory`
- `/factory` - Main factory visualization page with dual view (tree/graph)
- `/masters/factory` - Factory masters management
- `/masters/supplier` - Supplier management

## Project Structure

```
stratera-factory-setup/
├── app/
│   ├── api/
│   │   ├── factory-node/
│   │   ├── factory-api/
│   │   └── factory-hierarchy/
│   ├── factory/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── masters/
│   │   ├── factory/
│   │   └── supplier/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   └── desktop-layout.tsx
│   ├── ui/           # shadcn/ui components
│   ├── footer.tsx
│   ├── theme-provider.tsx
│   └── toolbar.tsx
├── hooks/
├── lib/
├── services/
│   ├── api-service.ts
│   └── factory-service.ts
├── styles/
├── public/
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## API Endpoints (Internal)

- `GET /api/factory-hierarchy` - Fetch factory hierarchy data
- `GET /api/factory-node/[id]` - Fetch specific node details
- `PUT /api/factory-node/[id]` - Update node details
- `DELETE /api/factory-node/[id]/delete` - Delete a node

## Key Features

- **Tree View**: Hierarchical tree visualization of factory assets
- **Graph View**: Interactive graph visualization of factory assets and relationships
- **Dual View**: Switch between tree and graph visualizations
- **API View**: Advanced view with API data exploration capabilities

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Dependencies Not Installing

Try clearing npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Ensure you have the correct Node.js version:
```bash
node --version  # Should be 18 or higher
```

### TypeScript Errors

The project is configured to ignore TypeScript errors during build. If you need strict type checking:
1. Edit `next.config.mjs`
2. Set `typescript.ignoreBuildErrors` to `false`

## Support

For technical support, contact the Stratera development team.
