import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Hedera testnet configuration
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    public: { http: ['https://testnet.hashio.io/api'] },
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    etherscan: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
} as const

// Read Project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

// Ensure Project ID is defined at build time
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not defined. Please set it in .env.local')
}

export const config = createConfig({
  chains: [hederaTestnet, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [hederaTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}) 