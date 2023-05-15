import { Prisma, PrismaClient } from '@prisma/client';
import * as Data from './data';

const prisma = new PrismaClient();

async function main() {
  await prisma.company.createMany({
    data: Data.COMPANY.map<Prisma.CompanyCreateManyInput>((values) => ({
      businessName: values[0],
      companyRegistrationNumber: values[1],
      phoneNo: values[2],
      faxNo: values[3],
      representative: values[4],
      invoiceCode: values[5],
    })),
  });

  await prisma.user.createMany({
    data: Data.USER.map<Prisma.UserCreateManyInput>((values) => ({
      companyId: values[0],
      name: values[1],
      username: values[2],
      password: '0000',
      email: values[3],
    })),
  });

  await prisma.paperDomain.createMany({
    data: Data.PAPER_DOMAIN.map((name) => ({ name })),
  });
  await prisma.manufacturer.createMany({
    data: Data.MANUFACTURER.map((name) => ({ name })),
  });
  await prisma.paperGroup.createMany({
    data: Data.PAPER_GROUP.map((name) => ({ name })),
  });
  await prisma.paperType.createMany({
    data: Data.PAPER_TYPE.map((name) => ({ name })),
  });

  Data.PRODUCT.forEach((product, i) => {
    const data = {
      paperDomainId:
        Data.PAPER_DOMAIN.findIndex((name) => name === product[0]) + 1,
      paperGroupId:
        Data.PAPER_GROUP.findIndex((name) => name === product[1]) + 1,
      paperTypeId: Data.PAPER_TYPE.findIndex((name) => name === product[2]) + 1,
      manufacturerId:
        Data.MANUFACTURER.findIndex((name) => name === product[3]) + 1,
    };

    console.log(i, data);
  });

  await prisma.product.createMany({
    data: Data.PRODUCT.map((product) => ({
      paperDomainId:
        Data.PAPER_DOMAIN.findIndex((name) => name === product[0]) + 1,
      paperGroupId:
        Data.PAPER_GROUP.findIndex((name) => name === product[1]) + 1,
      paperTypeId: Data.PAPER_TYPE.findIndex((name) => name === product[2]) + 1,
      manufacturerId:
        Data.MANUFACTURER.findIndex((name) => name === product[3]) + 1,
    })),
  });
  await prisma.paperColorGroup.createMany({
    data: Data.PAPER_COLOR_GROUP.map((name) => ({ name })),
  });
  await prisma.paperColor.createMany({
    data: Data.PAPER_COLOR.map((name) => ({ name })),
  });
  await prisma.paperCert.createMany({
    data: Data.PAPER_CERT.map((name) => ({ name })),
  });
  await prisma.packaging.createMany({
    data: [
      {
        name: 'SKID',
        type: 'SKID',
        packA: 0,
        packB: 0,
      },
      ...Data.DIEMETER.map<Prisma.PackagingCreateInput>(([packA, packB]) => ({
        name: `ROLL ${packA} ${packB === 0 ? 'inch' : 'mm'}`,
        type: 'ROLL',
        packA,
        packB,
      })),
      ...Data.PER_PACKAGE.map<Prisma.PackagingCreateInput>(
        ([packA, packB]) => ({
          name: `BOX ${packA}×${packB}`,
          type: 'BOX',
          packA,
          packB,
        }),
      ),
      ...Data.PER_REAM.map<Prisma.PackagingCreateInput>(([packA, packB]) => ({
        name: `REAM ${packA}`,
        type: 'REAM',
        packA,
        packB,
      })),
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
