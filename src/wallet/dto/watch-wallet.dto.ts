import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsWalletAddress } from '../../utils/validators/is-wallet-address.validator';

export class WatchWalletDto {
  @ApiProperty({
    description: 'Wallet address (EVM: 0x... | Solana: base58)',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  @IsNotEmpty()
  @IsString()
  @IsWalletAddress()
  address: string;

  @ApiPropertyOptional({
    description: 'Optional human-readable label',
    example: 'Vitalik',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string;
}
