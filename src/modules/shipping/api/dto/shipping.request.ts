import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import {
  ShippingCreateRequest,
  ShippingListQuery,
} from 'src/@shared/api/shipping/shipping.request';

export class ShippingListQueryDto implements ShippingListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly take: number = undefined;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly invoiceStatus: string | null = null;
}

export class ShippingCreateRequestDto implements ShippingCreateRequest {}

export class ShippingConnectInvoicesRequestDto {
  @IsInt({ each: true })
  @Type(() => Number)
  readonly invoiceIds: number[];
}
