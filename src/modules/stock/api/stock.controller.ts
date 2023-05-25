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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockChangeService } from '../service/stock-change.service';
import {
  GetStockDto,
  StockCreateRequestDto,
  StockGroupListRequestDto,
  StockGroupQuantityQueryDto,
  StockListRequestDto,
} from './dto/stock.request';
import { ulid } from 'ulid';
import { StockRetriveService } from '../service/stock-retrive.service';
import {
  StockDetailResponse,
  StockGroupListResponse,
  StockListResponse,
} from 'src/@shared/api/stock/stock.response';
import { Util } from 'src/common';
import { Model } from 'src/@shared';

@Controller('/stock')
export class StockController {
  constructor(
    private readonly stockChangeService: StockChangeService,
    private readonly stockRetriveService: StockRetriveService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getStockList(
    @Request() req: AuthType,
    @Query() dto: StockListRequestDto,
  ): Promise<StockListResponse> {
    const stocks = await this.stockRetriveService.getStockList({
      companyId: req.user.companyId,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      packagingId: dto.packagingId,
      grammage: dto.grammage,
      sizeX: dto.sizeX,
      sizeY: dto.sizeY,
      paperColorGroupId: dto.paperColorGroupId,
      paperColorId: dto.paperColorId,
      paperPatternId: dto.paperPatternId,
      paperCertId: dto.paperCertId,
    });

    return {
      items: stocks.map(Util.serialize),
      total: stocks.length,
    };
  }

  @Get('/group')
  @UseGuards(AuthGuard)
  async getStockGroupList(
    @Request() req: AuthType,
    @Query() dto: StockGroupListRequestDto,
  ): Promise<StockGroupListResponse> {
    const { stockGroups, total } =
      await this.stockRetriveService.getStockGroupList(
        req.user.companyId,
        dto.skip,
        dto.take,
      );

    return {
      items: stockGroups.map((sg) => ({
        id: sg.stockGroupId,
        company: null,
        orderCompanyInfo: sg.partnerCompanyId
          ? {
              id: sg.partnerCompanyId,
              businessName: sg.partnerCompanyBusinessName,
              companyRegistrationNumber:
                sg.partnerCompanyCompanyRegistrationNumber,
              invoiceCode: sg.partnerCompanyInvoiceCode,
              representative: sg.partnerCompanyRepresentative,
              address: sg.partnerCompanyAddress,
              phoneNo: sg.partnerCompanyPhoneNo,
              faxNo: sg.partnerCompanyFaxNo,
              email: sg.partnerCompanyEmail,
              managedById: sg.partnerCompanyManagedById,
            }
          : null,
        orderInfo: sg.orderId
          ? {
              wantedDate: sg.wantedDate,
            }
          : null,
        warehouse: sg.warehouseId
          ? {
              id: sg.warehouseId,
              name: sg.warehouseName,
              code: sg.warehouseCode,
              isPublic: sg.warehouseIsPublic,
              address: sg.warehouseAddress,
              company: null,
            }
          : null,
        product: {
          id: sg.productId,
          paperDomain: {
            id: sg.paperDomainId,
            name: sg.paperDomainName,
          },
          paperGroup: {
            id: sg.paperGroupId,
            name: sg.paperGroupName,
          },
          manufacturer: {
            id: sg.manufacturerId,
            name: sg.manufacturerName,
          },
          paperType: {
            id: sg.paperTypeId,
            name: sg.paperTypeName,
          },
        },
        packaging: {
          id: sg.packagingId,
          type: sg.packagingType,
          packA: sg.packagingPackA,
          packB: sg.packagingPackB,
        },
        grammage: sg.grammage,
        sizeX: sg.sizeX,
        sizeY: sg.sizeY,
        paperColorGroup: sg.paperColorGroupId
          ? {
              id: sg.paperColorGroupId,
              name: sg.paperColorGroupName,
            }
          : null,
        paperColor: sg.paperColorId
          ? {
              id: sg.paperColorId,
              name: sg.paperColorName,
            }
          : null,
        paperPattern: sg.paperPatternId
          ? {
              id: sg.paperPatternId,
              name: sg.paperPatternName,
            }
          : null,
        paperCert: sg.paperCertId
          ? {
              id: sg.paperCertId,
              name: sg.paperCertName,
            }
          : null,
        orderStock: sg.orderStockId
          ? {
              id: sg.orderStockId,
              orderId: sg.orderId,
              dstLocation: {
                id: sg.dstLocationId,
                name: sg.dstLocationName,
                code: sg.dstLocationCode,
                isPublic: sg.dstLocationIsPublic,
                company: null,
                address: sg.dstLocationAddress,
              },
              warehouse: sg.osWarehouseId
                ? {
                    id: sg.osWarehouseId,
                    name: sg.osWarehouseName,
                    code: sg.osWarehouseCode,
                    isPublic: sg.osWarehouseIsPublic,
                    company: null,
                    address: sg.osWarehouseAddress,
                  }
                : null,
              product: {
                id: sg.orderStockProductId,
                paperDomain: {
                  id: sg.orderStockPaperDomainId,
                  name: sg.orderStockPaperDomainName,
                },
                paperGroup: {
                  id: sg.orderStockPaperGroupId,
                  name: sg.orderStockPaperGroupName,
                },
                manufacturer: {
                  id: sg.orderStockManufacturerId,
                  name: sg.orderStockManufacturerName,
                },
                paperType: {
                  id: sg.orderStockPaperTypeId,
                  name: sg.orderStockPaperTypeName,
                },
              },
              packaging: {
                id: sg.orderStockPackagingId,
                type: sg.orderStockPackagingType,
                packA: sg.orderStockPackagingPackA,
                packB: sg.orderStockPackagingPackB,
              },
              grammage: sg.orderStockGrammage,
              sizeX: sg.orderStockSizeX,
              sizeY: sg.orderStockSizeY,
              paperColorGroup: sg.orderStockPaperColorGroupId
                ? {
                    id: sg.orderStockPaperColorGroupId,
                    name: sg.orderStockPaperColorGroupName,
                  }
                : null,
              paperColor: sg.orderStockPaperColorId
                ? {
                    id: sg.orderStockPaperColorId,
                    name: sg.orderStockPaperColorName,
                  }
                : null,
              paperPattern: sg.orderStockPaperPatternId
                ? {
                    id: sg.orderStockPaperPatternId,
                    name: sg.orderStockPaperPatternName,
                  }
                : null,
              paperCert: sg.orderStockPaperCertId
                ? {
                    id: sg.orderStockPaperCertId,
                    name: sg.orderStockPaperCertName,
                  }
                : null,
              quantity: Math.abs(sg.orderStockQuantity),
              plan: sg.planId
                ? {
                    id: sg.planId,
                    planNo: sg.planNo,
                  }
                : null,
            }
          : null,
        totalQuantity: sg.totalQuantity,
        availableQuantity: sg.availableQuantity,
      })),
      total,
    };
  }

  /** 재고 상세 */
  @Get('/:stockId')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() dto: GetStockDto,
  ): Promise<StockDetailResponse> {
    const stock = await this.stockRetriveService.getStock(
      req.user.companyId,
      dto.stockId,
    );
    return Util.serialize(stock);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() dto: StockCreateRequestDto,
  ): Promise<any> {
    await this.stockChangeService.create(
      {
        serial: ulid(),
        warehouse: dto.warehouseId
          ? {
              connect: {
                id: dto.warehouseId,
              },
            }
          : undefined,
        company: {
          connect: {
            id: req.user.companyId,
          },
        },
        product: {
          connect: {
            id: dto.productId,
          },
        },
        grammage: dto.grammage,
        sizeX: dto.sizeX,
        sizeY: dto.sizeY || 0,
        packaging: {
          connect: {
            id: dto.packagingId,
          },
        },
        paperColorGroup: dto.paperColorGroupId
          ? {
              connect: {
                id: dto.paperColorGroupId,
              },
            }
          : undefined,
        paperColor: dto.paperColorId
          ? {
              connect: {
                id: dto.paperColorId,
              },
            }
          : undefined,
        paperPattern: dto.paperPatternId
          ? {
              connect: {
                id: dto.paperPatternId,
              },
            }
          : undefined,
        paperCert: dto.paperCertId
          ? {
              connect: {
                id: dto.paperCertId,
              },
            }
          : undefined,
      },
      {
        ...dto.stockPrice,
        stock: undefined,
      },
      dto.quantity,
    );
  }

  @Get('group/quantity')
  @UseGuards(AuthGuard)
  async getGroupItem(
    @Request() req: AuthType,
    @Query() dto: StockGroupQuantityQueryDto,
  ): Promise<Model.StockQuantity> {
    // TODO: 권한
    return await this.stockRetriveService.getStockGroupQuantity({
      warehouseId: dto.warehouseId,
      initialOrderId: dto.initialOrderId,
      productId: dto.productId,
      grammage: dto.grammage,
      sizeX: dto.sizeX,
      sizeY: dto.sizeY,
      packagingId: dto.packagingId,
      paperColorGroupId: dto.paperColorGroupId,
      paperColorId: dto.paperColorId,
      paperPatternId: dto.paperPatternId,
      paperCertId: dto.paperCertId,
    });
  }
}
