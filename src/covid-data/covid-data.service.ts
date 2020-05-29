import { Injectable } from '@nestjs/common';
import axios from 'axios'
import * as _ from 'lodash'
import * as moment from 'moment';
import { CovidCountryIdentifier, CovidRecord, MaybeCovidRecord, MaybeCovidDto } from './covid-data.interfaces';
import { CountryDataService } from '../country-data/country-data.service';
import { stdDateFormat } from 'src/dates/dates.constants';

interface Covid19ApiCountryIdentifier {
    Country: string,
    ISO2: string,
    Slug: string
}

interface Covid19ApiRecord {
    "Country": string,
    "CountryCode": string,
    "Confirmed": number,
    "Deaths": number,
    "Recovered": number,
    "Active": number,
    "Date": string

}

@Injectable()
export class CovidDataService {
    constructor(private readonly countryDataService: CountryDataService) { }

    async getCountryCodes(): Promise<CovidCountryIdentifier[]> {
        const url = 'https://api.covid19api.com/countries'
        const covid19ApiData: Covid19ApiCountryIdentifier[] = (await axios.get(url)).data
        return covid19ApiData.map((countryId: Covid19ApiCountryIdentifier) => { return {
            countryName: countryId.Country,
            iso2Code: countryId.ISO2,
            slug: countryId.Slug
        } })
    }


    async getRecords(countryIso3Code: string): Promise<CovidRecord[]> {
        // must obtain the country slug.
        // this depends on the list of codes, and the iso2Code for the country
        const [ countryCodes, countryData ] = await Promise.all([ 
            this.getCountryCodes(), this.countryDataService.getRawData(countryIso3Code)
        ])
        const covid19ApiCountryId = countryCodes.find(
            countryId => countryId.iso2Code === countryData.countryIso2Code 
        ) as CovidCountryIdentifier
        const covid19ApiCountrySlug = covid19ApiCountryId.slug

        // now get and transform the records
        const countryDataUrl = `https://api.covid19api.com/total/country/${covid19ApiCountrySlug}`
        const covid19ApiData: Covid19ApiRecord[] = (await axios.get(countryDataUrl)).data
        return covid19ApiData.map((countryData) => { return {
            date: moment.utc(countryData.Date.substring(0,10), stdDateFormat),
            confirmed: countryData.Confirmed,
            active: countryData.Active,
            recovered: countryData.Recovered,
            deaths: countryData.Deaths
        }})
    }

    async getLastRecord(countryIso3Code: string): Promise<MaybeCovidRecord> {
        return _.last(await this.getRecords(countryIso3Code))
    }

    async getRecordsInDateRange(
        countryIso3Code: string, initialDate: moment.Moment, endDate: moment.Moment
    ): Promise<CovidRecord[]> {
        return (await this.getRecords(countryIso3Code)).filter(
            record => record.date.isBetween(initialDate, endDate)
        )
    }
}
