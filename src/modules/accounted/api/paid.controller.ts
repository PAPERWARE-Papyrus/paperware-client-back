import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { AccountedListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedChangeService } from '../service/accounted-change.service';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { CashRequest } from './dto/cash.request';
import { EtcRequest } from './dto/etc.request';
import { EtcResponse } from './dto/etc.response';
import { AccountedRequest } from './dto/accounted.request';
import { AccountedType } from '@prisma/client';

@Controller('/paid')
export class PaidController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly accountedChangeService: AccountedChangeService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getPaidList(
    @Request() req: AuthType,
    @Query() paidRequest: AccountedRequest
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(req.user.companyId, paidRequest);
  }

  @Get(':accountedId/cash/:accountedType')
  @UseGuards(AuthGuard)
  async getPaidByCash(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
    @Param('accountedType') accountedType: AccountedType,
  ): Promise<EtcResponse> {
    return await this.accountedRetriveService.getAccountedByCash(req.user.companyId, accountedId, accountedType);
  }

  @Post('/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(
    @Body() paidCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.createCash(paidCashRequest);
  }

  @Patch(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Param('accountedId') accountedId: number,
    @Body() paidCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateCash(accountedId, paidCashRequest);
  }

  @Delete(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteCash(accountedId);
  }

  @Get(':accountedId/etc/:accountedType')
  @UseGuards(AuthGuard)
  async getPaidByEtc(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
    @Param('accountedType') accountedType: AccountedType,
  ): Promise<EtcResponse> {
    return await this.accountedRetriveService.getAccountedByEtc(req.user.companyId, accountedId, accountedType);
  }

  @Post('/etc')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(
    @Body() paidEtcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.createEtc(paidEtcRequest);
  }

  @Patch(':accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedId') accountedId: number,
    @Body() paidEtcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateEtc(accountedId, paidEtcRequest);
  }

  @Delete(':accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteEtc(accountedId);
  }
}
