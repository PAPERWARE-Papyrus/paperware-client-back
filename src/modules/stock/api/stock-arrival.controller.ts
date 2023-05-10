import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Api } from 'src/@shared';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockArrivalChangeService } from '../service/stock-arrival-change.service';
import { StockArrivalRetriveService } from '../service/stock-arrival-retrive.service';
import { StockArrivalListQueryDto } from './dto/stock-arrival.request';

@Controller('/stock-arrival')
export class StockArrivalController {
  constructor(
    private readonly change: StockArrivalChangeService,
    private readonly retrive: StockArrivalRetriveService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getStockArrivalList(
    @Request() req: AuthType,
    @Query() query: StockArrivalListQueryDto,
  ): Promise<Api.OrderStockArrivalListResponse> {
    const items = await this.retrive.getStockArrivalList({
      companyId: req.user.companyId,
      skip: query.skip,
      take: query.take,
    });

    const total = await this.retrive.getStockArrivalCount({
      companyId: req.user.companyId,
    });

    return { items, total };
  }

  @Post(':id/apply')
  @UseGuards(AuthGuard)
  async applyStockArrival(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<any> {
    // TODO: 권한 체크
    await this.change.applyStockArrival(id);
  }
}