import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  ByCardCreateRequestDto,
  ByCardUpdateRequestDto,
} from '../api/dto/card.request';

@Injectable()
export class ByCardChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(
    accountedType: AccountedType,
    byCardCreateRequest: ByCardCreateRequestDto,
  ): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            // TODO: company, partner 확인
            company: {
              connect: {
                id: byCardCreateRequest.companyId,
              },
            },
            partnerCompanyRegistrationNumber:
              byCardCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: byCardCreateRequest.accountedSubject,
            accountedMethod: byCardCreateRequest.accountedMethod,
            accountedDate: byCardCreateRequest.accountedDate,
            memo: byCardCreateRequest.memo,
            byCard: {
              create: {
                cardAmount: byCardCreateRequest.amount,
                isCharge: byCardCreateRequest.isCharge,
                chargeAmount: byCardCreateRequest.chargeAmount ?? 0,
                totalAmount: byCardCreateRequest.totalAmount ?? 0,
                approvalNumber: byCardCreateRequest.approvalNumber ?? '',
                card:
                  accountedType === 'PAID'
                    ? {
                        connect: {
                          id: byCardCreateRequest.cardId,
                        },
                      }
                    : undefined,
                bankAccount:
                  accountedType === 'COLLECTED'
                    ? {
                        connect: {
                          id: byCardCreateRequest.bankAccountId,
                        },
                      }
                    : undefined,
              },
            },
          },
        }),
      ),
    );
  }

  async updateCard(
    accountedType: AccountedType,
    accountedId: number,
    byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byCardUpdateRequest.accountedSubject,
            accountedMethod: byCardUpdateRequest.accountedMethod,
            accountedDate: byCardUpdateRequest.accountedDate,
            memo: byCardUpdateRequest.memo,
            byCard: {
              update: {
                cardAmount: byCardUpdateRequest.amount,
                isCharge: byCardUpdateRequest.isCharge,
                chargeAmount: byCardUpdateRequest.chargeAmount,
                approvalNumber: byCardUpdateRequest.approvalNumber,
              },
            },
          },
          where: {
            id: accountedId,
          },
        }),
      ),
    );
  }

  async deleteCard(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byCard: true,
      },
      where: {
        id: accountedId,
        accountedType,
      },
    });

    await lastValueFrom(
      from(
        this.prisma.byCard.update({
          data: {
            isDeleted: true,
            accounted: {
              update: {
                isDeleted: true,
              },
            },
          },
          include: {
            accounted: true,
          },
          where: {
            id: result.byCard.id,
          },
        }),
      ),
    );
  }
}
