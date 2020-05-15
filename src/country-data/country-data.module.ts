import { Module } from '@nestjs/common';
import { CountryDataService } from './country-data.service'
import { CountryDataController } from './country-data.controller'

@Module({
    controllers: [CountryDataController],
    providers: [CountryDataService]
})
export class CountryDataModule { }
