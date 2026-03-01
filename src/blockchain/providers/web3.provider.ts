import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Web3 } from 'web3';

/**
 * web3.js v4 — the classic Ethereum JavaScript library.
 * Available alongside ethers.js and viem as an alternative EVM provider.
 *
 * Docs: https://web3js.org
 *
 * Usage example (in WalletService):
 *   const rawBalance = await this.web3.instance.eth.getBalance(address)
 *   // returns bigint in wei — convert with formatBalance(rawBalance, 18)
 *
 *   const txCount = await this.web3.instance.eth.getTransactionCount(address)
 *   const tx      = await this.web3.instance.eth.getTransaction(hash)
 */

const RPC_ENV: Record<string, string> = {
  ethereum: 'ETH_RPC_URL',
  bnb:      'BNB_RPC_URL',
  polygon:  'POLYGON_RPC_URL',
};

const DEFAULT_RPC: Record<string, string> = {
  ethereum: 'https://eth.llamarpc.com',
  bnb:      'https://bsc-dataseed.binance.org',
  polygon:  'https://polygon-rpc.com',
};

@Injectable()
export class Web3Provider implements OnModuleInit {
  private readonly logger = new Logger(Web3Provider.name);

  /** web3.js Web3 instance — available when the selected network is EVM. */
  instance: Web3;

  network: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.network = this.configService.get<string>('NETWORK', 'ethereum');

    if (!RPC_ENV[this.network]) {
      this.logger.log(`Web3 Provider: skipped (selected network is "${this.network}")`);
      return;
    }

    const rpcUrl =
      this.configService.get<string>(RPC_ENV[this.network]) ||
      DEFAULT_RPC[this.network];

    this.instance = new Web3(rpcUrl);
    this.logger.log(`Web3 Provider initialized: ${this.network} (${rpcUrl})`);
  }

  isAvailable(): boolean {
    return !!this.instance;
  }
}
