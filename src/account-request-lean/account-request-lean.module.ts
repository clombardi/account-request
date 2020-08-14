import { Module } from '@nestjs/common';
import { AccountRequestController } from './account-request-lean.controller';
import { AccountRequestService } from './account-request-lean.service';
import { MongooseModule } from '@nestjs/mongoose'
import { AccountRequestSchema } from './account-request-lean.interfaces';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'AccountRequest', schema: AccountRequestSchema }
    ])],
    controllers: [AccountRequestController],
    providers: [AccountRequestService]
})
export class AccountRequestLeanModule { }
