import { Module, forwardRef } from '@nestjs/common';
import { CountryDataService } from './country-data.service'
import { CountryDataController } from './country-data.controller'
import { CurrencyModule } from '../currencies/currencies.module';
import { CovidDataModule } from 'src/covid-data/covid-data.module';

@Module({
    controllers: [CountryDataController],
    providers: [CountryDataService],
    exports: [CountryDataService],
    imports: [CurrencyModule, forwardRef(() => CovidDataModule)]
})
export class CountryDataModule { }
