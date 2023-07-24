import { Injectable } from '@nestjs/common';
import {
  AccountedType,
  Method,
  OrderStatus,
  Partner,
  Prisma,
} from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { AccountedRequest } from '../api/dto/accounted.request';

export interface Price {
  partnerCompanyRegistrationNumber: string;
  totalPrice: number;
  price1: number;
  price2: number;
  price3: number;
  price4: number;
  price5: number;
  price6: number;
  price7: number;
}

@Injectable()
export class AccountedRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccountedList(
    companyId: number,
    accountedType: AccountedType,
    paidRequest: AccountedRequest,
  ): Promise<AccountedListResponse> {
    const {
      companyId: conditionCompanyId,
      companyRegistrationNumber,
      accountedSubject,
      accountedMethod,
      accountedFromDate,
      accountedToDate,
    } = paidRequest;
    const param: any = {
      accountedType,
      isDeleted: false,
    };

    if (accountedSubject !== 'All') {
      param.accountedSubject = {
        equals: accountedSubject,
      };
    }

    if (accountedMethod !== 'All') {
      param.accountedMethod = {
        equals: accountedMethod,
      };
    }

    if (accountedFromDate !== '' && accountedToDate !== '') {
      param.accountedDate = {
        gte: new Date(accountedFromDate),
        lte: new Date(accountedToDate),
      };
    }

    const accountedList = await this.prisma.accounted.findMany({
      select: {
        id: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedSubject: true,
        accountedMethod: true,
        accountedDate: true,
        memo: true,
        byCash: true,
        byEtc: true,
        byBankAccount: {
          select: {
            bankAccountAmount: true,
            bankAccount: {
              select: {
                accountName: true,
              },
            },
          },
        },
        byCard: {
          select: {
            isCharge: true,
            cardAmount: true,
            chargeAmount: true,
            totalAmount: true,
            card: {
              select: {
                cardName: true,
              },
            },
            bankAccount: {
              select: {
                accountName: true,
              },
            },
          },
        },
        byOffset: true,
        bySecurity: {
          select: {
            security: {
              select: {
                securityAmount: true,
                securityStatus: true,
                securitySerial: true,
              },
            },
          },
        },
      },
      where: {
        companyId,
        companyRegistrationNumber: companyRegistrationNumber
          ? companyRegistrationNumber
          : undefined,
        ...param,
      },
    });

    const partners = await this.prisma.partner.findMany({
      where: {
        companyId,
      },
    });
    const partnerMap = new Map<string, Partner>();
    for (const partner of partners) {
      partnerMap.set(partner.companyRegistrationNumber, partner);
    }

    const items = accountedList.map((accounted) => {
      const getAmount = (method): number => {
        switch (method) {
          case Method.CASH:
            return accounted.byCash.cashAmount;
          case Method.PROMISSORY_NOTE:
            return accounted.bySecurity.security.securityAmount;
          case Method.ETC:
            return accounted.byEtc.etcAmount;
          case Method.ACCOUNT_TRANSFER:
            return accounted.byBankAccount.bankAccountAmount;
          case Method.CARD_PAYMENT:
            return accounted.byCard.isCharge
              ? accounted.byCard.totalAmount
              : accounted.byCard.cardAmount;
          case Method.OFFSET:
            return accounted.byOffset.offsetAmount;
        }
      };

      const getGubun = (method): string => {
        switch (method) {
          case Method.CASH:
            return '';
          case Method.PROMISSORY_NOTE:
            return accounted.bySecurity.security.securitySerial;
          case Method.ETC:
            return '';
          case Method.ACCOUNT_TRANSFER:
            return accounted.byBankAccount.bankAccount.accountName;
          case Method.CARD_PAYMENT:
            return accounted.byCard.card
              ? accounted.byCard.card.cardName
              : accounted.byCard.bankAccount.accountName;
          case Method.OFFSET:
            return '';
        }
      };

      return {
        companyId,
        companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        partnerNickName:
          partnerMap.get(accounted.partnerCompanyRegistrationNumber)
            ?.partnerNickName || '',
        accountedId: accounted.id,
        accountedType: accounted.accountedType,
        accountedDate: accounted.accountedDate.toISOString(),
        accountedMethod: accounted.accountedMethod,
        accountedSubject: accounted.accountedSubject,
        amount: getAmount(accounted.accountedMethod),
        memo: accounted.memo,
        gubun: getGubun(accounted.accountedMethod),
        securityStatus:
          accounted.accountedMethod === Method.PROMISSORY_NOTE
            ? accounted.bySecurity.security.securityStatus
            : undefined,
      };
    });

    return {
      items,
      total: items.length,
    };
  }

  async getUnpaidList(params: {
    companyId: number;
    skip: number;
    take: number;
    accountedType: AccountedType;
    companyRegistrationNumbers: string[];
    minAmount: number | null;
    maxAmount: number | null;
  }) {
    const {
      companyId,
      skip,
      take,
      accountedType,
      companyRegistrationNumbers,
      minAmount,
      maxAmount,
    } = params;

    const partners = await this.prisma.partner.findMany({
      where: {
        companyId,
        companyRegistrationNumber:
          companyRegistrationNumbers.length > 0
            ? {
                in: companyRegistrationNumbers,
              }
            : undefined,
      },
      orderBy: {
        id: 'asc',
      },
      skip,
      take,
    });
    console.log(partners);

    const typeQuery =
      accountedType === 'PAID'
        ? Prisma.sql`o.srcCompanyId = ${companyId}`
        : Prisma.sql`o.dstCompanyId = ${companyId}`;

    const partnerSelectQuery =
      accountedType === 'PAID'
        ? Prisma.sql`dstCompany.companyRegistrationNumber AS partnerCompanyRegistrationNumber`
        : Prisma.sql`srcCompany.companyRegistrationNumber AS partnerCompanyRegistrationNumber`;

    const groupByQuery =
      accountedType === 'PAID'
        ? Prisma.sql`dstCompany.companyRegistrationNumber`
        : Prisma.sql`srcCompany.companyRegistrationNumber`;

    const partnerQuery =
      accountedType === 'PAID'
        ? Prisma.sql`dstCompany.companyRegistrationNumber IN (${Prisma.join(
            partners.map((p) => p.companyRegistrationNumber),
          )})`
        : Prisma.sql`srcCompany.companyRegistrationNumber IN (${Prisma.join(
            partners.map((p) => p.companyRegistrationNumber),
          )})`;

    // 날짜(DB 시간 기준)
    const now: any[] = await this.prisma.$queryRaw`
      SELECT YEAR(CONVERT_TZ(DATE_ADD(NOW(), INTERVAL 1 MONTH), '+00:00', '+09:00')) AS year1
            , MONTH(CONVERT_TZ(DATE_ADD(NOW(), INTERVAL 1 MONTH), '+00:00', '+09:00')) AS month1
            , YEAR(CONVERT_TZ(NOW(), '+00:00', '+09:00')) AS year2
            , MONTH(CONVERT_TZ(NOW(), '+00:00', '+09:00')) AS month2
            , YEAR(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 1 MONTH), '+00:00', '+09:00')) AS year3
            , MONTH(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 1 MONTH), '+00:00', '+09:00')) AS month3
            , YEAR(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 2 MONTH), '+00:00', '+09:00')) AS year4
            , MONTH(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 2 MONTH), '+00:00', '+09:00')) AS month4
            , YEAR(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 3 MONTH), '+00:00', '+09:00')) AS year5
            , MONTH(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 3 MONTH), '+00:00', '+09:00')) AS month5
            , YEAR(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 4 MONTH), '+00:00', '+09:00')) AS year6
            , MONTH(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 4 MONTH), '+00:00', '+09:00')) AS month6
            , YEAR(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 5 MONTH), '+00:00', '+09:00')) AS year7
            , MONTH(CONVERT_TZ(DATE_SUB(NOW(), INTERVAL 5 MONTH), '+00:00', '+09:00')) AS month7
    `;
    const year1 = Number(now[0].year1);
    const month1 = Number(now[0].month1);
    const year2 = Number(now[0].year2);
    const month2 = Number(now[0].month2);
    const year3 = Number(now[0].year3);
    const month3 = Number(now[0].month3);
    const year4 = Number(now[0].year4);
    const month4 = Number(now[0].month4);
    const year5 = Number(now[0].year5);
    const month5 = Number(now[0].month5);
    const year6 = Number(now[0].year6);
    const month6 = Number(now[0].month6);
    const year7 = Number(now[0].year7);
    const month7 = Number(now[0].month7);

    // 거래금액
    const prices: Price[] = await this.prisma.$queryRaw`
      SELECT ${partnerSelectQuery}
            , IFNULL(SUM(tp.suppliedPrice + tp.vatPrice), 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year1} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month1} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month2} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month3} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month4} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month5} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month6} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
                AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) <= ${`${year7}-${month7}`} THEN tp.suppliedPrice + tp.vatPrice END), 0) AS price7

        FROM \`Order\`      AS o
        JOIN TradePrice     AS tp               ON tp.orderId = o.id AND tp.companyId = ${companyId}
        
        JOIN Company        AS srcCompany       ON srcCompany.id = o.srcCompanyId
        JOIN Company        AS dstCompany       ON dstCompany.id = o.dstCompanyId

       WHERE ${typeQuery}
         AND ${partnerQuery}
         AND o.status = ${OrderStatus.ACCEPTED}

        GROUP BY ${groupByQuery}
    `;
    const priceMap = new Map<string, Price>();
    for (const price of prices) {
      priceMap.set(price.partnerCompanyRegistrationNumber, price);
    }

    // TODO: 수금/지급건 찾아서 차감

    return partners.map((p) => {
      const price = priceMap.get(p.companyRegistrationNumber);
      return {
        companyRegistrationNumber: p.companyRegistrationNumber,
        partnerNickName: p.partnerNickName,
        creditLimit: Number(p.creditLimit),
        totalPrice: price?.totalPrice || 0,
        price1: price?.price1 || 0,
        price2: price?.price2 || 0,
        price3: price?.price3 || 0,
        price4: price?.price4 || 0,
        price5: price?.price5 || 0,
        price6: price?.price6 || 0,
        price7: price?.price7 || 0,
      };
    });
  }
}
