import Decimal from 'decimal.js';

// Configure global Decimal precision
Decimal.set({ precision: 28, rounding: Decimal.ROUND_DOWN });

/**
 * Converts a raw blockchain balance to a human-readable decimal string.
 * Uses Decimal.js to avoid floating-point precision issues common with crypto amounts.
 *
 * @param raw      - raw value as BigInt or number (e.g. wei, lamports)
 * @param decimals - token decimal places (18 for EVM native tokens, 9 for SOL)
 * @param dp       - decimal places to display (default: 6)
 *
 * @example
 *   formatBalance(1000000000000000000n, 18) // "1.000000"  (1 ETH)
 *   formatBalance(1500000000, 9)            // "1.500000"  (1.5 SOL)
 */
export function formatBalance(
  raw: bigint | number | string,
  decimals: number,
  dp = 6,
): string {
  return new Decimal(raw.toString())
    .div(new Decimal(10).pow(decimals))
    .toFixed(dp);
}

/**
 * Returns true if `current` differs from `previous` by more than `threshold`.
 * Useful for detecting significant balance changes before emitting events.
 *
 * @example
 *   hasBalanceChanged('1.000000', '1.000001') // true  (any change)
 *   hasBalanceChanged('1.000000', '1.000001', '0.01') // false (below threshold)
 */
export function hasBalanceChanged(
  previous: string,
  current: string,
  threshold = '0',
): boolean {
  const diff = new Decimal(current).minus(new Decimal(previous)).abs();
  return diff.greaterThan(new Decimal(threshold));
}
