# Torch Frontend

A modern Next.js frontend for the Torch cryptocurrency prediction market platform, built with Tailwind CSS, Radix UI, and viem for wallet integration.

## Features

- 🎨 **Dark/Light Theme Support** - Toggle between themes with system preference detection
- 💰 **Wallet Integration** - Connect with MetaMask, WalletConnect, and other wallets via viem
- 📊 **Interactive KDE Charts** - Kernel Density Estimation visualization with confidence hover states
- 🎯 **Price Range Selection** - Interactive histogram for bet distribution visualization
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- ⚡ **Modern Stack** - Next.js 14, TypeScript, and modern React patterns
- 🎭 **Accessible UI** - Built with Radix UI primitives for accessibility

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Wallet Integration**: viem + wagmi
- **Charts**: Recharts for data visualization
- **Theme**: next-themes for dark/light mode
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── header.tsx        # Main header with navigation
│   ├── prediction-card.tsx # Main prediction interface
│   ├── kde-chart.tsx     # Interactive KDE visualization
│   ├── price-range-selector.tsx # Price range selection
│   ├── bet-history.tsx   # Bet history table
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-toggle.tsx  # Theme toggle component
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # Common utility functions
│   └── wagmi.ts          # Wallet configuration
└── types/                # TypeScript type definitions
```

## Key Components

### PredictionCard

The main interface component that contains:

- Bet placement interface
- Interactive price range selector
- KDE forecast visualization
- Bet history table

### KDEChart

Interactive Kernel Density Estimation chart that:

- Shows price forecasts over time
- Displays confidence percentages on hover
- Uses Recharts for smooth animations

### PriceRangeSelector

Interactive histogram component that:

- Visualizes bet distribution
- Allows range selection with visual feedback
- Shows current price indicator

### Header

Navigation header with:

- Torch branding
- Wallet connection status
- Theme toggle
- HBAR balance display

## Wallet Integration

The app uses viem and wagmi for wallet integration:

- **Supported Wallets**: MetaMask, WalletConnect, Injected wallets
- **Networks**: Hedera Testnet (primary), Ethereum Mainnet, Sepolia
- **Features**: Balance display, address formatting, disconnect functionality

## Styling

The app uses a custom design system built on Tailwind CSS:

- **Colors**: Custom torch color palette (purple, green, red, orange, blue)
- **Themes**: Dark and light mode with CSS variables
- **Components**: Consistent design tokens and spacing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Torch Origins Hackathon.
