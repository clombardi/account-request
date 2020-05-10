import { Module } from '@nestjs/common';
import { AccountApplicationController } from './account-application.controller';
import { AccountApplicationService } from './account-application.service';
import { MongooseModule } from '@nestjs/mongoose'
import { AccountApplicationSchema } from './interfaces/account-application.interfaces';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'AccountApplication', schema: AccountApplicationSchema }
    ])],
    controllers: [AccountApplicationController],
    providers: [AccountApplicationService]
})
export class AccountApplicationModule { }
