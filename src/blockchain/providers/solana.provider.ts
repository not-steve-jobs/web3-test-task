import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';

@Injectable()
export class SolanaProvider implements OnModuleInit {
  private readonly logger = new Logger(SolanaProvider.name);

  /** @solana/web3.js Connection. Available when NETWORK=solana. */
  connection: Connection;

  readonly symbol = 'SOL';
  readonly decimals = 9; // 1 SOL = 10^9 lamports

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<string>('NETWORK', 'ethereum');

    if (network !== 'solana') {
      this.logger.log(`Solana Provider: skipped (selected network is "${network}")`);
      return;
    }

    const rpcUrl = this.configService.get<string>(
      'SOLANA_RPC_URL',
      'https://api.mainnet-beta.solana.com',
    );

    this.connection = new Connection(rpcUrl, 'confirmed');
    this.logger.log(`Solana Provider initialized (${rpcUrl})`);
  }

  isSolanaNetwork(): boolean {
    return this.configService.get<string>('NETWORK', 'ethereum') === 'solana';
  }
}
