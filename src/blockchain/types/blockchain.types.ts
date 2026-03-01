export interface WalletBalance {
  address: string;
  balance: string;  // native token amount, e.g. "1.523456"
  symbol: string;   // "ETH" | "BNB" | "MATIC" | "SOL" | "TON"
  network: string;
  cached: boolean;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;     // native token amount
  timestamp: number; // unix timestamp in seconds
  status?: 'success' | 'failed' | 'pending';
}

export interface TransactionList {
  address: string;
  transactions: Transaction[];
  network: string;
  cached: boolean;
}

export interface WatchedWallet {
  address: string;
  label?: string;
  addedAt: number; // unix timestamp
}

export interface WatchedWalletWithBalance extends WatchedWallet {
  balance: string;
  symbol: string;
}

export interface BalanceAlert {
  address: string;
  network: string;
  previousBalance: string;
  currentBalance: string;
  symbol: string;
  detectedAt: number; // unix timestamp in milliseconds
}

/** ERC-20 / SPL token balance */
export interface TokenBalance {
  contractAddress: string; // EVM: 0x... | Solana: mint address
  name: string;
  symbol: string;
  balance: string;         // human-readable amount
  decimals: number;
  network: string;
}

/** NFT item (EVM or Solana) */
export interface NftItem {
  contractAddress?: string; // EVM: NFT contract address
  mint?: string;            // Solana: mint address
  tokenId?: string;         // EVM: token ID
  name: string;
  symbol: string;
  network: string;
}
