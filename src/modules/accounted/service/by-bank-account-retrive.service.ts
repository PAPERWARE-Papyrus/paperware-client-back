import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { ByBankAccountItemResponseDto } from '../api/dto/bank-account.response';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByBankAccountRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getByBankAccount(companyId: number, accountedType: AccountedType, accountedId: number): Promise<ByBankAccountItemResponseDto> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byBankAccount: {
            select: {
              id: true,
              bankAccountId: true,
              bankAccountAmount: true,
              bankAccount: {
                select: {
                  accountName: true,
                  accountNumber: true,
                  bankComapny: true,
                }
              }
            }
          },
          partner: {
            select: {
              id: true,
              partnerNickName: true,
              companyRegistrationNumber: true,
              company: {
                select: {
                  id: true,
                  companyRegistrationNumber: true,
                }
              }
            }
          }
        },
        where: {
          partner: {
            companyId,
          },
          accountedType,
          id: accountedId,
          isDeleted: false,
          byBankAccount: {
            isDeleted: false,
          }
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [accountedId])),
      map((accounted) => {
        return {
          companyId: accounted.partner.company.id,
          companyRegistrationNumber: accounted.partner.company.companyRegistrationNumber,
          accountedId: accounted.id,
          accountedType: accounted.accountedType,
          accountedDate: accounted.accountedDate.toISOString(),
          accountedSubject: accounted.accountedSubject,
          accountedMethod: accounted.accountedMethod,
          amount: accounted.byBankAccount.bankAccountAmount,
          memo: accounted.memo,
          partnerNickName: accounted.partner.partnerNickName,
          bankAccountId: accounted.byBankAccount.bankAccountId,
          accountName: accounted.byBankAccount.bankAccount.accountName,
          accountNumber: accounted.byBankAccount.bankAccount.accountNumber,
          bankComapny: accounted.byBankAccount.bankAccount.bankComapny,
        }
      }),
    ));
  }
}
