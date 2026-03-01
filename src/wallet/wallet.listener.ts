import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '../redis/redis.service';
import {
  WALLET_BALANCE_CHANGED,
  WalletBalanceChangedEvent,
} from './events/wallet-balance-changed.event';

const ALERTS_KEY = 'wallet:alerts';
const MAX_ALERTS = 50;

@Injectable()
export class WalletListener {
  private readonly logger = new Logger(WalletListener.name);

  constructor(private readonly redis: RedisService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // TODO: Persist the balance change event as an alert in Redis
  //
  // Steps:
  //   1. Log the event (this.logger.log or warn)
  //   2. Serialize event: const payload = JSON.stringify(event)
  //   3. Prepend to alerts list:
  //        await this.redis.lpush(ALERTS_KEY, payload)
  //   4. Keep list bounded:
  //        await this.redis.ltrim(ALERTS_KEY, 0, MAX_ALERTS - 1)
  //
  // Note: lpush and ltrim methods are already available in RedisService
  // ─────────────────────────────────────────────────────────────────────────
  @OnEvent(WALLET_BALANCE_CHANGED)
  async handleBalanceChanged(event: WalletBalanceChangedEvent): Promise<void> {
    throw new Error('Not implemented');
  }
}
