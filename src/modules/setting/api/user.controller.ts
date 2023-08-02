import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SettingUserRetriveService } from '../service/user.retrive.service';
import { SettingUserChangeService } from '../service/user.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { SettingUserListDto } from './dto/user.request';
import { SettingUserListReseponse } from 'src/@shared/api/setting/user.response';

@Controller('/setting/user')
export class SettingUserController {
  constructor(
    private readonly retrive: SettingUserRetriveService,
    private readonly change: SettingUserChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: SettingUserListDto,
  ): Promise<SettingUserListReseponse> {
    return await this.retrive.getList(
      req.user.companyId,
      query.skip,
      query.take,
    );
  }
}