import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryRawData, CountryExtendedData, CountryInfo } from './country-data.interfaces'
import { CurrencyService } from '../currencies/currencies.service';
import axios from 'axios'
import { NastyCountryException } from 'src/errors/customExceptions';

@Injectable()
export class CountryDataService {
    constructor(private readonly currencyService: CurrencyService) { }

    async getRawData(countryCode: string): Promise<CountryRawData> {
        if (countryCode === 'ZZZ') {
            throw new NastyCountryException("I just don't like the country ZZZ")
        }
        const externalSeviceData = (
            await axios.get(this.buildUri(countryCode))
            .catch(() => { throw new NotFoundException(`Country ${countryCode} unknown`) })
        ).data
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

    async getInfo(countryCode: string): Promise<CountryInfo> {
        const url = this.buildUri(countryCode)
        const externalServiceResponse = await axios.get(url)
        const externalServiceData = externalServiceResponse.data
        return {
            code: countryCode,
            names: externalServiceData.translations,
            population: externalServiceData.population,
            internetDomain: externalServiceData.topLevelDomain[0],
            currencyCode: externalServiceData.currencies[0].code
        }
    }

    buildUri(countryCode: string) {
        return 'https://restcountries.eu/rest/v2/alpha/' + countryCode
    }
}


