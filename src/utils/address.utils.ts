import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';

/** Returns true if the given string is a valid EVM address (0x...) */
export function isValidEvmAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/** Returns true if the given string is a valid Solana address (base58) */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
