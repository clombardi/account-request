import { Controller, Get, Param } from '@nestjs/common';
import * as _ from 'lodash'
import { CountryDataService } from './country-data.service'
import { 
    CountryRawData, CountryShortSummary, CountryExtendedData, CountryLongSummary, 
    NeighborDataInLongSummary
} from './country-data.interfaces';
import { MaybeCovidRecord } from 'src/covid-data/covid-data.interfaces';
import { CovidDataService } from 'src/covid-data/covid-data.service';

@Controller('countries')
export class CountryDataController {
    constructor(
        private readonly service: CountryDataService,
        private readonly covidDataService: CovidDataService
    ) { }

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
                { countryName: rawData.countryNames.es }
            )
        const [countryData, covidData] = await Promise.all <CountryExtendedData, MaybeCovidRecord> ([
            this.service.getExtendedData(params.countryCode),
            this.covidDataService.getLastRecord(params.countryCode)
        ])
        const result: CountryLongSummary = {
            countryCode: countryData.countryCode,
            countryName: countryData.countryNames.es,
            population: countryData.population,
            currency: _.pick(countryData.currency, ["code", "name", "byUSD"]),
            internetDomain: countryData.internetDomain,
            neighbors: countryData.neighbors.map(neighborData => transformNeighbor(neighborData)),
            totalNeighborPopulation: _.sumBy(countryData.neighbors, neighborData => neighborData.population)
        }
        if (covidData) { result.covid19LastRecord = covidData }
        return result
    }

}
