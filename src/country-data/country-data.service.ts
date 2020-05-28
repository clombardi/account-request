import { Injectable } from '@nestjs/common';
import { CountryRawData, CountryExtendedData } from './country-data.interfaces'
import { CurrencyService } from '../currencies/currencies.service';
import axios from 'axios'

@Injectable()
export class CountryDataService {
    constructor(private readonly currencyService: CurrencyService) { }

    async getRawData(countryCode: string): Promise<CountryRawData> {
        const externalSeviceData = (await axios.get(this.buildUri(countryCode))).data
        return {
            countryCode,
            countryIso2Code: externalSeviceData.alpha2Code,
            countryNames: externalSeviceData.translations,
            population: externalSeviceData.population,
            currency: externalSeviceData.currencies[0],
            neighborCountryCodes: externalSeviceData.borders,
            internetDomain: externalSeviceData.topLevelDomain[0]
        }
    }

    async getExtendedData(countryCode: string): Promise<CountryExtendedData> {
        const rawData = await this.getRawData(countryCode)
        const usdRate: number = await this.currencyService.conversionToUSD(rawData.currency.code)
        const neighborData = await this.getRawDataAboutMultipleCountries(rawData.neighborCountryCodes)
        return {...rawData, currency: {...rawData.currency, byUSD: usdRate}, neighbors: neighborData}
    }
    
    async getDataAboutNeighbors(countryCode: string): Promise<CountryRawData[]> {
        const rawData = await this.getRawData(countryCode)
        return await this.getRawDataAboutMultipleCountries(rawData.neighborCountryCodes)
    }

    getRawDataAboutMultipleCountries(countryCodes: string[]): Promise<CountryRawData[]> {
        return Promise.all(countryCodes.map(code => this.getRawData(code)))
    }

    buildUri(countryCode: string) {
        return 'https://restcountries.eu/rest/v2/alpha/' + countryCode
    }
}


