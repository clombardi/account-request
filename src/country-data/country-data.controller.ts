import { Controller, Get, Param, Query, UseFilters, UseGuards, UseInterceptors, Headers, Req, NotAcceptableException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash'
import * as moment from 'moment';
import * as accepts from 'accepts';
import { CountryDataService } from './country-data.service'
import { 
    CountryRawData, CountryShortSummary, CountryExtendedData, CountryLongSummary, 
    CountryWithCovidDataDTO,
    CountryInfoDTO,
    CountryInfo,
    CountryInfoWithCovidDataDTO,
    CountryBasicData
} from './country-data.interfaces';
import { MaybeCovidRecord, CovidRecord, CovidDto } from 'src/covid-data/covid-data.interfaces';
import { CovidDataService } from 'src/covid-data/covid-data.service';
import { stdDateFormat } from 'src/dates/dates.constants';
import { BadBadCountryExceptionFilter } from 'src/errors/particularExceptionFilters';
import { BadBadCountryException } from 'src/errors/customExceptions';
import { ForbidDangerousCountries } from './middleware/country-data.guards';
import { SumPopulationSmartInterceptor, SumPopulationInterceptor } from './middleware/country-data.interceptors';
import { ApiTags, ApiHeader, ApiResponse, ApiExtraModels, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

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
    return {...covidData, date: covidData.date.format(stdDateFormat) }     
}


class CountryRepresentation {
    constructor(private readonly _id, private readonly _resolver) {}

    id() { return this._id; }
    type() { return `application/vnd.bdsol.${this._id}+json`; }
    applies(request): boolean { 
        return !!(accepts(request).type([this.type()]))
    }
    resolve(controller: CountryDataController, countryCode: string) { return this._resolver(controller, countryCode) }
}

const countryRepresentations = [
    new CountryRepresentation(
        "countryShortSummary", 
        (controller: CountryDataController, countryCode: string) => controller.getShortSummaryEndpoint({ countryCode })
    ), 
    new CountryRepresentation(
        "countryTextDescription",
        (controller: CountryDataController, countryCode: string) => controller.getTextDescription({ countryCode })
    ), 
    new CountryRepresentation(
        "countryLongSummary",
        (controller: CountryDataController, countryCode: string) => controller.getLongSummary({ countryCode })
    )
]

@ApiTags('Countries')
@ApiExtraModels(CountryLongSummary, CountryShortSummary)
@Controller('countries')
// @UseInterceptors(new SumPopulationSmartInterceptor())
export class CountryDataController {
    readonly countryDataService: CountryDataService

    constructor(
        private readonly service: CountryDataService,
        private readonly covidDataService: CovidDataService
    ) { 
        this.countryDataService = service
    }

    @ApiHeader({
        name: 'Accept',
        description: 'Desired response representation',
        enum: [
            'application/vnd.bdsol.countryShortSummary+json',
            'application/vnd.bdsol.countryTextDescription+json',
            'application/vnd.bdsol.countryLongSummary+json'
        ] 
    })
    // @ApiResponse({ status: HttpStatus.OK, description: 'short summary', type: CountryShortSummary })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data delivered', type: CountryLongSummary })
    // @ApiResponse({ status: HttpStatus.OK, description: 'text description', type: 'string' })
    @ApiOperation({ description: 'Get data about a specific country, representation can be chosen among several options'})
    @Get(':countryCode')
    async getCountryData(@Headers() headers, @Req() request, @Param("countryCode") countryCode: string): Promise<any> {
        const representation = countryRepresentations.find(repr => repr.applies(request));
        if (representation) {
            return representation.resolve(this, countryCode);
        } else {
            throw new NotAcceptableException('I cannot handle the requested representation');
        }
    }

    @Get(':countryCode/textDescription')
    async getTextDescription(@Param() params: {countryCode: string}): Promise<string> {
        const countryData: CountryRawData = await this.service.getRawData(params.countryCode)
        return `País: ${countryData.countryNames.es}  - Población: ${countryData.population}` + 
            `  - código de la moneda: ${countryData.currency.code}  - dominio Internet: ${countryData.internetDomain}` +
            `  - limita con ${countryData.neighborCountryCodes.length} países`
    }

    @ApiHeader({
        name: 'userId',
        description: 'Id of the user who makes the request'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data delivered', type: CountryShortSummary })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'Info about a very bad country is requested' })
    @ApiOperation({ description: 'Get limited data about a specific country' })
    @UseFilters(BadBadCountryExceptionFilter)
    @UseGuards(ForbidDangerousCountries)
    @Get(':countryCode/shortSummary')
    async getShortSummaryEndpoint(@Param() params: { countryCode: string }): Promise<CountryShortSummary> {
        if (params.countryCode === 'PRK') {
            throw new BadBadCountryException()
        }
        return await this.getShortSummary(params.countryCode)
    }


    @Get('/many/:countryCodes/shortSummary')
    async getManyCountriesShortSummary(@Param("countryCodes") countryCodes: string): Promise<CountryShortSummary[]> {
        const countryCodeList: string[] = countryCodes.split(",")
        return Promise.all(countryCodeList.map(countryCode => this.getShortSummary(countryCode)))
    }

    @Get(':countryCode/info')
    async getInfo(@Param("countryCode") countryCode: string): Promise<CountryInfoDTO> {
        const serviceData: CountryInfo = await this.service.getInfo(countryCode)
        return Object.assign({}, 
            _.pick(serviceData, ['code', 'population', 'internetDomain']), 
            { name: serviceData.names.es }
        )
    }

    async getShortSummary(countryCode: string): Promise<CountryShortSummary> {
        const countryData: CountryRawData = await this.service.getRawData(countryCode)
        return transformCountryRawDataIntoShortSummary(countryData)
    }

    @ApiTags('Countries + Covid')
    @ApiOkResponse({ description: 'Data delivered', type: CountryLongSummary })
    @ApiOperation({ description: 'Get extended data about a specific country, including the last available Covid record' })
    @Get(':countryCode/longSummary')
    async getLongSummary(@Param() params: { countryCode: string }): Promise<CountryLongSummary> {
        const transformNeighbor: ((rawData: CountryRawData) => CountryBasicData) = 
            (rawData) => Object.assign(
                {}, _.pick(rawData, ["countryCode", "population"]), 
                { countryName: rawData.countryNames.es }
            )
        // const getCovidLastRecord: () => Promise<MaybeCovidRecord> = async () => {
        //     try {
        //         return await this.covidDataService.getLastRecord(params.countryCode)
        //     } catch (err) {
        //         return undefined
        //     }
        // }
        const [countryData, covidData] = await Promise.all <CountryExtendedData, MaybeCovidRecord> ([
            this.service.getExtendedData(params.countryCode),
            // getCovidLastRecord()
            this.covidDataService.getLastRecord(params.countryCode).catch(() => undefined)
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

    @ApiTags('Countries + Covid')
    @Get(':countryCode/infoWithCovid')
    async getInfoWithCovid(@Param("countryCode") countryCode: string): Promise<CountryInfoWithCovidDataDTO> {
        const [countryData, covidData] = await Promise.all<CountryInfo, CovidRecord | undefined>([
            this.countryDataService.getInfo(countryCode),
            this.covidDataService.getLastRecord(countryCode).catch(() => undefined)
        ])
        return Object.assign({},
            _.pick(countryData, ['code', 'population', 'internetDomain']),
            { name: countryData.names.es },
            { covidData: [] }
        )
    }

    async getCovidLastRecord(countryCode: string): Promise<MaybeCovidRecord> {
        try {
            return await this.covidDataService.getLastRecord(countryCode)
        } catch (err) {
            return undefined
        }
    }


    @Get(':countryCode/neighbors')
    @UseInterceptors(new SumPopulationInterceptor())
    async getNeighborsShortSummary(@Param() params: { countryCode: string }): Promise<CountryShortSummary[]> {
        return (await this.service.getDataAboutNeighbors(params.countryCode)).map(
            countryRawData => transformCountryRawDataIntoShortSummary(countryRawData)
        )
    }

    @ApiTags('Countries + Covid')
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
