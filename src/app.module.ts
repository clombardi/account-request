import { Module } from '@nestjs/common';
import { AccountApplicationModule } from './account-application/account-application.module';
import { MongooseModule } from '@nestjs/mongoose'
import { CountryDataModule } from './country-data/country-data.module';
import { DateModule } from './dates/dates.module';

@Module({
  imports: [
    AccountApplicationModule, 
    MongooseModule.forRoot(
      'mongodb://localhost/accountApplicationJs', { useNewUrlParser: true, useUnifiedTopology: true }
    ),
    CountryDataModule,
    DateModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
