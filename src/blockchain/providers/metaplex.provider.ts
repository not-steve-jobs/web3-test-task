import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';

/**
 * Metaplex — Solana NFT and token metadata SDK.
 * Available when NETWORK=solana.
 *
 * Docs: https://developers.metaplex.com
 *
 * Usage examples (in WalletService):
 *
 *   // Find all NFTs owned by a wallet
 *   const owner = new PublicKey(address)
 *   const nfts = await this.metaplex.sdk.nfts().findAllByOwner({ owner })
 *   // returns array of Metadata objects with name, symbol, uri, mint, etc.
 *
 *   // Load full NFT with off-chain metadata
 *   const nft = await this.metaplex.sdk.nfts().load({ metadata: nfts[0] })
 *   nft.name    // "My NFT"
 *   nft.symbol  // "NFT"
 *   nft.json    // off-chain JSON metadata (image, description, attributes)
 */
@Injectable()
export class MetaplexProvider implements OnModuleInit {
  private readonly logger = new Logger(MetaplexProvider.name);

  /** Metaplex instance — available when NETWORK=solana. */
  sdk: Metaplex;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<string>('NETWORK', 'ethereum');

    if (network !== 'solana') {
      this.logger.log(`Metaplex Provider: skipped (selected network is "${network}")`);
      return;
    }

    const rpcUrl = this.configService.get<string>(
      'SOLANA_RPC_URL',
      'https://api.mainnet-beta.solana.com',
    );

    const connection = new Connection(rpcUrl, 'confirmed');
    this.sdk = Metaplex.make(connection);

    this.logger.log('Metaplex Provider initialized');
  }

  isAvailable(): boolean {
    return !!this.sdk;
  }
}
