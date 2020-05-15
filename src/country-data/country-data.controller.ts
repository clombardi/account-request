import { Controller, Get, Param } from '@nestjs/common';
import { CountryDataService } from './country-data.service'
import { CountryData } from './country-data.interfaces';

@Controller('country-data')
export class CountryDataController {
    constructor(private readonly service: CountryDataService) { }

    @Get(':countryCode/description')
    async getCountryDescription(@Param() params: {countryCode: string}): Promise<string> {
        const countryData: CountryData = await this.service.getCountryData(params.countryCode)
        return `País: ${countryData.countryNames.es}  - Población: ${countryData.population}` + 
            `  - código de la moneda: ${countryData.currencyCode}  - dominio Internet: ${countryData.internetDomain}` +
            `  - limita con ${countryData.neighborCountries.length} países`
    }

}
