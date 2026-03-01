import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletListener } from './wallet.listener';
import { RedisModule } from '../redis/redis.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [RedisModule, BlockchainModule],
  controllers: [WalletController],
  providers: [WalletService, WalletListener],
})
export class WalletModule {}
