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
        const neighborData = await Promise.all(rawData.neighborCountryCodes.map(code => this.getRawData(code)))
        return {...rawData, currency: {...rawData.currency, byUSD: usdRate}, neighbors: neighborData}
    }
    
    buildUri(countryCode: string) {
        return 'https://restcountries.eu/rest/v2/alpha/' + countryCode
    }
}


