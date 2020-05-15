import { Injectable } from '@nestjs/common';
import { CountryData } from './country-data.interfaces'
import axios from 'axios'

@Injectable()
export class CountryDataService {
    async getCountryData(countryCode: string): Promise<CountryData> {
        const response = await axios.get(this.buildUri(countryCode))
        const rawCountryData = response.data
        return {
            countryNames: {es: rawCountryData.translations.es, en: rawCountryData.name},
            population: rawCountryData.population,
            currencyCode: rawCountryData.currencies[0].code,
            neighborCountries: rawCountryData.borders,
            internetDomain: rawCountryData.topLevelDomain[0]
        }
    }

    buildUri(countryCode: string) {
        return 'https://restcountries.eu/rest/v2/alpha/' + countryCode
    }
}


