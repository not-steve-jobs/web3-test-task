import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

export interface EvmNetworkConfig {
  rpcUrl: string;
  explorerApiUrl: string;
  explorerApiKeyEnv: string; // name of the env variable holding the API key
  symbol: string;
  decimals: number;
}

/**
 * Configurations for supported EVM networks.
 * Public free RPCs are used by default — no key required for basic operations.
 *
 * Transaction history is available via Explorer APIs (Etherscan / BscScan / Polygonscan).
 * Free API key: https://etherscan.io/apis (same for others)
 */
const NETWORK_CONFIGS: Record<string, EvmNetworkConfig> = {
  ethereum: {
    rpcUrl: 'https://eth.llamarpc.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    explorerApiKeyEnv: 'ETHERSCAN_API_KEY',
    symbol: 'ETH',
    decimals: 18,
  },
  bnb: {
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerApiUrl: 'https://api.bscscan.com/api',
    explorerApiKeyEnv: 'BSCSCAN_API_KEY',
    symbol: 'BNB',
    decimals: 18,
  },
  polygon: {
    rpcUrl: 'https://polygon-rpc.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    explorerApiKeyEnv: 'POLYGONSCAN_API_KEY',
    symbol: 'MATIC',
    decimals: 18,
  },
};

@Injectable()
export class EvmProvider implements OnModuleInit {
  private readonly logger = new Logger(EvmProvider.name);

  /** ethers.js JSON-RPC provider. Available when the selected network is EVM. */
  provider: ethers.JsonRpcProvider;

  /** Configuration for the active network */
  config: EvmNetworkConfig;

  /** Explorer API key (optional, required for transaction history) */
  explorerApiKey: string;

  network: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.network = this.configService.get<string>('NETWORK', 'ethereum');

    if (!this.isEvmNetwork()) {
      this.logger.log(`EVM Provider: skipped (selected network is "${this.network}")`);
      return;
    }

    this.config = NETWORK_CONFIGS[this.network];
    this.explorerApiKey = this.configService.get<string>(
      this.config.explorerApiKeyEnv,
      '',
    );

    const rpcUrl =
      this.configService.get<string>(`${this.network.toUpperCase()}_RPC_URL`) ||
      this.config.rpcUrl;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.logger.log(`EVM Provider initialized: ${this.network} (${rpcUrl})`);
  }

  isEvmNetwork(): boolean {
    return ['ethereum', 'bnb', 'polygon'].includes(
      this.configService.get<string>('NETWORK', 'ethereum'),
    );
  }
}
