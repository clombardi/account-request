import { Controller, Get, Param, Query } from '@nestjs/common';
import * as _ from 'lodash'
import * as moment from 'moment';
import { CountryDataService } from './country-data.service'
import { 
    CountryRawData, CountryShortSummary, CountryExtendedData, CountryLongSummary, 
    NeighborDataInLongSummary,
    CountryWithCovidDataDTO
} from './country-data.interfaces';
import { MaybeCovidRecord, CovidRecord, CovidDto } from 'src/covid-data/covid-data.interfaces';
import { CovidDataService } from 'src/covid-data/covid-data.service';

function transformCountryRawDataIntoShortSummary(countryRawData: CountryRawData): CountryShortSummary {
    return {
        countryCode: countryRawData.countryCode,
        countryName: countryRawData.countryNames.es,
        population: countryRawData.population,
        currencyCode: countryRawData.currency.code,
        neighborCountryCount: countryRawData.neighborCountryCodes.length,
        internetDomain: countryRawData.internetDomain
    }
}

function transformCovidRecordIntoCovidDto(covidData: CovidRecord): CovidDto {
    return {...covidData, date: covidData.date.format("YYYY-MM-DD") }     
}

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
    async getShortSummaryEndpoint(@Param() params: { countryCode: string }): Promise<CountryShortSummary> {
        return await this.getShortSummary(params.countryCode)
    }

    async getShortSummary(countryCode: string): Promise<CountryShortSummary> {
        const countryData: CountryRawData = await this.service.getRawData(countryCode)
        return transformCountryRawDataIntoShortSummary(countryData)
    }

    @Get(':countryCode/longSummary')
    async getLongSummary(@Param() params: { countryCode: string }): Promise<CountryLongSummary> {
        const transformNeighbor: ((rawData: CountryRawData) => NeighborDataInLongSummary) = 
            (rawData) => Object.assign(
                {}, _.pick(rawData, ["countryCode", "population"]), 
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
        if (covidData) { 
            result.covid19LastRecord = transformCovidRecordIntoCovidDto(covidData)
        }
        return result
    }

    @Get(':countryCode/neighbors')
    async getNeighborsShortSummary(@Param() params: { countryCode: string }): Promise<CountryShortSummary[]> {
        return (await this.service.getDataAboutNeighbors(params.countryCode)).map(
            countryRawData => transformCountryRawDataIntoShortSummary(countryRawData)
        )
    }

    @Get(':countryCode/covid')
    async getCovidData(
        @Param('countryCode') countryCode: string, 
        @Query('fromDate') fromDate: string,  @Query('toDate') toDate: string
    ): Promise<CountryWithCovidDataDTO> {
        const initialDate: moment.Moment = moment.utc(fromDate)
        const endDate: moment.Moment = moment.utc(toDate)
        const [countryShortSummary, covidRawData] = await Promise.all<CountryShortSummary, CovidRecord[]>([
            this.getShortSummary(countryCode),
            this.covidDataService.getRecordsInDateRange(countryCode, initialDate, endDate)
        ])
        const transformedCovidRecords = covidRawData.map(
            covidRawRecord => transformCovidRecordIntoCovidDto(covidRawRecord)
        )
        return { ...countryShortSummary, covidData: transformedCovidRecords }
    }
}
