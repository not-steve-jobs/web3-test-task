import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WatchWalletDto } from './dto/watch-wallet.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@ApiTags('wallet')
@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Get native token balance for a wallet address' })
  @ApiParam({ name: 'address', description: 'EVM (0x...), Solana (base58), or TON address' })
  @ApiResponse({ status: 200, description: 'Balance returned (may be from cache)' })
  @ApiResponse({ status: 400, description: 'Invalid address' })
  @Get('wallet/:address/balance')
  getBalance(@Param('address') address: string) {
    return this.walletService.getBalance(address);
  }

  @ApiOperation({ summary: 'Get recent transactions for a wallet address' })
  @ApiParam({ name: 'address', description: 'EVM (0x...), Solana (base58), or TON address' })
  @ApiResponse({ status: 200, description: 'Transaction list returned (may be from cache)' })
  @Get('wallet/:address/transactions')
  getTransactions(
    @Param('address') address: string,
    @Query() query: GetTransactionsDto,
  ) {
    return this.walletService.getTransactions(address, Number(query.limit) || 10);
  }

  @ApiOperation({ summary: 'Get ERC-20 / SPL token balances (requires MORALIS_API_KEY)' })
  @ApiParam({ name: 'address', description: 'EVM (0x...) or Solana (base58) address' })
  @ApiResponse({ status: 200, description: 'Token balances returned' })
  @Get('wallet/:address/tokens')
  getTokenBalances(@Param('address') address: string) {
    return this.walletService.getTokenBalances(address);
  }

  @ApiOperation({ summary: 'Get NFTs owned by a wallet — EVM via Moralis, Solana via Metaplex' })
  @ApiParam({ name: 'address', description: 'EVM (0x...) or Solana (base58) address' })
  @ApiResponse({ status: 200, description: 'NFT list returned' })
  @Get('wallet/:address/nfts')
  getNfts(@Param('address') address: string) {
    return this.walletService.getNfts(address);
  }

  @ApiOperation({ summary: 'Add a wallet to the watchlist' })
  @ApiBody({ type: WatchWalletDto })
  @ApiResponse({ status: 201, description: 'Wallet added to watchlist' })
  @ApiResponse({ status: 400, description: 'Invalid address or validation failed' })
  @Post('wallets/watch')
  @HttpCode(HttpStatus.CREATED)
  watchWallet(@Body() dto: WatchWalletDto) {
    return this.walletService.watchWallet(dto);
  }

  @ApiOperation({ summary: 'Get all watched wallets with their current balances' })
  @ApiResponse({ status: 200, description: 'Watched wallets with balances' })
  @Get('wallets/watched')
  getWatchedWallets() {
    return this.walletService.getWatchedWallets();
  }

  @ApiOperation({ summary: 'Get balance change alerts for watched wallets' })
  @ApiResponse({ status: 200, description: 'Balance change alerts (newest first)' })
  @Get('wallets/alerts')
  getAlerts() {
    return this.walletService.getAlerts();
  }
}
