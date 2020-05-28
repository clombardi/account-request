import * as moment from 'moment';

export interface CovidCountryIdentifier {
    countryName: string,
    iso2Code: string,
    slug: string
}

interface CovidNumbers {
    confirmed: number,
    active: number,
    recovered: number,
    deaths: number
}

export interface CovidRecord extends CovidNumbers {
    date: moment.Moment
}

export interface CovidDto extends CovidNumbers {
    date: string
}

export type MaybeCovidRecord = CovidRecord | undefined

export type MaybeCovidDto = CovidDto | undefined