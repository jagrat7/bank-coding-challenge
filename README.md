# Bank Statement Analysis Platform

## Overview
An AI-powered platform that analyzes bank statements to provide financial insights and visualizations. The system uses machine learning to process PDF bank statements, extract key financial data, and generate actionable business insights.

## Features
- 📊 **Automated Statement Processing**: Upload bank statements in PDF format for instant analysis
- 💡 **AI-Powered Insights**: Get intelligent insights about spending patterns and financial health
- 📈 **Interactive Visualizations**: View your financial data through intuitive charts and graphs
- 🔒 **Secure Authentication**: Protected access to your financial information
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- **[Next.js](https://nextjs.org)**: React framework for production-grade applications
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework for modern designs
- **[shadcn/ui](https://ui.shadcn.com/)**: High-quality, accessible UI components

### Backend
- **[NextAuth.js](https://next-auth.js.org)**: Authentication solution for Next.js applications
- **[Drizzle ORM](https://orm.drizzle.team)**: TypeScript ORM for better type safety and performance

### AI/ML
- **[OpenRouter](https://openrouter.ai/)**: Advanced language models for financial analysis
- **[Vercel AI SDK](https://vercel.ai)**: AI/ML integration utilities

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/bank-statement-analysis.git
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
# Fill in your environment variables
```

4. Run the development server
```bash
bun dev
```

## Environment Variables

Required environment variables:
- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `OPENROUTER_API_KEY`: API key for OpenRouter AI services
- `AUTH_DISCORD_ID`: Discord application client ID
- `AUTH_DISCORD_SECRET`: Discord application client secret

