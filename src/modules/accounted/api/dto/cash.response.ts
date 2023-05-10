import { Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { PaidByCashItemResponse } from "src/@shared/api";

export class PaidCashResponse implements PaidByCashItemResponse {
  @IsNumber()
  readonly partnerId: number;

  @IsString()
  readonly partnerNickName: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedDate: string;

  @IsString()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;
}
