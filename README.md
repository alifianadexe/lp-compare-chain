# Crypto Pair Comparison Dashboard

A Next.js-based dashboard for comparing cryptocurrency pair prices with monthly historical data.

## Features

- **Client-Side Rendering**: Uses React Hooks with TypeScript for dynamic data rendering
- **Responsive Design**: 3-column grid on desktop, single column on mobile
- **Price Cards**: Display current prices for SUI/HYPE, SOL/HYPE, and SOL/SUI pairs
- **Comparison Table**: Shows last month vs current prices with percentage changes
- **Conditional Styling**: Green/red indicators for positive/negative price changes
- **Clean UI**: White background with dark-themed cards

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React** - UI library with Hooks

## Getting Started

First, install dependencies (if not already installed):

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) with your browser to see the dashboard.

## Project Structure

```
app/
├── page.tsx          # Main dashboard component
├── layout.tsx        # Root layout
└── globals.css       # Global styles with Tailwind
```

## Data Structure

The dashboard uses mock data with the following TypeScript types:

```typescript
type PriceEntry = {
  lastMonth: number;
  current: number;
};

type PriceData = {
  [pair: string]: PriceEntry;
};
```

## Build for Production

```bash
npm run build
npm start
```

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
