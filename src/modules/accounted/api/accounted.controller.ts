import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType, Method, Subject } from '@prisma/client';
import {
  AccountedListResponse,
  AccountedUnpaidListResponse,
} from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import {
  AccountedByBankAccountCreatedDto,
  AccountedByCardCreatedDto,
  AccountedByCashCreatedDto,
  AccountedByOffsetCreatedDto,
  AccountedBySecurityCreatedDto,
  AccountedListDto,
  AccountedUnpaidListDto,
} from './dto/accounted.request';
import { Util } from 'src/common';
import { AccountedChangeService } from '../service/accounted-change.service';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly change: AccountedChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() dto: AccountedListDto,
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getList({
      companyId: req.user.companyId,
      ...dto,
      companyRegistrationNumbers: Util.searchKeywordsToStringArray(
        dto.companyRegistrationNumbers,
      ),
      accountedSubjects: Util.searchKeywordsToStringArray(
        dto.accountedSubjects,
      ) as Subject[],
      accountedMethods: Util.searchKeywordsToStringArray(
        dto.accountedMethods,
      ) as Method[],
    });
  }

  /** 계좌이체 등록 */
  @Post('/bank-account')
  @UseGuards(AuthGuard)
  async createByBankAccount(
    @Request() req: AuthType,
    @Body() dto: AccountedByBankAccountCreatedDto,
  ) {
    return await this.change.createByBankAccount({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 유가증권 등록 */
  @Post('/security')
  @UseGuards(AuthGuard)
  async createBySecurity(
    @Request() req: AuthType,
    @Body() dto: AccountedBySecurityCreatedDto,
  ) {
    dto.validate();
    return await this.change.createBySecurity({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 현금 등록 */
  @Post('/cash')
  @UseGuards(AuthGuard)
  async createByCash(
    @Request() req: AuthType,
    @Body() dto: AccountedByCashCreatedDto,
  ) {
    return await this.change.createByCash({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 카드입금 등록 */
  @Post('/card')
  @UseGuards(AuthGuard)
  async createByCard(
    @Request() req: AuthType,
    @Body() dto: AccountedByCardCreatedDto,
  ) {
    dto.validate();
    return await this.change.createByCard({
      companyId: req.user.companyId,
      ...dto,
      vatPrice: dto.vatPrice || 0,
    });
  }

  /** 상계 등록 */
  @Post('/offset')
  @UseGuards(AuthGuard)
  async createByOffset(
    @Request() req: AuthType,
    @Body() dto: AccountedByOffsetCreatedDto,
  ) {
    return await this.change.createByOffset({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 기타 등록 */
  @Post('/etc')
  @UseGuards(AuthGuard)
  async createByEtc(
    @Request() req: AuthType,
    @Body() dto: AccountedByCashCreatedDto,
  ) {
    return await this.change.createByCash({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 미수금/미지급 목록 */
  @Get('/unpaid')
  @UseGuards(AuthGuard)
  async getUnpaidList(
    @Request() req: AuthType,
    @Query() dto: AccountedUnpaidListDto,
  ): Promise<AccountedUnpaidListResponse> {
    return await this.accountedRetriveService.getUnpaidList({
      companyId: req.user.companyId,
      ...dto,
      companyRegistrationNumbers: Util.searchKeywordsToStringArray(
        dto.companyRegistrationNumbers,
      ),
    });
  }
}
