import { Module } from "@nestjs/common";
import { AccountRequestModule } from "src/account-request/account-request.module";
import { AccountRequestUntypedService } from "./account-request-untyped.service";
import { AccountRequestUntypedController } from './account-request-untyped.controller';

@Module({
    imports: [AccountRequestModule],
    controllers: [AccountRequestUntypedController],
    providers: [AccountRequestUntypedService]
})
export class AccountRequestUntypedModule { }
