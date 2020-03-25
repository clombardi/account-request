import { Module } from '@nestjs/common';
import { AccountRequestController } from './account-request.controller';

@Module({
    controllers: [AccountRequestController],
})
export class AccountRequestModule { }
