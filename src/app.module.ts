import { Module } from '@nestjs/common';
import { AccountRequestModule } from './account-request/account-request.module';
import { MongooseModule } from '@nestjs/mongoose'
import { CountryDataModule } from './country-data/country-data.module';
import { DateModule } from './dates/dates.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AccountRequestUntypedModule } from './account-request-untyped/account-request-untyped.module';
import { AccountRequestLeanModule } from './account-request-lean/account-request-lean.module';

@Module({
  imports: [
    AccountRequestModule, 
    AccountRequestUntypedModule,
    AccountRequestLeanModule,
    MongooseModule.forRoot(
      'mongodb://localhost/accountRequestJs', { useNewUrlParser: true, useUnifiedTopology: true }
    ),
    CountryDataModule,
    DateModule,
    ExpensesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
