import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountedType,
  Bank,
  EndorsementType,
  SecurityStatus,
  SecurityType,
  Subject,
} from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createByBankAccount(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
    bankAccountId: number;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const bankAccount = await tx.bankAccount.findFirst({
        where: {
          id: params.bankAccountId,
          companyId: params.companyId,
          isDeleted: false,
        },
      });
      if (bankAccount)
        throw new NotFoundException(`존재하지 않는 계좌 정보입니다.`);

      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          partnerCompanyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'ACCOUNT_TRANSFER',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byBankAccount: {
            create: {
              bankAccountAmount: params.amount,
              bankAccount: {
                connect: {
                  id: params.bankAccountId,
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
    });
  }

  async createBySecurity(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo?: string;
    endorsementType: EndorsementType; // 배서구분
    endorsement?: string; // 배서자
    securityId?: number; // 지급시 필수
    security?: {
      securityType: SecurityType;
      securitySerial: string;
      securityAmount: number;
      drawedDate?: string;
      drawedBank?: Bank;
      drawedBankBranch?: string;
      drawedRegion?: string;
      drawer?: string;
      maturedDate?: string;
      payingBank?: Bank;
      payingBankBranch?: string;
      payer?: string;
      memo?: string;
    }; // 수금시 필수
  }) {
    return await this.prisma.$transaction(async (tx) => {
      if (params.accountedType === AccountedType.PAID) {
        // 지급일때
        const [security]: {
          id: number;
          securityStatus: SecurityStatus;
        }[] = await tx.$queryRaw`
          SELECT *
            FROM Security 
           WHERE id = ${params.securityId}
             AND companyId = ${params.companyId}
             AND isDeleted = ${false}
  
           FOR UPDATE;
        `;
        if (!security)
          throw new BadRequestException(`존재하지 않는 유가증권 입니다.`);
        if (security.securityStatus !== 'NONE')
          throw new ConflictException(`사용할 수 없는 유가증권 입니다.`);

        const accounted = await tx.accounted.create({
          data: {
            company: {
              connect: {
                id: params.companyId,
              },
            },
            partnerCompanyRegistrationNumber: params.companyRegistrationNumber,
            accountedType: params.accountedType,
            accountedSubject: params.accountedSubject,
            accountedMethod: 'PROMISSORY_NOTE',
            accountedDate: params.accountedDate,
            memo: params.memo || '',
            bySecurity: {
              create: {
                securityId: params.securityId,
              },
            },
          },
          select: {
            id: true,
          },
        });

        return accounted;
      } else {
        return await tx.accounted.create({
          select: {
            id: true,
          },
          data: {
            company: {
              connect: {
                id: params.companyId,
              },
            },
            partnerCompanyRegistrationNumber: params.companyRegistrationNumber,
            accountedType: params.accountedType,
            accountedSubject: params.accountedSubject,
            accountedMethod: 'PROMISSORY_NOTE',
            accountedDate: params.accountedDate,
            memo: params.memo || '',
            bySecurity: {
              create: {
                endorsement: params.endorsement || '',
                endorsementType: params.endorsementType,
                security: {
                  create: {
                    securityType: params.security.securityType,
                    securitySerial: params.security.securitySerial,
                    securityAmount: params.security.securityAmount,
                    securityStatus: 'NONE',
                    drawedDate: params.security.drawedDate,
                    drawedBank: params.security.drawedBank,
                    drawedBankBranch: params.security.drawedBankBranch || '',
                    drawedRegion: params.security.drawedRegion || '',
                    drawer: params.security.drawer || '',
                    maturedDate: params.security.maturedDate,
                    payingBank: params.security.payingBank,
                    payingBankBranch: params.security.payingBankBranch || '',
                    payer: params.security.payer || '',
                    memo: params.memo || '',
                    company: {
                      connect: {
                        id: params.companyId,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    });
  }

  async createByCash(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          partnerCompanyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'ACCOUNT_TRANSFER',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byCash: {
            create: {
              cashAmount: params.amount,
            },
          },
        },
        select: {
          id: true,
        },
      });
    });
  }
}
