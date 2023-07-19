import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { ByEtcResponse } from '../api/dto/etc.response';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByEtcRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getByEtc(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<ByEtcResponse> {
    const accounted = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        companyId: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedDate: true,
        accountedSubject: true,
        accountedMethod: true,
        memo: true,
        byEtc: true,
      },
      where: {
        companyId,
        accountedType,
        id: accountedId,
        isDeleted: false,
        byEtc: {
          isDeleted: false,
        },
      },
    });

    const partner = await this.prisma.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId: accounted.companyId,
          companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        },
      },
    });

    return {
      companyId: accounted.companyId,
      companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
      accountedId: accounted.id,
      accountedType: accounted.accountedType,
      accountedDate: accounted.accountedDate.toISOString(),
      accountedSubject: accounted.accountedSubject,
      accountedMethod: accounted.accountedMethod,
      amount: accounted.byEtc.etcAmount,
      memo: accounted.memo,
      partnerNickName: partner.partnerNickName,
    };
  }
}
