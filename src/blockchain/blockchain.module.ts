import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvmProvider } from './providers/evm.provider';
import { SolanaProvider } from './providers/solana.provider';
import { Web3Provider } from './providers/web3.provider';
import { TonProvider } from './providers/ton.provider';
import { MoralisProvider } from './providers/moralis.provider';
import { MetaplexProvider } from './providers/metaplex.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    EvmProvider,
    SolanaProvider,
    Web3Provider,
    TonProvider,
    MoralisProvider,
    MetaplexProvider,
  ],
  exports: [
    EvmProvider,
    SolanaProvider,
    Web3Provider,
    TonProvider,
    MoralisProvider,
    MetaplexProvider,
  ],
})
export class BlockchainModule {}
