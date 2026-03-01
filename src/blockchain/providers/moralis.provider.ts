import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'nest-moralis';

/**
 * Moralis — unified multi-chain API for tokens, NFTs, prices, and more.
 * Works for both EVM chains and Solana. Requires a free API key.
 *
 * Get a free API key: https://admin.moralis.io
 * Docs: https://docs.moralis.io
 *
 * EVM chain IDs for API calls:
 *   Ethereum → '0x1'    BNB Chain → '0x38'    Polygon → '0x89'
 *
 * Usage examples (in WalletService):
 *
 *   // EVM — ERC-20 token balances
 *   const response = await Moralis.EvmApi.token.getWalletTokenBalances({
 *     address,
 *     chain: this.moralis.evmChainId,
 *   })
 *   response.result // array of token balance objects
 *
 *   // EVM — NFTs owned by wallet
 *   const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
 *     address,
 *     chain: this.moralis.evmChainId,
 *   })
 *
 *   // Solana — SPL token balances
 *   const tokens = await Moralis.SolApi.account.getSPLs({ address, network: 'mainnet' })
 *
 *   // Solana — NFTs
 *   const nfts = await Moralis.SolApi.account.getNFTs({ address, network: 'mainnet' })
 */

const EVM_CHAIN_IDS: Record<string, string> = {
  ethereum: '0x1',
  bnb:      '0x38',
  polygon:  '0x89',
};

@Injectable()
export class MoralisProvider implements OnModuleInit {
  private readonly logger = new Logger(MoralisProvider.name);

  /** EVM chain ID string for the active network (e.g. '0x1') */
  evmChainId: string;

  /** Re-exported Moralis module for use in services */
  readonly sdk = Moralis;

  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('MORALIS_API_KEY', '');
    const network = this.configService.get<string>('NETWORK', 'ethereum');

    this.evmChainId = EVM_CHAIN_IDS[network] || '';

    await Moralis.start({ apiKey });
    if (!apiKey) {
      this.logger.warn(
        'Moralis Provider: MORALIS_API_KEY is not set — token/NFT endpoints will not work. ' +
        'Get a free key at https://admin.moralis.io',
      );
      return;
    }

    this.initialized = true;
    this.logger.log(`Moralis Provider initialized (network: ${network})`);
  }

  isAvailable(): boolean {
    return this.initialized;
  }
}
