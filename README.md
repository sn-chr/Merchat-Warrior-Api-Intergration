# Merchant Warrior API Integration (Next.js + Tailwind CSS)

**Merchant Warrior API Integration** is a Next.js-based frontend demo showcasing how to integrate with the Merchant Warrior payment API using modern React tooling and styling with Tailwind CSS.

## Overview

This project provides a practical example of a payment form implementation built using Next.js and styled with Tailwind CSS, designed to demonstrate Merchant Warrior API integration capabilities.

## Features

- Built with **Next.js** (React framework), **TypeScript**, and **Tailwind CSS**
- Demonstrates a **payment form** for processing transactions via Merchant Warrior
- Well-structured codebase:
  - `/components`: Reusable UI components
  - `/hooks`: Custom React hooks for logic abstraction
  - `/lib`: API interaction logic
  - `/app` or `/pages`: Page-level components (depending on project structure)
  - `/public` and `/styles`: Static assets and global CSS
- Responsive and modern UI design inspired by Tailwind CSS utility-first approach

## Getting Started

### Prerequisites

- Node.js (version 14 or newer recommended)
- A Merchant Warrior sandbox or test API credentials

### Installation

1. Clone the project:
   ```bash
   git clone https://github.com/sn-chr/Merchat-Warrior-Api-Intergration.git
   cd Merchat-Warrior-Api-Intergration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment — create a `.env.local` based on `.env.example` (if applicable):
   ```
   NEXT_PUBLIC_MERCHANT_WARRIOR_API_KEY=your_api_key_here
   NEXT_PUBLIC_MERCHANT_WARRIOR_OTHER_SECRET=...
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` in your browser to view the app.

## Project Structure

```
├── app/ or pages/           # Page-level components
├── components/              # Reusable UI components (e.g., PaymentForm, Inputs)
├── hooks/                   # Custom React hooks (e.g., for managing form state or API calls)
├── lib/                     # API utility functions and integration logic
├── public/                  # Public assets (logos, images, etc.)
├── styles/                  # Global and Tailwind CSS configurations
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Customizing / Extending

This project serves as a foundation for building payment-enabled applications. To enhance or extend:

- Swap in a different payment provider or multi-provider setup
- Add form error handling, validation logic, and UX feedback
- Implement server-side API routes for secure token management
- Expand with post-payment pages (e.g., success, receipt, error)
- Integrate backend services to log or persist transaction data

## Contributing

Contributions are warmly welcomed! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-enhancement`
3. Make your changes and commit with a clear message
4. Push your branch and open a Pull Request for review

## License

Distributed under the MIT License. Feel free to use, modify, and distribute as you see fit.
