import { Controller, Get, Param } from '@nestjs/common';
import { CountryDataService } from './country-data.service'
import { 
    CountryRawData, CountryShortSummary, CountryExtendedData, CountryLongSummary, 
    NeighborDataInLongSummary
} from './country-data.interfaces';
import * as _ from 'lodash'

@Controller('country-data')
export class CountryDataController {
    constructor(private readonly service: CountryDataService) { }

    @Get(':countryCode/textDescription')
    async getTextDescription(@Param() params: {countryCode: string}): Promise<string> {
        const countryData: CountryRawData = await this.service.getRawData(params.countryCode)
        return `País: ${countryData.countryNames.es}  - Población: ${countryData.population}` + 
            `  - código de la moneda: ${countryData.currency.code}  - dominio Internet: ${countryData.internetDomain}` +
            `  - limita con ${countryData.neighborCountryCodes.length} países`
    }

    @Get(':countryCode/shortSummary')
    async getShortSummary(@Param() params: { countryCode: string }): Promise<CountryShortSummary> {
        const countryData: CountryRawData = await this.service.getRawData(params.countryCode)
        return { 
            countryCode: countryData.countryCode,
            countryName: countryData.countryNames.es,
            population: countryData.population,
            currencyCode: countryData.currency.code,
            neighborCountryCount: countryData.neighborCountryCodes.length,
            internetDomain: countryData.internetDomain
        }
    }

    @Get(':countryCode/longSummary')
    async getLongSummary(@Param() params: { countryCode: string }): Promise<CountryLongSummary> {
        const transformNeighbor: ((rawData: CountryRawData) => NeighborDataInLongSummary) = 
            (rawData) => Object.assign(
                {}, _.pick(rawData, "countryCode", "population"), 
                { countryName: rawData.countryNames.es}
            )
        const countryData: CountryExtendedData = await this.service.getExtendedData(params.countryCode)
        return {
            countryCode: countryData.countryCode,
            countryName: countryData.countryNames.es,
            population: countryData.population,
            currency: _.pick(countryData.currency, ["code", "name", "byUSD"]),
            internetDomain: countryData.internetDomain,
            neighbors: countryData.neighbors.map(neighborData => transformNeighbor(neighborData)),
            totalNeighborPopulation: _.sumBy(countryData.neighbors, neighborData => neighborData.population)
        }
    }

}
