import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidEvmAddress, isValidSolanaAddress } from '../address.utils';

/**
 * Custom class-validator constraint that accepts both EVM (0x...) and Solana (base58) addresses.
 * Network-agnostic — works regardless of the NETWORK env variable.
 */
@ValidatorConstraint({ name: 'isWalletAddress', async: false })
export class IsWalletAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string): boolean {
    return isValidEvmAddress(address) || isValidSolanaAddress(address);
  }

  defaultMessage(): string {
    return 'Invalid wallet address — must be a valid EVM (0x...) or Solana (base58) address';
  }
}

/** Decorator that validates EVM and Solana wallet addresses */
export function IsWalletAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWalletAddressConstraint,
    });
  };
}
