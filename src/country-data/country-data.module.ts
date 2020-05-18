import { Module } from '@nestjs/common';
import { CountryDataService } from './country-data.service'
import { CountryDataController } from './country-data.controller'
import { CurrencyModule } from '../currencies/currencies.module';

@Module({
    controllers: [CountryDataController],
    providers: [CountryDataService],
    imports: [CurrencyModule]
})
export class CountryDataModule { }
