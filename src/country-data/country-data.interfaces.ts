import { CovidRecord } from "../covid-data/covid-data.interfaces";

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

export interface CountryShortSummary {
    countryCode: string,
    countryName: string,
    population: number,
    currencyCode: string,
    neighborCountryCount: number,
    internetDomain: string
}

export interface CountryLongSummary {
    countryCode: string,
    countryName: string,
    population: number,
    currency: { code: string, name: string, byUSD: number },
    internetDomain: string  
    neighbors: NeighborDataInLongSummary[],
    totalNeighborPopulation: number,
    covid19LastRecord?: CovidRecord
}

export interface NeighborDataInLongSummary {
    countryCode: string,
    countryName: string,
    population: number
}