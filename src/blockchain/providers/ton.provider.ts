import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TonClient } from '@ton/ton';
import { Address } from '@ton/core';

/**
 * TON blockchain provider using @ton/ton.
 * Activated when NETWORK=ton in .env
 *
 * Docs: https://ton.org/docs / https://github.com/ton-org/ton
 *
 * Usage example (in WalletService):
 *   const addr = Address.parse(address)
 *   const balance = await this.ton.client.getBalance(addr)
 *   // returns bigint in nanoTON (1 TON = 10^9 nanoTON)
 *   // convert with: formatBalance(balance, 9)
 *
 * Re-exported Address so callers don't need a separate import:
 *   const addr = this.ton.parseAddress(address)
 */
@Injectable()
export class TonProvider implements OnModuleInit {
  private readonly logger = new Logger(TonProvider.name);

  /** TonClient instance — available when NETWORK=ton. */
  client: TonClient;

  readonly symbol = 'TON';
  readonly decimals = 9; // 1 TON = 10^9 nanoTON

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<string>('NETWORK', 'ethereum');

    if (network !== 'ton') {
      this.logger.log(`TON Provider: skipped (selected network is "${network}")`);
      return;
    }

    const endpoint = this.configService.get<string>(
      'TON_RPC_URL',
      'https://toncenter.com/api/v2/jsonRPC',
    );
    const apiKey = this.configService.get<string>('TON_API_KEY', '');

    this.client = new TonClient({ endpoint, apiKey: apiKey || undefined });
    this.logger.log(`TON Provider initialized (${endpoint})`);
  }

  /** Parse a TON address string into an Address object */
  parseAddress(address: string): Address {
    return Address.parse(address);
  }

  isTonNetwork(): boolean {
    return this.configService.get<string>('NETWORK', 'ethereum') === 'ton';
  }
}
