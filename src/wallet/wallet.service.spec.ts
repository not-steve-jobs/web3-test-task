import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RedisService } from '../redis/redis.service';
import { EvmProvider } from '../blockchain/providers/evm.provider';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {SolanaProvider} from "../blockchain/providers/solana.provider";
import {Web3Provider} from "../blockchain/providers/web3.provider";
import {TonProvider} from "../blockchain/providers/ton.provider";
import {MoralisProvider} from "../blockchain/providers/moralis.provider";
import {MetaplexProvider} from "../blockchain/providers/metaplex.provider";

describe('WalletService - getBalance', () => {
	let service: WalletService;
	let redis: jest.Mocked<RedisService>;
	let evm: jest.Mocked<EvmProvider>;

	const mockAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WalletService,
				{
					provide: RedisService,
					useValue: {
						get: jest.fn(),
						set: jest.fn(),
					},
				},
				{
					provide: EvmProvider,
					useValue: {
						provider: {
							getBalance: jest.fn(),
						},
						config: {
							symbol: 'ETH',
							decimals: 18,
						},
					},
				},
				{ provide: SolanaProvider, useValue: {} },
				{ provide: Web3Provider, useValue: {} },
				{ provide: TonProvider, useValue: {} },
				{ provide: MoralisProvider, useValue: {} },
				{ provide: MetaplexProvider, useValue: {} },
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('ethereum'),
					},
				},
				{
					provide: EventEmitter2,
					useValue: { emit: jest.fn() },
				},
			],
		}).compile();

		service = module.get(WalletService);
		redis = module.get(RedisService);
		evm = module.get(EvmProvider);
	});

	it('should return cached balance', async () => {
		redis.get.mockResolvedValue(
			JSON.stringify({
				address: mockAddress,
				balance: '1.0',
				symbol: 'ETH',
				network: 'ethereum',
			}),
		);

		const result = await service.getBalance(mockAddress);

		expect(result.cached).toBe(true);
		expect(redis.get).toHaveBeenCalled();
	});

	it('should fetch and cache balance when not cached', async () => {
		redis.get.mockResolvedValue(null);
		(evm.provider.getBalance as jest.Mock).mockResolvedValue(
			1000000000000000000n,
		);

		const result = await service.getBalance(mockAddress);

		expect(Number(result.balance)).toBe(1);
		expect(result.cached).toBe(false);
		expect(redis.set).toHaveBeenCalled();
	});

	it('should throw on invalid address', async () => {
		await expect(
			service.getBalance('invalid'),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw on unsupported network', async () => {
		(service as any).network = 'unknown';

		await expect(
			service.getBalance(mockAddress),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw RPC timeout', async () => {
		redis.get.mockResolvedValue(null);

		(evm.provider.getBalance as jest.Mock).mockRejectedValue(
			new Error('RPC timeout'),
		);

		await expect(service.getBalance(mockAddress)).rejects.toThrow(InternalServerErrorException);
	});
});