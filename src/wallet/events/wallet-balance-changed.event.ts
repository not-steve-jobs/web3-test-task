/** Event name constant — use this when emitting and listening */
export const WALLET_BALANCE_CHANGED = 'wallet.balance.changed';

/** Payload emitted when a watched wallet's balance changes */
export class WalletBalanceChangedEvent {
  address: string;
  network: string;
  symbol: string;
  previousBalance: string;
  currentBalance: string;
  detectedAt: number; // unix timestamp in milliseconds
}
