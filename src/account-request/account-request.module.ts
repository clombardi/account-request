import { Module } from '@nestjs/common';
import { AccountRequestController } from './account-request.controller';
import { AccountRequestService } from './account-request.service';
import { MongooseModule } from '@nestjs/mongoose'
import { AccountRequestSchema } from './interfaces/account-request.interfaces';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'AccountRequest', schema: AccountRequestSchema }
    ])],
    controllers: [AccountRequestController],
    providers: [AccountRequestService]
})
export class AccountRequestModule { }
