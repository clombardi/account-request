import { CovidDto } from "../covid-data/covid-data.interfaces";
import { ApiProperty } from "@nestjs/swagger";
import { stdDateFormat } from "src/dates/dates.constants";

export interface CountryRawData {
    countryCode: string,
    countryIso2Code: string,
    countryNames: { es: string, en: string },
    population: number,
    currency: {code: string, name: string, symbol: string},
    internetDomain: string
    neighborCountryCodes: string[],
}

export interface CountryExtendedData extends CountryRawData {
    currency: { code: string, name: string, symbol: string, byUSD: number },
    neighbors: CountryRawData[]
}


export class CountryBasicData {
    @ApiProperty({ description: 'ISO-3 code of the country', example: 'ARG', type: 'string' })
    countryCode: string

    @ApiProperty({ description: 'Country name in Spanish', example: 'Argentina', type: 'string' })
    countryName: string

    @ApiProperty({ description: 'Country population as of recent estimate', example: 45200000, type: 'number' })
    population: number
}

class CountryBasicDataPlusInternet extends CountryBasicData {
    @ApiProperty({ description: 'Main internet domain assigned to this country', example: '.ar', type: 'string' })
    internetDomain: string
}

export class CountryShortSummary extends CountryBasicDataPlusInternet {
    @ApiProperty({ description: 'ISO code of the main currency of the country', example: 'ARS', type: 'string' })
    currencyCode: string

    @ApiProperty({ description: 'How many neighbors has this country', example: 5, type: 'number' })
    neighborCountryCount: number
}


// class CurrencyDescription {
//     @ApiProperty({ description: 'Currency ISO code', example: 'ARS', type: 'string' })
//     code: string
//     @ApiProperty({ description: 'Currency name', example: 'Peso argentino', type: 'string' })
//     name: string 
//     @ApiProperty({ description: 'Rate in units for one US Dollar', example: 82.50, type: 'number' })
//     byUSD: number
// }

export class CountryLongSummary extends CountryBasicDataPlusInternet {
    @ApiProperty({ 
        description: 'Data about the main currency of the country', 
        // type: CurrencyDescription
        properties: { 
            code: {description: 'Currency ISO code', example: 'ARS', type: 'string' },
            name: { description: 'Currency name', example: 'Peso argentino', type: 'string' },
            byUSD: { description: 'Rate in units for one US Dollar', example: 82.50, type: 'number' }
        }
    })
    currency: { code: string, name: string, byUSD: number }

    @ApiProperty({ 
        description: 'Data about the neighbor countries', isArray: true, type: CountryBasicData
    })
    neighbors: CountryBasicData[]

    @ApiProperty({ description: 'Sum of the population of the neighbors has this country', example: 280000000, type: 'number' })
    totalNeighborPopulation: number

    @ApiProperty({
        description: 'Last record of COVID-related information', required: false, 
        properties: {
            confirmed: { description: 'Total confirmed cases', example: 200000, type: 'number' },
            active: { description: 'Currently active cases', example: 45000, type: 'number' },
            recovered: { description: 'Persons that have been recovered from Covid', example: 152000, type: 'number' },
            deaths: { description: 'Persons dead of Covid', example: 3000, type: 'number' },
            date: { description: 'Covid report date', example: '2020-05-28', type: 'string', format: stdDateFormat }
        }
    })
    covid19LastRecord?: CovidDto
}

export interface CountryWithCovidDataDTO extends CountryShortSummary {
    covidData: CovidDto[]
}

export interface CountryInfoDTO {
    code: string,
    name: string,
    population: number,
    internetDomain: string
}

export interface CountryInfoWithCovidDataDTO extends CountryInfoDTO {
    covidData: CovidDto[]
}

export interface CountryInfo {
    code: string,
    names: { en: string, es: string },
    population: number,
    internetDomain: string,
    currencyCode: string
}
